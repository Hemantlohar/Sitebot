import * as cheerio from "cheerio";
import { isSafeUrl } from "./ssrfProtection";

const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2 MB maximum HTML response size
const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Safely fetches a website while strictly defending against SSRF,
 * DNS-rebinding, infinite redirects, slow connections, and memory exhaustion.
 */
export async function crawlWebsite(targetUrl: string): Promise<string> {
  let currentUrl = targetUrl;
  let response: Response | null = null;
  let redirects = 0;

  while (redirects <= MAX_REDIRECTS) {
    const isSafe = await isSafeUrl(currentUrl);
    if (!isSafe) {
      throw new Error(`SSRF blocked: Destination address is unsafe (${currentUrl})`);
    }

    try {
      response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AIBotBuilderCrawler/1.0; +https://example.com/bot)",
          Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
        },
        redirect: "manual", // Do NOT follow redirects automatically to prevent redirect bypass
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "TimeoutError") {
        throw new Error("Website request timed out after 10 seconds.");
      }
      const message = err instanceof Error ? err.message : "Connection error";
      throw new Error(`Failed to connect to website: ${message}`);
    }

    // Handle manual redirects safely
    if (
      response.status === 301 ||
      response.status === 302 ||
      response.status === 303 ||
      response.status === 307 ||
      response.status === 308
    ) {
      redirects++;
      if (redirects > MAX_REDIRECTS) {
        throw new Error("Too many redirects encountered while fetching website.");
      }

      const location = response.headers.get("location");
      if (!location) {
        throw new Error(`Redirect status ${response.status} returned without Location header.`);
      }

      // Resolve relative redirect URLs against the current URL
      try {
        currentUrl = new URL(location, currentUrl).toString();
      } catch {
        throw new Error(`Invalid redirect URL: ${location}`);
      }

      continue;
    }

    break;
  }

  if (!response || !response.ok) {
    throw new Error(
      `Failed to load website: HTTP ${response?.status || "unknown"}`
    );
  }

  // Verify Content-Type is text/html or text/*
  const contentType = response.headers.get("content-type") || "";
  const isHtmlOrText =
    contentType.includes("text/html") ||
    contentType.includes("text/plain") ||
    contentType.includes("application/xhtml+xml");

  if (contentType && !isHtmlOrText) {
    throw new Error(`Unsupported content type: ${contentType}. Only HTML pages can be analyzed.`);
  }

  // Stream reading with strict byte limit to prevent memory exhaustion (DoS)
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Unable to read website response body.");
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        totalBytes += value.length;
        if (totalBytes > MAX_RESPONSE_SIZE) {
          throw new Error("Website response exceeded 2 MB limit.");
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }

  const buffer = Buffer.concat(chunks);
  const html = buffer.toString("utf-8");

  if (!html.trim()) {
    throw new Error("Website returned empty content.");
  }

  const $ = cheerio.load(html);

  // Remove script, style, svg, noscript, and iframe tags before text extraction
  $("script, style, noscript, svg, iframe, link").remove();

  const title = $("title").text().trim();

  const description =
    $('meta[name="description"]').attr("content")?.trim() || "";

  const headings = $("h1,h2,h3")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .join(" ");

  const body = $("body").text().replace(/\s+/g, " ").trim();

  return `
Title: ${title}

Description: ${description}

Headings: ${headings}

${body}
  `.slice(0, 30000).trim();
}
