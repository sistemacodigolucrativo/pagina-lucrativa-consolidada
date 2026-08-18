export function calculateResponsiveEbookScale(availableWidth: number, contentWidth: number) {
  if (!Number.isFinite(availableWidth) || !Number.isFinite(contentWidth) || availableWidth <= 0 || contentWidth <= 0) {
    return 1;
  }

  return Math.min(1, Math.max(0.15, availableWidth / contentWidth));
}
