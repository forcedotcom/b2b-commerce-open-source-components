export function transformMediaContents(mediaGroups) {
  return (mediaGroups || []).reduce((acc, group) => {
    if (group.usageType === 'Standard') {
      const mediaItems = group.mediaItems || [];
      mediaItems.forEach(item => {
        acc.push({
          alternativeText: item.alternateText || item.title,
          id: item.id,
          fullUrl: item.url,
          smallUrl: item.thumbnailUrl || item.url,
          mediaType: item.mediaType
        });
      });
    }
    return acc;
  }, []);
}