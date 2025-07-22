import { api, LightningElement } from 'lwc';
import { createImageDataMap } from 'experience/picture';
import { resolve, resolveVideoUrl } from 'experience/resourceResolver';
const MEDIA_TYPE_VIDEO = 'Video';
export default class ProductMediaSlider extends LightningElement {
  static renderMode = 'light';
  activeItemIndex = 0;
  @api
  media;
  @api
  noProductImageText;
  @api
  showPlaceholder = false;
  @api
  indicatorsColor;
  @api
  primaryNavigation;
  @api
  showIcon = false;
  _imageSizes = {
    mobile: 300,
    tablet: 600,
    desktop: 800
  };
  get showIndicators() {
    return Boolean((this.media || []).length > 1);
  }
  get collection() {
    const media = this.media || [];
    const collection = media.map((item, index) => {
      const length = media.length;
      return {
        id: `${item.id}`,
        key: `media-gallery-slide-${item.id}`,
        data: {
          ...item,
          resolvedUrl: this.resolvedUrl(item),
          images: item.fullUrl ? createImageDataMap(item.fullUrl, this._imageSizes) : [],
          isVideo: item.mediaType === MEDIA_TYPE_VIDEO
        },
        isActive: index === this.activeItemIndex,
        slideTitle: `slide ${index + 1} of ${length}`
      };
    });
    return collection;
  }
  resolvedUrl(item) {
    const mediaFullUrl = item.fullUrl;
    if (mediaFullUrl) {
      if (item.mediaType === MEDIA_TYPE_VIDEO) {
        return resolveVideoUrl(mediaFullUrl);
      }
      return resolve(mediaFullUrl);
    }
    return '';
  }
  get resolvedPrimaryNavigation() {
    return this.primaryNavigation ?? 'none';
  }
  handleChangeActiveItemIndex(e) {
    const newActiveItemIndex = e.detail;
    this.activeItemIndex = newActiveItemIndex;
  }
}