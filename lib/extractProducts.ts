export function extractProducts(content: string) {
  const products = [];

  const knownProducts = [
    "iPhone",
    "MacBook Air",
    "MacBook Pro",
    "iPad Air",
    "AirPods Pro",
    "Apple Watch"
  ];

  for (const product of knownProducts) {
    if (content.includes(product)) {
      products.push(product);
    }
  }

  return products;
}