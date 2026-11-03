export function truncateWithEllipsis(str, maxLength) {
  if (str == null || maxLength == null || maxLength < 4 || str.length <= maxLength) {
    return str ?? '';
  }
  return str.slice(0, maxLength - 3) + '...';
}