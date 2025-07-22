import { api } from 'lwc';
import { LightningElement } from 'lwc';
import { resolve, resolveVideoUrl } from 'experience/resourceResolver';
import { createImageDataMap } from 'experience/picture';
import { debounce } from 'experience/utils';
const VERTICAL_THUMBNAIL_PLACEMENTS = ['left', 'right'];
const HORIZONTAL_INDICATOR_ICONS = ['utility:chevronleft', 'utility:chevronright'];
const VERTICAL_INDICATOR_ICONS = ['utility:chevronup', 'utility:chevrondown'];
const DEFAULT_ZOOM_LEVEL = 5;
const ZOOM_MINIMUM_WIDTH = 300;
const MEDIA_TYPES = {
  Image: 'Image',
  Video: 'Video'
};
const KEYBOARD_MOVE_STEP = 10;
export default class ProductThumbnailGallery extends LightningElement {
  static renderMode = 'light';
  _selectedIndex = 0;
  _resizeObserver;
  _isObservingSize = false;
  _media;
  _calculatedMedia = [];
  _currentLensPosition = null;
  _thumbnailImageSizes = {
    mobile: 100,
    tablet: 100,
    desktop: 200
  };
  _mainImageSizes = {
    mobile: 300,
    tablet: 600,
    desktop: 800
  };
  showNextPageIndicator = false;
  showPrevPageIndicator = false;
  isZoomVisible = false;
  @api
  zoomLevel;
  @api
  get media() {
    return this._media;
  }
  set media(val) {
    this._media = val;
    this._calculatedMedia = (this._media || []).map(media => {
      const updatedMedia = {
        ...media
      };
      if (media.mediaType === MEDIA_TYPES.Image) {
        updatedMedia.images = media.fullUrl ? createImageDataMap(media.fullUrl, this._mainImageSizes) : [];
      }
      return updatedMedia;
    });
  }
  @api
  get selectedIndex() {
    return this._selectedIndex;
  }
  @api
  thumbnailPlacement;
  @api
  imageBorderColor;
  @api
  hoverThumbnailBorderColor;
  @api
  selectedThumbnailBorderColor;
  @api
  selectOnHover = false;
  @api
  nextPageIndicatorAltText;
  @api
  prevPageIndicatorAltText;
  @api
  showPlaceholder = false;
  @api
  disableZoom = false;
  @api
  noProductImageText;
  get selectedImage() {
    const isValidIndex = this.selectedIndex >= 0 && this.selectedIndex < this._calculatedMedia.length;
    return isValidIndex ? this._calculatedMedia[this.selectedIndex] : this._calculatedMedia[0];
  }
  get placement() {
    return this.thumbnailPlacement ?? 'left';
  }
  get pageIndicatorIcons() {
    return this.isVerticalPlacement ? VERTICAL_INDICATOR_ICONS : HORIZONTAL_INDICATOR_ICONS;
  }
  get nextPageIndicatorIcon() {
    const [, nextIcon] = this.pageIndicatorIcons;
    return nextIcon;
  }
  get prevPageIndicatorIcon() {
    const [prevIcon] = this.pageIndicatorIcons;
    return prevIcon;
  }
  get url() {
    return this.selectedImage?.fullUrl;
  }
  get showThumbnails() {
    return this._calculatedMedia.length > 1;
  }
  get resolvedUrl() {
    return this.url && resolve(this.url);
  }
  get resolvedVideoUrl() {
    return this.url && resolveVideoUrl(this.url);
  }
  get altText() {
    return this.selectedImage?.alternativeText;
  }
  get imageSrcs() {
    return this.selectedImage?.images;
  }
  get displayedThumbnailMedia() {
    const updatedMedia = this._calculatedMedia.map((image, index) => {
      const updatedImage = {
        ...image,
        index,
        isSelected: index === this.selectedIndex,
        isImage: image.mediaType === MEDIA_TYPES.Image,
        isVideo: image.mediaType === MEDIA_TYPES.Video
      };
      if (image.mediaType === MEDIA_TYPES.Image && image.smallUrl) {
        updatedImage.images = createImageDataMap(image.smallUrl, this._thumbnailImageSizes);
      }
      if (image.mediaType === MEDIA_TYPES.Video && image.fullUrl) {
        updatedImage.videoUrl = resolveVideoUrl(image.fullUrl);
      }
      return updatedImage;
    });
    return updatedMedia;
  }
  get thumbnailPlacementClasses() {
    return `thumbnails-${this.placement} thumbnails-${this.isVerticalPlacement ? 'vertical' : 'horizontal'}`;
  }
  get thumbnailGalleryClasses() {
    return `container ${this.showThumbnails ? this.thumbnailPlacementClasses : 'hide-thumbnails'}`;
  }
  get nextPageIndicatorAltTextString() {
    return this.nextPageIndicatorAltText ?? '';
  }
  get prevPageIndicatorAltTextString() {
    return this.prevPageIndicatorAltText ?? '';
  }
  get zoomLevelAmount() {
    return this.zoomLevel || DEFAULT_ZOOM_LEVEL;
  }
  get isVerticalPlacement() {
    return VERTICAL_THUMBNAIL_PLACEMENTS.includes(this.placement);
  }
  get isSelectedMediaImage() {
    return this.selectedImage?.mediaType === MEDIA_TYPES.Image;
  }
  get isSelectedMediaVideo() {
    return this.selectedImage?.mediaType === MEDIA_TYPES.Video;
  }
  handleImageSelected(event) {
    this.setIndexFromNode(event.currentTarget);
  }
  connectedCallback() {
    if (!import.meta.env.SSR) {
      this._resizeObserver = new ResizeObserver(debounce(() => this.checkPagingVisibility(), 100));
    }
  }
  renderedCallback() {
    this.checkPagingVisibility();
    if (!this._isObservingSize && this._resizeObserver && this.refs?.container) {
      this._resizeObserver.observe(this.refs?.container);
      this._isObservingSize = true;
    }
  }
  disconnectedCallback() {
    this._resizeObserver?.disconnect();
  }
  handleThumbnailScroll() {
    this.checkPagingVisibility();
  }
  handlePrevClick() {
    this.scrollThumbnails('prev');
  }
  handleNextClick() {
    this.scrollThumbnails('next');
  }
  handleThumbnailMouseEnter(event) {
    event.stopPropagation();
    if (this.selectOnHover) {
      this.setIndexFromNode(event.currentTarget);
    }
  }
  handleImageContainerMouseEnter(event) {
    event.stopPropagation();
    this.handleZoomMouseEvent({
      x: event.pageX,
      y: event.pageY
    });
  }
  handleZoomLensMouseLeave(event) {
    if (this.disableZoom) {
      return;
    }
    const zoomHeroRef = this.refs?.zoomHeroContainer;
    if (zoomHeroRef && zoomHeroRef.contains(document.activeElement)) {
      return;
    }
    this.isZoomVisible = false;
    const container = this.refs?.container;
    if (container) {
      container.classList.remove('zoom-visible', 'zoom-left', 'zoom-right');
    }
  }
  handleZoomLensMouseMove(event) {
    event.stopPropagation();
    this.handleZoomMouseEvent({
      x: event.pageX,
      y: event.pageY
    });
  }
  handleZoomMouseEvent(position) {
    if (this.disableZoom) {
      return;
    }
    const imageContainerEl = this.refs?.imageContainer;
    if (imageContainerEl) {
      const imageContainerRect = imageContainerEl.getBoundingClientRect();
      const relativeX = position.x - (imageContainerRect.left + window.scrollX);
      const relativeY = position.y - (imageContainerRect.top + window.scrollY);
      this._currentLensPosition = {
        x: relativeX,
        y: relativeY
      };
    }
    this.positionZoom(position);
  }
  positionZoom(position) {
    const {
      rect,
      position: zoomPosition
    } = this.getZoomContainerRect();
    if (rect.width < ZOOM_MINIMUM_WIDTH && !this.disableZoom) {
      if (this.isZoomVisible) {
        this.isZoomVisible = false;
        const currentContainer = this.refs?.container;
        if (currentContainer) {
          currentContainer.classList.remove('zoom-visible', 'zoom-left', 'zoom-right');
        }
      }
      return;
    }
    const zoomHeroContainer = this.refs?.zoomHeroContainer;
    const container = this.refs?.container;
    const heroContainerRect = zoomHeroContainer.getBoundingClientRect();
    const x = position.x - (heroContainerRect.x + window.scrollX);
    const y = position.y - (heroContainerRect.y + window.scrollY);
    this.isZoomVisible = true;
    container.classList.toggle('zoom-left', zoomPosition === 'left');
    container.classList.toggle('zoom-right', zoomPosition === 'right');
    container.classList.add('zoom-visible');
    this.setContainerStyleProperty({
      '--zoom-container-width': `${rect.width}px`,
      '--zoom-container-height': `${rect.height}px`,
      '--zoom-reference-width': `${heroContainerRect.width}px`,
      '--zoom-reference-height': `${heroContainerRect.height}px`,
      '--zoom-level': this.zoomLevelAmount.toString(),
      '--zoom-cursor-pos-x': `${x}px`,
      '--zoom-cursor-pos-y': `${y}px`
    });
  }
  setContainerStyleProperty(props) {
    for (const [key, value] of Object.entries(props)) {
      this.refs?.container?.style.setProperty(key, value);
    }
  }
  setIndexFromNode(node) {
    const newIndex = this.getImageIndex(node);
    if (newIndex != null) {
      this._selectedIndex = newIndex;
      this.isZoomVisible = false;
      this._currentLensPosition = null;
      node.focus();
    }
  }
  getImageIndex(node) {
    const parsedIndex = parseInt(node.dataset.index, 10);
    return Number.isNaN(parsedIndex) ? null : parsedIndex;
  }
  scrollThumbnails(type) {
    const [, carouselLength] = this.getScrollInfo();
    const thumbnailCarousel = this.refs?.thumbnailCarousel;
    const amount = type === 'next' ? carouselLength : -carouselLength;
    thumbnailCarousel?.scrollBy({
      ...(this.isVerticalPlacement ? {
        top: amount
      } : {
        left: amount
      }),
      behavior: 'smooth'
    });
  }
  checkPagingVisibility() {
    const [offset, carouselLength, listLength] = this.getScrollInfo();
    this.showPrevPageIndicator = offset > 0;
    this.showNextPageIndicator = offset + carouselLength < listLength;
  }
  getScrollInfo() {
    const thumbnailCarousel = this.refs?.thumbnailCarousel;
    if (!thumbnailCarousel) {
      return [0, 0, 0];
    }
    return this.isVerticalPlacement ? [thumbnailCarousel.scrollTop, thumbnailCarousel.clientHeight, thumbnailCarousel.scrollHeight] : [thumbnailCarousel.scrollLeft, thumbnailCarousel.clientWidth, thumbnailCarousel.scrollWidth];
  }
  getZoomContainerRect() {
    const zoomContainer = this.refs?.zoomHeroContainer;
    const zoomContainerRect = zoomContainer.getBoundingClientRect();
    const container = this.refs?.container;
    const containerRect = container.getBoundingClientRect();
    const leftSpace = containerRect.left;
    const rightSpace = document.body.clientWidth - containerRect.right;
    const isRight = rightSpace >= leftSpace;
    const width = isRight ? rightSpace : leftSpace;
    const height = zoomContainerRect.height;
    const x = isRight ? containerRect.right : 0;
    return {
      rect: {
        x,
        y: containerRect.y,
        width,
        height
      },
      position: isRight ? 'right' : 'left'
    };
  }
  handleZoomLensKeyDown(event) {
    if (this.disableZoom || !this.isSelectedMediaImage) {
      return;
    }
    const {
      key
    } = event;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      return;
    }
    const imageContainerRef = this.refs?.imageContainer;
    const lensRef = this.refs?.zoomLens;
    event.preventDefault();
    event.stopPropagation();
    const imageContainer = imageContainerRef;
    const lens = lensRef;
    if (!this._currentLensPosition) {
      const lensRect = lens.getBoundingClientRect();
      const containerRect = imageContainer.getBoundingClientRect();
      this._currentLensPosition = {
        x: lensRect.left - containerRect.left + lensRect.width / 2,
        y: lensRect.top - containerRect.top + lensRect.height / 2
      };
    }
    let {
      x,
      y
    } = this._currentLensPosition;
    const keyActions = {
      ArrowUp: () => {
        y -= KEYBOARD_MOVE_STEP;
      },
      ArrowDown: () => {
        y += KEYBOARD_MOVE_STEP;
      },
      ArrowLeft: () => {
        x -= KEYBOARD_MOVE_STEP;
      },
      ArrowRight: () => {
        x += KEYBOARD_MOVE_STEP;
      }
    };
    if (key in keyActions) {
      keyActions[key]();
      const lensWidth = lens.offsetWidth;
      const lensHeight = lens.offsetHeight;
      const containerWidth = imageContainer.offsetWidth;
      const containerHeight = imageContainer.offsetHeight;
      const clampedX = Math.max(lensWidth / 2, Math.min(x, containerWidth - lensWidth / 2));
      const clampedY = Math.max(lensHeight / 2, Math.min(y, containerHeight - lensHeight / 2));
      this._currentLensPosition = {
        x: clampedX,
        y: clampedY
      };
      const imageContainerRect = imageContainer.getBoundingClientRect();
      const absolutePageX = imageContainerRect.left + window.scrollX + clampedX;
      const absolutePageY = imageContainerRect.top + window.scrollY + clampedY;
      this.positionZoom({
        x: absolutePageX,
        y: absolutePageY
      });
    }
  }
}