import { api, LightningElement } from 'lwc';
import { transformMediaContents } from './transformers';
import { generateStyleProperties } from 'experience/styling';
import { Labels } from './labels';
const DEFAULT_PRODUCT_IMAGE_URL = '/img/b2b/default-product-image.svg';
const DEFAULT_PRODUCT_MEDIA_GROUP = {
  mediaItems: [{
    alternateText: '',
    contentVersionId: '',
    id: '',
    mediaType: 'Image',
    sortOrder: 0,
    thumbnailUrl: '',
    title: 'image',
    url: '/img/b2b/default-product-image.svg'
  }],
  name: 'Product Detail Images',
  usageType: 'Standard',
  developerName: '',
  id: ''
};
const DEFAULT_PRODUCT_MEDIA_MATCHER = new RegExp(DEFAULT_PRODUCT_IMAGE_URL);
export default class ProductMediaGallery extends LightningElement {
  static renderMode = 'light';
  labels = Labels;
  @api
  productMediaGroups;
  @api
  selectOnHover = false;
  @api
  thumbnailPlacement;
  @api
  imageBorderColor;
  @api
  hoverThumbnailBorderColor;
  @api
  selectedThumbnailBorderColor;
  @api
  mobileIndicatorsColor;
  @api
  noProductImageText;
  @api
  imageAspectRatio;
  @api
  imageSize;
  @api
  disableZoom = false;
  get noProductImageTextString() {
    return this.noProductImageText || Labels.noProductImageText;
  }
  get isEmptyMedia() {
    return !this.media.length || this.media.some(item => this.isDefaultImage(item));
  }
  get showPlaceHolderText() {
    return this.isEmptyMedia && this.productMediaGroups !== undefined;
  }
  get isZoomDisabled() {
    return this.disableZoom || this.isEmptyMedia;
  }
  get media() {
    const transformedItems = this.productMediaGroups === undefined ? [] : this.productMediaGroups === null ? transformMediaContents([DEFAULT_PRODUCT_MEDIA_GROUP]) : transformMediaContents(this.productMediaGroups);
    const validMediaItems = transformedItems.filter(item => !this.isDefaultImage(item));
    return validMediaItems.length ? validMediaItems : transformedItems;
  }
  get aspectRatio() {
    const parsedAspectRatio = parseFloat(this.imageAspectRatio ?? '');
    return parsedAspectRatio && !Number.isNaN(parsedAspectRatio) ? parsedAspectRatio : 1;
  }
  get _customStyles() {
    return `
        ${generateStyleProperties({
      '--com-c-thumbnail-gallery-carousel-border-color': this.selectedThumbnailBorderColor || '',
      '--com-c-thumbnail-gallery-carousel-hover-border-color': this.hoverThumbnailBorderColor || '',
      '--com-c-thumbnail-gallery-product-image-border-color': this.imageBorderColor || '',
      '--com-c-image-aspect-ratio': this.aspectRatio,
      '--com-c-image-object-fit': this.imageSize || 'contain'
    })}
        `;
  }
  isDefaultImage(item) {
    return Boolean(item.fullUrl && DEFAULT_PRODUCT_MEDIA_MATCHER.test(item.fullUrl));
  }
}