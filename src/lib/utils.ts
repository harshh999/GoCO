export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(
  amount: number,
  symbol: string = "$",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _currency: string = "USD"
): string {
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getPrimaryImage(
  images: Array<{ url: string; isPrimary: boolean; order: number }>
): string {
  if (!images || images.length === 0) return "/placeholder-product.svg";
  const primary = images.find((i) => i.isPrimary);
  if (primary) return primary.url;
  return (
    images.sort((a, b) => a.order - b.order)[0]?.url ??
    "/placeholder-product.svg"
  );
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}
