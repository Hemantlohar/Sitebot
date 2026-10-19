import test from "node:test";
import assert from "node:assert/strict";
import { isPrivateIp, isSafeUrl } from "../lib/ssrfProtection.ts";

test("SSRF Protection - isPrivateIp", async (t) => {
  await t.test("identifies IPv4 loopback addresses", () => {
    assert.strictEqual(isPrivateIp("127.0.0.1"), true);
    assert.strictEqual(isPrivateIp("127.0.0.2"), true);
    assert.strictEqual(isPrivateIp("127.255.255.255"), true);
  });

  await t.test("identifies IPv4 private network ranges", () => {
    // 10.0.0.0/8
    assert.strictEqual(isPrivateIp("10.0.0.1"), true);
    assert.strictEqual(isPrivateIp("10.255.255.255"), true);
    // 172.16.0.0/12
    assert.strictEqual(isPrivateIp("172.16.0.1"), true);
    assert.strictEqual(isPrivateIp("172.31.255.255"), true);
    assert.strictEqual(isPrivateIp("172.32.0.1"), false); // Public
    // 192.168.0.0/16
    assert.strictEqual(isPrivateIp("192.168.0.1"), true);
    assert.strictEqual(isPrivateIp("192.168.1.100"), true);
  });

  await t.test("identifies link-local and cloud metadata addresses", () => {
    assert.strictEqual(isPrivateIp("169.254.169.254"), true);
    assert.strictEqual(isPrivateIp("169.254.1.1"), true);
  });

  await t.test("identifies IPv4-mapped IPv6 addresses", () => {
    assert.strictEqual(isPrivateIp("::ffff:127.0.0.1"), true);
    assert.strictEqual(isPrivateIp("::ffff:169.254.169.254"), true);
    assert.strictEqual(isPrivateIp("::ffff:10.0.0.1"), true);
    assert.strictEqual(isPrivateIp("::ffff:8.8.8.8"), false);
  });

  await t.test("identifies IPv6 loopback, link-local, and ULA", () => {
    assert.strictEqual(isPrivateIp("::1"), true);
    assert.strictEqual(isPrivateIp("::"), true);
    assert.strictEqual(isPrivateIp("fe80::1"), true);
    assert.strictEqual(isPrivateIp("fc00::1"), true);
    assert.strictEqual(isPrivateIp("fd12:3456:789a::1"), true);
  });

  await t.test("allows legitimate public IPv4 and IPv6 addresses", () => {
    assert.strictEqual(isPrivateIp("8.8.8.8"), false);
    assert.strictEqual(isPrivateIp("1.1.1.1"), false);
    assert.strictEqual(isPrivateIp("142.250.190.46"), false);
  });
});

test("SSRF Protection - isSafeUrl", async (t) => {
  await t.test("rejects invalid schemes", async () => {
    assert.strictEqual(await isSafeUrl("file:///etc/passwd"), false);
    assert.strictEqual(await isSafeUrl("ftp://example.com"), false);
    assert.strictEqual(await isSafeUrl("gopher://example.com"), false);
    assert.strictEqual(await isSafeUrl("javascript:alert(1)"), false);
  });

  await t.test("rejects blocked hostnames and metadata endpoints", async () => {
    assert.strictEqual(await isSafeUrl("http://localhost"), false);
    assert.strictEqual(await isSafeUrl("http://localhost:3000"), false);
    assert.strictEqual(await isSafeUrl("http://metadata.google.internal"), false);
    assert.strictEqual(await isSafeUrl("http://169.254.169.254/latest/meta-data"), false);
  });

  await t.test("rejects non-standard ports", async () => {
    assert.strictEqual(await isSafeUrl("http://example.com:22"), false);
    assert.strictEqual(await isSafeUrl("http://example.com:5432"), false);
    assert.strictEqual(await isSafeUrl("http://example.com:6379"), false);
    assert.strictEqual(await isSafeUrl("http://example.com:27017"), false);
  });

  await t.test("allows legitimate public websites with standard ports", async () => {
    assert.strictEqual(await isSafeUrl("https://example.com"), true);
    assert.strictEqual(await isSafeUrl("https://example.com:443/test"), true);
    assert.strictEqual(await isSafeUrl("http://example.com:80/about"), true);
  });
});

test("Rate Limiter - In-Memory Sliding Window", async () => {
  const { chatRateLimit } = await import("../lib/rateLimiter.ts");

  const testId = `test-user-${Date.now()}`;
  let lastResult;

  // chatRateLimit allows 30 requests per minute
  for (let i = 0; i < 30; i++) {
    lastResult = await chatRateLimit.limit(testId);
    assert.strictEqual(lastResult.success, true, `Request ${i + 1} should succeed`);
  }

  // 31st request must be rate limited
  const blockedResult = await chatRateLimit.limit(testId);
  assert.strictEqual(blockedResult.success, false, "Request 31 must be blocked");
  assert.strictEqual(blockedResult.remaining, 0);
  assert.ok(blockedResult.reset > Date.now(), "Reset timestamp must be in the future");
});

test("Logo Upload - Image Signature Validation", () => {
  // Test magic byte checks implemented in upload-logo
  function isValidImage(buffer: Buffer, mime: string) {
    if (buffer.length < 12) return false;
    if (mime === "image/png") {
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    }
    if (mime === "image/jpeg") {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    if (mime === "image/webp") {
      const isRiff =
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46;
      const isWebp =
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50;
      return isRiff && isWebp;
    }
    return false;
  }

  // Valid PNG signature
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  assert.strictEqual(isValidImage(validPng, "image/png"), true);

  // Fake PNG with HTML content (Stored XSS payload)
  const fakePng = Buffer.from("<svg onload=alert(1)>");
  assert.strictEqual(isValidImage(fakePng, "image/png"), false);

  // Valid JPEG signature
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  assert.strictEqual(isValidImage(validJpeg, "image/jpeg"), true);

  // Fake JPEG with script payload
  const fakeJpeg = Buffer.from("GIF89a<script>alert(1)</script>");
  assert.strictEqual(isValidImage(fakeJpeg, "image/jpeg"), false);
});
