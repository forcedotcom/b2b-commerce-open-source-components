import { LightningElement, api } from 'lwc';
import { GO_TO_PAGE, SHOW_MORE_EVENT } from './constants';
import { DEFAULT_CART_ITEMS_PAGE_SIZE } from 'commerce/checkoutCartApi';
export { SHOW_MORE_EVENT, GO_TO_PAGE };
import { Labels } from './labels';
export default class CartItemsUi extends LightningElement {
  static renderMode = 'light';
  @api
  items;
  get _cartItems() {
    return this.items?.filter(item => item.subType !== 'Bonus');
  }
  get _bonusCartItems() {
    return this.items?.filter(item => item.subType === 'Bonus');
  }
  get hasBonusCartItems() {
    return Array.isArray(this._bonusCartItems) && this._bonusCartItems?.length > 0;
  }
  @api
  currencyIsoCode;
  @api
  showRemoveItem = false;
  @api
  showProductImage = false;
  @api
  showProductVariants = false;
  @api
  showPricePerUnit = false;
  @api
  showTotalPrices = false;
  @api
  showOriginalPrice = false;
  @api
  showActualPrice = false;
  @api
  showPromotions = false;
  @api
  promotionsAppliedSavingsButtonText;
  @api
  hideQuantitySelector = false;
  @api
  showCountInName = false;
  @api
  removeProductLinks = false;
  @api
  showSku = false;
  @api
  skuLabel;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  @api
  productFieldMapping;
  @api
  quantitySelectorLabel;
  @api
  showQuantitySelectorLabel = false;
  @api
  pagination;
  @api
  paginationType;
  _containerWidth;
  _resizeAnimationFrame = null;
  _resizeObserver;
  cartItemsLength = 0;
  observer = null;
  goToTop = false;
  connectedCallback() {
    if (!import.meta.env.SSR) {
      const options = {
        root: null,
        threshold: 0.0
      };
      this.observer = new IntersectionObserver(this.getMoreCartItems.bind(this), options);
    }
  }
  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this.observer?.disconnect();
    if (this._resizeAnimationFrame) {
      cancelAnimationFrame(this._resizeAnimationFrame);
      this._resizeAnimationFrame = null;
    }
  }
  renderedCallback() {
    this._resizeObserver = new ResizeObserver(entries => {
      if (this._resizeAnimationFrame) {
        cancelAnimationFrame(this._resizeAnimationFrame);
      }
      this._resizeAnimationFrame = requestAnimationFrame(() => {
        this._resizeAnimationFrame = null;
        this._containerWidth = entries[0]?.target.clientWidth;
      });
    });
    this.attachObservers();
    this.updateAriaBusy(false);
    if (this.goToTop) {
      const listElement = this.refs?.ul;
      if (listElement) {
        listElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
      this.goToTop = false;
    }
  }
  attachObservers() {
    const targetElement = this.refs?.ul;
    this._resizeObserver?.unobserve(targetElement);
    this._resizeObserver?.observe(targetElement);
    const lastListItem = this.refs?.section?.lastElementChild;
    if (this.paginationType === 'scroll' && lastListItem) {
      this.observer?.observe(lastListItem);
    }
  }
  updateAriaBusy(ariaBusy) {
    const section = this.refs?.section;
    if (section) {
      if (ariaBusy) {
        section.ariaBusy = 'true';
      } else if (!ariaBusy && this.items && this.items?.length !== this.cartItemsLength) {
        section.ariaBusy = 'false';
        this.cartItemsLength = this.items?.length;
      }
    }
  }
  getMoreCartItems(entries) {
    entries.forEach(entry => {
      const elementIsInViewport = entry.isIntersecting;
      this.updateAriaBusy(true);
      if (elementIsInViewport && this.paginationType === 'scroll') {
        this.dispatchEvent(new CustomEvent(SHOW_MORE_EVENT, {
          composed: true,
          bubbles: true
        }));
      }
    });
  }
  skipToBottom() {
    const bottomLink = this.refs?.bottom;
    bottomLink?.focus();
    bottomLink?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }
  skipToTop() {
    const topLink = this.refs?.top;
    topLink?.focus();
    topLink?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }
  get skipToBottomLinkText() {
    return Labels.skipToBottomLinkText;
  }
  get skipToTopLinkText() {
    return Labels.skipToTopLinkText;
  }
  get displayShowMore() {
    return this.paginationType === 'showMore';
  }
  handleShowMoreButton() {
    this.dispatchEvent(new CustomEvent(SHOW_MORE_EVENT, {
      composed: true,
      bubbles: true
    }));
  }
  handleGotoPageEvent(event) {
    event.stopPropagation();
    const pageNumber = event.detail.pageNumber;
    this.dispatchEvent(new CustomEvent(GO_TO_PAGE, {
      composed: true,
      bubbles: true,
      detail: {
        pageNumber: pageNumber,
        pageSize: this.pageSize
      }
    }));
    this.goToTop = true;
  }
  handlePreviousPageEvent(event) {
    event.stopPropagation();
    if (this.currentPageNumber) {
      const previousPageNumber = this.currentPageNumber - 1;
      this.dispatchEvent(new CustomEvent(GO_TO_PAGE, {
        composed: true,
        bubbles: true,
        detail: {
          pageNumber: previousPageNumber,
          pageSize: this.pageSize
        }
      }));
      this.goToTop = true;
    }
  }
  handleNextPageEvent(event) {
    event.stopPropagation();
    if (this.currentPageNumber) {
      const nextPageNumber = this.currentPageNumber + 1;
      this.dispatchEvent(new CustomEvent(GO_TO_PAGE, {
        composed: true,
        bubbles: true,
        detail: {
          pageNumber: nextPageNumber,
          pageSize: this.pageSize
        }
      }));
      this.goToTop = true;
    }
  }
  get displayPages() {
    return this.paginationType === 'pages' && !!this.totalItemCount;
  }
  get pagesDisplayed() {
    return 7;
  }
  get pageSize() {
    return this.pagination?.pageSize ? this.pagination.pageSize : DEFAULT_CART_ITEMS_PAGE_SIZE;
  }
  get totalItemCount() {
    return this.pagination?.totalItemCount ? this.pagination?.totalItemCount : 0;
  }
  get currentPageNumber() {
    return this.pagination?.currentPage ? this.pagination?.currentPage : 1;
  }
  get _listItemClasses() {
    if (!import.meta.env.SSR && this.correctionRequired()) {
      return this.correctSize();
    }
    return 'li-layout';
  }
  get _showSmallLayout() {
    if (!import.meta.env.SSR && this.correctionRequired()) {
      return this.isUlSmall();
    }
    return undefined;
  }
  correctionRequired() {
    if (!this._containerWidth) {
      return false;
    }
    return this.isVpSmall() !== this.isUlSmall();
  }
  correctSize() {
    return this.isUlSmall() ? 'small-layout' : 'large-layout';
  }
  isUlSmall() {
    const width = this._containerWidth;
    return width < 500;
  }
  isVpSmall() {
    return window.innerWidth < 500;
  }
}