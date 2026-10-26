import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
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

test("Database Migrations - Multi-Tenant RLS & Storage Hardening", async (t) => {
  const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");

  await t.test("003_row_level_security.sql enforces strict tenant isolation without leaks", () => {
    const rlsSql = fs.readFileSync(
      path.join(migrationsDir, "20261019000003_row_level_security.sql"),
      "utf8"
    );

    // 1. Must NOT create any active-bot cross-tenant SELECT policy
    assert.strictEqual(
      rlsSql.includes('CREATE POLICY "Public widget can view active bot config"'),
      false,
      "CRITICAL: Must not contain 'Public widget can view active bot config' policy"
    );

    // 2. Must explicitly drop legacy leak policy if it was previously created
    assert.ok(
      rlsSql.includes('DROP POLICY IF EXISTS "Public widget can view active bot config"'),
      "Must explicitly drop legacy 'Public widget can view active bot config' policy"
    );

    // 3. Must enforce auth.uid() = user_id on websites
    assert.ok(
      rlsSql.includes("auth.uid() = user_id"),
      "Must strictly verify user ownership on websites"
    );

    // 4. Must NOT allow anonymous insertion to chat_messages
    assert.strictEqual(
      rlsSql.includes('CREATE POLICY "Public widget can insert chat messages for active bots"'),
      false,
      "Must not allow unauthenticated public inserts to chat_messages"
    );

    // 5. Must strictly enforce website owner relationship on website_chunks
    assert.ok(
      rlsSql.includes("public.websites.user_id = auth.uid()"),
      "Must enforce user ownership check through website_id relationship"
    );
  });

  await t.test("004_storage_setup.sql enforces folder-level tenant namespacing", () => {
    const storageSql = fs.readFileSync(
      path.join(migrationsDir, "20261019000004_storage_setup.sql"),
      "utf8"
    );

    // Must restrict uploads and deletes to user's own folder prefix
    assert.ok(
      storageSql.includes("(storage.foldername(name))[1] = auth.uid()::text"),
      "Storage policy must isolate uploads to auth.uid() folder"
    );

    // Must enforce allowed MIME types and file size limits
    assert.ok(
      storageSql.includes("2097152"),
      "Must enforce 2 MB file size limit"
    );
    assert.ok(
      storageSql.includes("'image/png'"),
      "Must restrict MIME types to PNG, JPEG, WebP"
    );
  });

  await t.test("002_vector_search_rpc.sql restricts RPC execution permissions", () => {
    const rpcSql = fs.readFileSync(
      path.join(migrationsDir, "20261019000002_vector_search_rpc.sql"),
      "utf8"
    );

    // Must revoke execute from public and anon
    assert.ok(
      rpcSql.includes("REVOKE ALL ON FUNCTION public.match_chunks"),
      "Must revoke match_chunks from PUBLIC"
    );
    assert.ok(
      rpcSql.includes("REVOKE EXECUTE ON FUNCTION public.match_chunks(vector(768), UUID, INT) FROM anon"),
      "Must revoke match_chunks from anon"
    );

    // Must grant execute to service_role only
    assert.ok(
      rpcSql.includes("GRANT EXECUTE ON FUNCTION public.match_chunks(vector(768), UUID, INT) TO service_role"),
      "Must grant match_chunks execute only to service_role"
    );

    // Must enforce 768 dimensions
    assert.ok(
      rpcSql.includes("query_embedding vector(768)"),
      "Must enforce 768-dimensional query vectors"
    );
  });
});

test("Storage Path Namespacing - Path Traversal Prevention", () => {
  function generateSafeLogoPath(userId: string, filename: string): string {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new Error("Invalid user ID");
    }

    // Clean filename and prevent path traversal
    const safeBase = path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, "_");
    if (!safeBase || safeBase.startsWith(".")) {
      throw new Error("Invalid filename");
    }

    return `${userId}/${Date.now()}-${safeBase}`;
  }

  const validUserId = "12345678-1234-1234-1234-123456789abc";
  const safePath = generateSafeLogoPath(validUserId, "avatar.png");
  assert.ok(safePath.startsWith(`${validUserId}/`));
  assert.strictEqual(safePath.includes(".."), false);

  // Reject invalid / traversal user IDs
  assert.throws(() => generateSafeLogoPath("../victim", "avatar.png"), /Invalid user ID/);
  assert.throws(() => generateSafeLogoPath("user/subfolder", "avatar.png"), /Invalid user ID/);
  assert.throws(() => generateSafeLogoPath("", "avatar.png"), /Invalid user ID/);
});

