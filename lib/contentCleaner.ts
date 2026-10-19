export function cleanContent(text: string) {
  return text
    // remove extra spaces
    .replace(/\s+/g, " ")

    // remove navigation words
    .replace(/Learn More/gi, "")
    .replace(/Buy/gi, "")
    .replace(/Watch now/gi, "")
    .replace(/Play now/gi, "")
    .replace(/Stream now/gi, "")
    .replace(/Continue/gi, "")

    // remove footer words
    .replace(/Privacy/gi, "")
    .replace(/Legal/gi, "")
    .replace(/Cookies/gi, "")
    .replace(/Cookie Policy/gi, "")

    // remove duplicate blank lines
    .replace(/\n\s*\n/g, "\n")

    .trim();
}