
export function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
  return Math.floor(diff / 3600000) + ' hrs ago';
}
