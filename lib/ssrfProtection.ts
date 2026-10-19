import dns from "dns";
import { promisify } from "util";
import net from "net";

const dnsLookup = promisify(dns.lookup);

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "instance-data",
]);

const ALLOWED_PORTS = new Set(["80", "443", ""]);

/**
 * Checks if a given IP address belongs to a private, loopback, link-local,
 * multicast, or otherwise unsafe local network range.
 */
export function isPrivateIp(ip: string): boolean {
  // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1)
  const normalizedIp = ip.toLowerCase().trim();
  if (normalizedIp.startsWith("::ffff:")) {
    const ipv4Part = normalizedIp.slice(7);
    if (net.isIPv4(ipv4Part)) {
      return isPrivateIp(ipv4Part);
    }
  }

  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;
    const [a, b] = parts;

    // Current network: 0.0.0.0/8
    if (a === 0) return true;
    // Loopback: 127.0.0.0/8
    if (a === 127) return true;
    // Private Network (Class A): 10.0.0.0/8
    if (a === 10) return true;
    // Carrier-grade NAT: 100.64.0.0/10 (100.64.0.0 - 100.127.255.255)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // Private Network (Class B): 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // Link-local / Cloud Metadata: 169.254.0.0/16
    if (a === 169 && b === 254) return true;
    // IETF Protocol Assignments: 192.0.0.0/24
    if (a === 192 && b === 0) return true;
    // Private Network (Class C): 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // Benchmark / Testing: 198.18.0.0/15
    if (a === 198 && (b === 18 || b === 19)) return true;
    // Multicast: 224.0.0.0/4 (224 - 239)
    if (a >= 224 && a <= 239) return true;
    // Reserved / Future: 240.0.0.0/4
    if (a >= 240) return true;

    return false;
  } else if (net.isIPv6(ip)) {
    // Loopback: ::1
    if (normalizedIp === "::1" || normalizedIp === "0:0:0:0:0:0:0:1") return true;
    // Unspecified: ::
    if (normalizedIp === "::" || normalizedIp === "0:0:0:0:0:0:0:0") return true;
    // Link-local: fe80::/10 (fe80 - febf)
    if (
      normalizedIp.startsWith("fe8") ||
      normalizedIp.startsWith("fe9") ||
      normalizedIp.startsWith("fea") ||
      normalizedIp.startsWith("feb")
    ) {
      return true;
    }
    // Unique local address (ULA): fc00::/7 (fc00 - fdff)
    if (normalizedIp.startsWith("fc") || normalizedIp.startsWith("fd")) {
      return true;
    }
    // Multicast: ff00::/8
    if (normalizedIp.startsWith("ff")) return true;

    return false;
  }

  // Reject unrecognized format as unsafe
  return true;
}

/**
 * Validates a URL to ensure it uses safe schemes, safe ports, and points
 * to a verified public IP address.
 */
export async function isSafeUrl(urlStr: string): Promise<boolean> {
  try {
    const parsed = new URL(urlStr);

    // Only HTTP and HTTPS protocols are allowed
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    // Only allow standard web ports (80, 443, or default)
    if (!ALLOWED_PORTS.has(parsed.port)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase().trim();
    if (!hostname) {
      return false;
    }

    // Reject internal / cloud metadata hostnames
    if (
      BLOCKED_HOSTNAMES.has(hostname) ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".cluster.local")
    ) {
      return false;
    }

    // Check if the hostname is an IP literal
    if (net.isIP(hostname)) {
      return !isPrivateIp(hostname);
    }

    // Resolve domain name to all IP addresses
    const addresses = await dnsLookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      return false;
    }

    // Ensure ALL resolved IP addresses are public
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("SSRF validation failed for URL:", urlStr, error);
    return false;
  }
}
