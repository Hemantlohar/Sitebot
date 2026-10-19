const HIGH_PRIORITY = [
  "iphone",
  "ipad",
  "macbook",
  "mac",
  "airpods",
  "watch",
  "vision",
  "services",
  "support",
];

const LOW_PRIORITY = [
  "privacy",
  "legal",
  "cookies",
  "cookie",
  "terms",
  "newsroom",
  "career",
  "jobs",
  "retail",
  "government",
  "shop/goto",
  "session",
  "signin",
  "login",
  "account",
  "search",
];

export function rankLinks(links: string[]) {
  return [...new Set(links)]
    .map((link) => {
      const url = link.toLowerCase();

      let score = 0;

      // Reward useful pages
      HIGH_PRIORITY.forEach((keyword) => {
        if (url.includes(keyword)) score += 20;
      });

      // Penalize useless pages
      LOW_PRIORITY.forEach((keyword) => {
        if (url.includes(keyword)) score -= 50;
      });

      // Homepage gets slight priority
      if (
        url.split("/").filter(Boolean).length <= 3
      ) {
        score += 5;
      }

      // Penalize anchors & query params
      if (url.includes("#")) score -= 10;
      if (url.includes("?")) score -= 5;

      return { link, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.link);
}