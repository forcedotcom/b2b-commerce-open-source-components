import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { effectiveAccount } from 'commerce/effectiveAccountApi';
import { cartItemApplyConfiguration } from 'commerce/checkoutCartApi';
import { handleAddToCartErrorWithToast } from 'site/productAddToCartUtils';
import { spinnerTextForAddingConfigureProductToCart, spinnerTextForLoadingProductConfigurator } from './labels';
const DUMMY_CART_ID = '0a6000000000000';
const SYNTHETIC_ID_PREFIX = 'ref_';
function uuid() {
  const hexDigits = '0123456789abcdef';
  const valueArray = new Uint32Array(32);
  crypto.getRandomValues(valueArray);
  let res = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      res += '_';
    }
    if (i === 12) {
      res += '4';
    } else if (i === 16) {
      res += hexDigits.charAt(valueArray[i] & 0x3 | 0x8);
    } else {
      res += hexDigits.charAt(valueArray[i] & 0xf);
    }
  }
  return res;
}
function generateSyntheticId() {
  return SYNTHETIC_ID_PREFIX + uuid();
}
export default class ProductConfigureFlowModal extends LightningModal {
  isLoading = true;
  spinnerAlternativeText = spinnerTextForLoadingProductConfigurator;
  @api
  flowApiName;
  @api
  configureContext;
  get flowInputVariables() {
    const {
      cartId,
      cartItemId,
      productDetails
    } = this.configureContext || {};
    const syntheticId = cartItemId || generateSyntheticId();
    const effectiveAccountId = effectiveAccount.accountId;
    const transactionId = cartId || DUMMY_CART_ID;
    const transactionLineId = cartItemId || syntheticId;
    let addedNode = {};
    if (productDetails) {
      addedNode = {
        id: transactionLineId,
        productSellingModel: productDetails?.selectedProductSellingModel?.productSellingModelId,
        sellingModelType: productDetails?.selectedProductSellingModel?.detail.sellingModelType,
        subscriptionTerm: productDetails?.selectedProductSellingModel?.subscriptionTerm,
        pricingTermUnit: productDetails?.selectedProductSellingModel?.detail.pricingTermUnit,
        quantity: productDetails?.quantity,
        product: productDetails?.id,
        productCode: productDetails?.fields.ProductCode,
        productName: productDetails?.fields.Name,
        productBasedOn: productDetails?.fields.ProductBasedOn,
        businessObjectType: 'CartItem'
      };
    }
    return [{
      name: 'configuratorContext',
      type: 'Apex',
      value: {
        transactionId: transactionId,
        transactionLineId: transactionLineId,
        origin: 'WebCart',
        parentName: 'WebCart',
        userContext: effectiveAccountId ? {
          accountId: effectiveAccountId
        } : undefined,
        ...(productDetails ? {
          addedNodes: [addedNode]
        } : {})
      }
    }];
  }
  setSpinnerAlternativeText(alternativeText) {
    this.spinnerAlternativeText = alternativeText;
  }
  setLoadingState(state) {
    this.isLoading = state;
  }
  handleLoading(event) {
    this.setLoadingState(event?.detail?.isLoading);
  }
  async handleSave(event) {
    const transactionContextId = event.detail?.transactionContextId;
    if (!transactionContextId) {
      console.error('No contextId found in transaction context');
      return;
    }
    const quantity = this.extractQuantityFromTransactionContext(event.detail);
    this.setSpinnerAlternativeText(spinnerTextForAddingConfigureProductToCart);
    this.setLoadingState(true);
    try {
      await cartItemApplyConfiguration({
        contextId: transactionContextId,
        action: this.configureContext?.cartItemId ? 'update' : 'add',
        itemId: this.configureContext?.cartItemId,
        quantity,
        skipConstraintRuleValidation: true
      });
      this.close('save');
    } catch {
      handleAddToCartErrorWithToast(undefined, this);
    } finally {
      this.setLoadingState(false);
    }
  }
  extractQuantityFromTransactionContext(detail) {
    try {
      const transactionContext = detail?.transactionContext;
      const salesTransactionItems = transactionContext?.SalesTransaction?.[0]?.SalesTransactionItem;
      if (!salesTransactionItems || !Array.isArray(salesTransactionItems)) {
        return undefined;
      }
      const targetProductId = this.configureContext?.cartItemProductId || this.configureContext?.productDetails?.id;
      if (!targetProductId) {
        return undefined;
      }
      const matchingItem = salesTransactionItems.find(item => item.Product === targetProductId);
      return matchingItem?.Quantity;
    } catch (error) {
      console.error('Error extracting quantity from transaction context:', error);
      return undefined;
    }
  }
  handleCancel() {
    this.close('cancel');
  }
}