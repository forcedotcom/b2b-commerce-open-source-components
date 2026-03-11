import { resolveWithoutImageOpt } from 'experience/resourceResolver';
export function transformMediaItems(product) {
  const mediaGroups = product && Array.isArray(product?.mediaGroups) ? product.mediaGroups : [];
  return mediaGroups.reduce((acc, group) => {
    if (group.usageType === 'Attachment') {
      const mediaItems = group?.mediaItems?.map?.(mediaItem => ({
        name: mediaItem.title,
        url: resolveWithoutImageOpt(mediaItem.url ?? '')
      }));
      mediaItems && acc.push(...mediaItems);
    }
    return acc;
  }, []);
}