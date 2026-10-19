export function cleanWebsite(content: string) {
  let cleaned = content;

  // Remove extra spaces
  cleaned = cleaned.replace(/\s+/g, " ");

  // Remove multiple blank lines
  cleaned = cleaned.replace(/\n+/g, "\n");

  // Remove repeated menu items
  cleaned = cleaned.replace(/Item \d+/gi, "");

  // Remove region selector
  cleaned = cleaned.replace(
    /Choose another country or region.*?Continue/gi,
    ""
  );

  // Remove footer
  cleaned = cleaned.replace(
    /Apple Footer[\s\S]*/gi,
    ""
  );

  // Remove copyright
  cleaned = cleaned.replace(/Copyright.*$/gi, "");

  // Remove privacy links
  cleaned = cleaned.replace(/Privacy Policy/gi, "");
  cleaned = cleaned.replace(/Terms of Use/gi, "");

  return cleaned.trim();
}