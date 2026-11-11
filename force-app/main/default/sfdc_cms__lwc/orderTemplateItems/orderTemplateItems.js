import { LightningElement, api, track, wire } from 'lwc';
import BasePath from '@salesforce/community/basePath';
import { isDesignMode } from 'experience/clientApi';
import { NavigationContext } from 'lightning/navigation';
import { createWishlistItemChildrenLoadAction, dispatchActionAsync } from 'commerce/actionApi';
import Toast from 'site/commonToast';
import ProductBundleDetailsModal from 'site/productBundleDetailsModal';
import LABELS from './labels';
import { DEFAULT_GET_CHILDREN_LABEL, DEFAULT_PAGE_SIZE, FIRST_PAGE, LAYOUT, MAX_PAGES_DISPLAYED } from './constants';
import { convertWishlistItemToOrderItem, defaultSkuLabel, defaultQuantityLabel } from './transformer';
export default class OrderTemplateItems extends LightningElement {
  static renderMode = 'light';
  _labels = LABELS;
  @api
  get items() {
    return this._items;
  }
  set items(value) {
    if (this._items === value) {
      return;
    }
    this._items = value;
    this._normalisedItems = this.parseItems(value);
    const totalPages = Math.ceil((this._normalisedItems.length || 1) / this._pageSize);
    if (this._currentPage > totalPages) {
      this._currentPage = totalPages;
    }
  }
  @api
  layout = LAYOUT.GRID;
  @api
  pageSize;
  @api
  maximumPagesDisplayed = MAX_PAGES_DISPLAYED;
  @api
  showProductImage = false;
  @api
  showSku = false;
  @api
  skuLabel;
  @api
  showSeeConfiguration = false;
  @api
  getChildrenLabel;
  @api
  quantityLabel;
  @api
  modalSkuLabel;
  @api
  showWishlistIcon = false;
  @wire(NavigationContext)
  navContext;
  _items;
  _normalisedItems = [];
  _childItemsByItemId = {};
  @track
  isLoadingConfiguration = false;
  _currentPage = FIRST_PAGE;
  parseItems(raw) {
    if (!raw) {
      return [];
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(raw) ? raw : [];
  }
  get normalisedItems() {
    return this._normalisedItems;
  }
  get isEmpty() {
    return this.normalisedItems.length === 0;
  }
  get showEmptyState() {
    return isDesignMode || this.isEmpty;
  }
  get showGrid() {
    return !this.isEmpty;
  }
  get _emptyTemplateImageUrl() {
    return `${BasePath}/assets/images/empty-orderTemplate.svg`;
  }
  get _pageSize() {
    return this.pageSize && this.pageSize > 0 ? this.pageSize : DEFAULT_PAGE_SIZE;
  }
  get totalItemCount() {
    return this.normalisedItems.length;
  }
  get currentPageNumber() {
    return this._currentPage;
  }
  get pagedItems() {
    const start = (this._currentPage - 1) * this._pageSize;
    return this.normalisedItems.slice(start, start + this._pageSize).map(item => ({
      ...item,
      showConfigButton: this.showSeeConfiguration && this.isConfigurableOrBundleItem(item)
    }));
  }
  get showPagination() {
    return this.totalItemCount > this._pageSize;
  }
  get isGridLayout() {
    return this.layout !== LAYOUT.LIST;
  }
  get layoutContainerClass() {
    return this.isGridLayout ? 'order-template-grid-container' : 'order-template-list-container';
  }
  get totalPages() {
    return Math.ceil(this.totalItemCount / this._pageSize);
  }
  handleGotoPage(event) {
    const pageNumber = event.detail?.pageNumber;
    if (typeof pageNumber === 'number' && pageNumber >= FIRST_PAGE && pageNumber <= this.totalPages) {
      this._currentPage = pageNumber;
    }
  }
  handlePreviousPage() {
    if (this._currentPage > FIRST_PAGE) {
      this._currentPage -= 1;
    }
  }
  handleNextPage() {
    if (this._currentPage < this.totalPages) {
      this._currentPage += 1;
    }
  }
  get _getChildrenButtonLabel() {
    return this.getChildrenLabel || DEFAULT_GET_CHILDREN_LABEL;
  }
  async handleGetChildren(event) {
    const wishlistItemId = event.currentTarget.dataset.itemId;
    const item = this.normalisedItems.find(candidate => candidate.wishlistItemId === wishlistItemId);
    if (!item) {
      return;
    }
    try {
      this.isLoadingConfiguration = true;
      const childItemsData = await this.getChildrenForItem(item);
      const modalLabels = {
        skuLabel: this.modalSkuLabel || defaultSkuLabel,
        quantityLabel: this.quantityLabel || defaultQuantityLabel
      };
      const orderItem = convertWishlistItemToOrderItem(item, childItemsData, modalLabels);
      const modalTitle = this._labels.productDetailsModalTitle;
      ProductBundleDetailsModal.open({
        headerTitle: modalTitle,
        currencyIsoCode: item.currencyIsoCode ?? undefined,
        orderItem,
        navContext: this.navContext,
        label: modalTitle
      });
    } finally {
      this.isLoadingConfiguration = false;
    }
  }
  isConfigurableOrBundleItem(item) {
    const product = item.productSummary;
    return product?.productClass === 'Bundle' || product?.isConfigurationAllowed === true;
  }
  async getChildrenForItem(item) {
    const wishlistItemId = item.wishlistItemId;
    if (!wishlistItemId) {
      return undefined;
    }
    const cached = this._childItemsByItemId[wishlistItemId];
    if (cached) {
      return cached;
    }
    try {
      const data = await dispatchActionAsync(this, createWishlistItemChildrenLoadAction(wishlistItemId));
      if (data?.items && data.items.length > 0) {
        this._childItemsByItemId[wishlistItemId] = data;
      }
      return data ?? undefined;
    } catch {
      const toast = {
        label: this._labels.loadErrorMessage,
        variant: 'error'
      };
      Toast.show(toast, this);
      return undefined;
    }
  }
}