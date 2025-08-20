import { api, LightningElement, wire } from 'lwc';
import { generateElementAlignmentClass } from 'experience/styling';
import { StencilType } from 'site/checkoutStencilUnified';
import { CurrentPageReference, navigate, NavigationContext } from 'lightning/navigation';
import currency from '@salesforce/i18n/currency';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { emptyMiniCart, defaultErrorMessageForMiniCart, addErrorText, removeErrorText } from './labels';
import { remapCartItems, isItemOnWishlist, transformRecommendationCollection, retrieveRecommendationData, updateIsOnWishlistStatus } from './util';
import { debounce } from 'experience/utils';
import Toast from 'site/commonToast';
import { addItemToWishlist, deleteItemFromWishlist, WishlistsAdapter } from 'commerce/wishlistApi';
import { createWishlistItemAddDataEvent, createWishlistItemRemoveDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
import { CartContentsAdapter, cartItemDelete, cartItemUpdate, CartStatusAdapter, DEFAULT_CART_ITEMS_PAGE_SIZE, cartItemsLoadSync, toCommerceError } from 'commerce/checkoutCartApi';
import { ExpressMode } from 'site/checkoutPaymentByExpress';
export default class CartMinicartpanel extends LightningElement {
  static renderMode = 'light';
  _paginationType = 'scroll';
  _showRemoveItem = true;
  _showProductImage = true;
  _showProductVariants = true;
  _showPricePerUnit = true;
  _showTotalPrices = true;
  _showOriginalPrice = true;
  _showActualPrice = true;
  _showPromotions = true;
  _showSku = true;
  _stencilType = StencilType.CART_ITEMS;
  _headerStencilType = StencilType.DEFAULT_STENCIL;
  _stencilCartItemCount = 7;
  _stencilHeaderItemCount = 1;
  _textDecoration = "{'bold': false}";
  _textDisplayInfo = "{'headingTag': 'h3', 'textStyle': 'heading-medium'}";
  _recommendationHeaderPaddingVertical = 'x-large';
  _recommendationHeaderPaddingHorizontal = 'none';
  _recommendationWidth = '100';
  _recommendationLayout = 'reel';
  _recommendationHideForFewerThan = '1';
  _cartItems;
  _showRecommendation = false;
  _wishlistId;
  _wishlistProducts = [];
  _collection = [];
  _recommendationData = [];
  _cartSummary;
  _cartItemsDataLoading = true;
  _hasCartItemsDataLoadingError = false;
  pageSize = DEFAULT_CART_ITEMS_PAGE_SIZE;
  nextPageNumber = null;
  emptyMiniCartLabel = emptyMiniCart;
  get _expressMode() {
    return ExpressMode.MINICART;
  }
  @api
  label;
  @api
  get showEmptyCart() {
    return Array.isArray(this._cartItems) && this._cartItems.length === 0 && this.showStencils === false;
  }
  @api
  totalCartCount = 0;
  @api
  headerText;
  @api
  get headerLabel() {
    return this.showStencils || this.showEmptyCart ? `${this.headerText}` : `${this.headerText} (${this.totalCartCount})`;
  }
  @api
  checkoutButtonText;
  @api
  checkoutButtonSize;
  @api
  showContinueShoppingButton = false;
  @api
  continueShoppingButtonText;
  @api
  continueShoppingButtonSize;
  @api
  showExpressCheckoutButton = false;
  @api
  expressCheckoutPmsId;
  @api
  expressCheckoutUseManualCapture = false;
  @api
  showViewCartButton = false;
  @api
  viewCartButtonText;
  @api
  viewCartButtonSize;
  @api
  recommendationHeaderText;
  @api
  recommendationPriceDisplayType;
  @api
  set showRecommendation(value) {
    this._showRecommendation = value;
  }
  get showRecommendation() {
    return this._showRecommendation && Boolean(this._collection && this._collection.length > 0);
  }
  _previousPageName;
  currentPageName;
  _hasRendered = false;
  renderedCallback() {
    if (!this.showStencils && !this._hasRendered) {
      this._hasRendered = true;
      const panelHeading = this.refs?.panelHeading;
      panelHeading.focus();
    }
  }
  debounceToastMessage = debounce((element, message = defaultErrorMessageForMiniCart) => {
    const toast = {
      label: message,
      variant: 'error'
    };
    Toast.show(toast, element);
  }, 2000);
  _appContext;
  _managedCheckoutVersion;
  @wire(AppContextAdapter)
  appContextHandler(response) {
    this._appContext = response;
    if (response.data && response?.data?.checkoutSettings) {
      const managedCheckoutVersion = response?.data?.managedCheckoutVersion;
      const isManagedCheckoutEnabled = !!response?.data?.checkoutSettings?.isManagedCheckoutEnabled;
      if (isManagedCheckoutEnabled && managedCheckoutVersion && managedCheckoutVersion !== '0.117.0') {
        this._managedCheckoutVersion = managedCheckoutVersion;
      }
    }
  }
  @wire(CartStatusAdapter)
  cartStatusHandler;
  @wire(SessionContextAdapter)
  sessionContext;
  @wire(NavigationContext)
  navContext;
  @wire(CartContentsAdapter, {
    pageSize: '$pageSize'
  })
  wiredCartItemsData({
    data,
    loaded,
    error,
    loading
  }) {
    this._cartItemsDataLoading = loading;
    this._hasCartItemsDataLoadingError = !!error;
    if (loaded && !error) {
      this._cartItems = remapCartItems(data?.cartItems);
      this._cartSummary = data?.cartSummary;
      this.setNextPageNumber(data);
      if (this._cartItems && this._showRecommendation) {
        retrieveRecommendationData().then(recommendationData => {
          this._collection = transformRecommendationCollection(recommendationData, this.recommendationPriceDisplayType, this._wishlistProducts, this.navContext);
        }).catch(() => {
          this._collection = [];
        });
      }
    } else if (error) {
      this._cartItems = [];
      this._collection = [];
      const code = toCommerceError(error).code;
      if (!['MISSING_RECORD', 'INVALID_OPERATION', 'GUEST_INSUFFICIENT_ACCESS'].includes(code)) {
        this.debounceToastMessage(this);
      }
    }
  }
  @wire(CurrentPageReference)
  getPageNameFromPageRef(pageRef) {
    this.currentPageName = pageRef?.attributes?.name || pageRef?.attributes?.objectApiName || '';
    if (this._previousPageName && this.currentPageName !== this._previousPageName) {
      this.dispatchEvent(new CustomEvent('close'));
    }
    this._previousPageName = this.currentPageName;
  }
  get _inventoryConfiguration() {
    return this._appContext?.data?.inventoryConfiguration;
  }
  get _currencyIsoCode() {
    return this._cartSummary?.currencyIsoCode || this._appContext?.data?.defaultCurrency || currency;
  }
  get _webstoreId() {
    return this._appContext?.data?.webstoreId;
  }
  get _guestCheckoutEnabled() {
    return Boolean(this.cartStatusHandler?.data?.isGuestCheckoutEnabled);
  }
  get _isLoggedIn() {
    return Boolean(this.sessionContext?.data?.isLoggedIn);
  }
  get _effectiveAccountId() {
    return this.sessionContext?.data?.effectiveAccountId;
  }
  get showExpressCheckoutComponent() {
    return this.showExpressCheckoutButton && !this.showEmptyCart;
  }
  get showStencils() {
    return !Array.isArray(this._cartItems);
  }
  get continueShoppingButtonCustomClasses() {
    return `continue-shopping ${generateElementAlignmentClass('center')}`;
  }
  get viewCartButtonCustomClasses() {
    return `view-cart ${generateElementAlignmentClass('center')}`;
  }
  get cartId() {
    return this._cartSummary?.cartId;
  }
  get cartHasError() {
    return !!this.cartStatusHandler?.error || this._hasCartItemsDataLoadingError;
  }
  get _cannotCheckoutWithSubscriptionProducts() {
    const isLoggedIn = Boolean(this.sessionContext?.data?.isLoggedIn);
    return !isLoggedIn && this._hasSubscriptions;
  }
  get canCheckout() {
    return !this.isCartProcessing && Boolean(this.cartStatusHandler?.data?.isGuestCheckoutEnabled) && !this._cannotCheckoutWithSubscriptionProducts;
  }
  get hasProducts() {
    return Boolean(this._cartSummary) && Number(this._cartSummary?.totalProductCount) > 0;
  }
  get _hasSubscriptions() {
    return Boolean(this._cartSummary?.totalSubProductCount && parseFloat(this._cartSummary?.totalSubProductCount) > 0);
  }
  get isCartProcessing() {
    return !!this.cartStatusHandler?.data?.isProcessing || !!this.cartStatusHandler?.loading || !!this._cartItemsDataLoading;
  }
  get isDisabled() {
    return !this.hasProducts || this.isCartProcessing || this.cartHasError || this.cartStatusHandler?.data?.isReadyForCheckout === false;
  }
  @api
  get collection() {
    return this._collection;
  }
  handleUpdateCartItem(event) {
    const {
      cartItemId,
      quantity
    } = event.detail;
    cartItemUpdate(cartItemId, quantity).catch(err => {
      this.debounceToastMessage(this, toCommerceError(err).message);
    });
  }
  handleDeleteCartItem(event) {
    const cartItemId = event.detail;
    cartItemDelete(cartItemId);
  }
  handleCloseMiniCart(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('close'));
  }
  handleProductNavigation(event) {
    this.navContext && navigate(this.navContext, {
      type: 'standard__recordPage',
      attributes: {
        objectApiName: 'Product2',
        recordId: event.detail.productId,
        actionName: 'view',
        ...(event.detail.urlName && {
          urlName: event.detail.urlName
        })
      }
    });
    this.handleCloseMiniCart(event);
  }
  handleViewCart(event) {
    event.preventDefault();
    this.navContext && navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Current_Cart'
      }
    });
    this.handleCloseMiniCart(event);
  }
  handleOrderPageNavigation(event) {
    const orderNumber = event.detail.orderNumber;
    if (this.navContext && orderNumber) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Order'
        },
        state: {
          orderNumber
        }
      });
      this.handleCloseMiniCart(event);
    }
  }
  async handleCartShowMore() {
    if (this.nextPageNumber && this._cartItems) {
      const data = await cartItemsLoadSync({
        pageNumber: this.nextPageNumber,
        pageSize: this.pageSize
      });
      this.setNextPageNumber(data);
      const nextPageItems = remapCartItems(data?.cartItems);
      this._cartItems = [...this._cartItems, ...nextPageItems];
    }
  }
  setNextPageNumber(data) {
    if (data?.currentPage && data.totalNumberOfPages) {
      this.nextPageNumber = data.currentPage < data.totalNumberOfPages ? data.currentPage + 1 : null;
    }
  }
  handleRecommendationProductClicked(event) {
    event.stopPropagation();
    const target = event?.currentTarget;
    const productId = target?.dataset?.id;
    const urlName = event.detail?.urlName;
    navigate(this.navContext, {
      type: 'standard__recordPage',
      attributes: {
        objectApiName: 'Product2',
        recordId: productId,
        actionName: 'view',
        ...(urlName && {
          urlName: urlName
        })
      }
    });
    this.handleCloseMiniCart(event);
  }
  dispatchAction(eventName) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true
    }));
  }
  @wire(WishlistsAdapter, {
    includeDisplayedList: true,
    pageSize: 500,
    productFields: ['CurrencyIsoCode', 'Description', 'DisplayUrl', 'Family', 'Name', 'ProductCode', 'QuantityUnitOfMeasure', 'StockKeepingUnit', 'ProductClass']
  })
  receiveWishlistData(response) {
    if (!response.loaded || response.error || !response.data) {
      return;
    }
    const {
      displayedList
    } = response.data;
    this._wishlistId = displayedList?.summary?.id ?? undefined;
    this._wishlistProducts = displayedList?.page?.items?.map(wishlistItem => ({
      productId: wishlistItem.productSummary?.productId,
      wishlistItemId: wishlistItem.wishlistItemId
    })) ?? [];
  }
  getWishlistItemEventData(productId, primaryPrice) {
    return {
      id: this.getWishlistItemId(productId),
      catalogObject: {
        id: productId,
        type: 'Product'
      },
      attributes: {
        quantity: 1,
        price: Number(primaryPrice)
      }
    };
  }
  getLabelForToast(label, productName) {
    return label.replace('{productName}', productName);
  }
  async handleWishlistButtonClicked(event) {
    event.stopPropagation();
    const target = event?.currentTarget;
    const productId = target?.dataset?.id || '';
    const primaryPrice = target?.dataset?.primaryPrice || '';
    const eventDetailProductName = target?.dataset?.productName || '';
    const isOnWishlist = isItemOnWishlist(this._wishlistProducts, productId);
    const wishlistItemId = this.getWishlistItemId(productId);
    if (!isOnWishlist) {
      try {
        this.dispatchAction('addtowishlistclicked');
        await addItemToWishlist({
          wishlistItemInput: {
            productId: productId
          },
          wishlistId: this._wishlistId
        });
        dispatchDataEvent(target, createWishlistItemAddDataEvent(this.getWishlistItemEventData(productId, primaryPrice), this._currencyIsoCode));
        this.dispatchAction('addtowishlistsuccess');
        this._collection = updateIsOnWishlistStatus(this._collection, productId, true);
      } catch (e) {
        const isLoggedIn = this.sessionContext?.data?.isLoggedIn;
        if (!isLoggedIn) {
          this.navigateToLogin();
        } else {
          this.dispatchAction('addtowishlisterror');
          const productName = eventDetailProductName || '';
          Toast.show({
            label: this.getLabelForToast(addErrorText, productName),
            variant: 'error'
          }, this);
        }
      }
    } else if (this._wishlistId && wishlistItemId) {
      try {
        this.dispatchAction('deletefromwishlistclicked');
        await deleteItemFromWishlist({
          wishlistId: this._wishlistId,
          wishlistItemId: wishlistItemId
        });
        dispatchDataEvent(target, createWishlistItemRemoveDataEvent(this.getWishlistItemEventData(productId, primaryPrice), this._currencyIsoCode));
        this.dispatchAction('deletefromwishlistsuccess');
        this._collection = updateIsOnWishlistStatus(this._collection, productId, false);
      } catch (e) {
        this.dispatchAction('deletefromwishlisterror');
        const productName = eventDetailProductName || '';
        Toast.show({
          label: this.getLabelForToast(removeErrorText, productName),
          variant: 'error'
        }, this);
      }
    }
  }
  getWishlistItemId(itemId) {
    return this._wishlistProducts.find(item => {
      return item.productId === itemId ? item.wishlistItemId : '';
    })?.wishlistItemId || '';
  }
  navigateToLogin() {
    this.navContext && navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
}