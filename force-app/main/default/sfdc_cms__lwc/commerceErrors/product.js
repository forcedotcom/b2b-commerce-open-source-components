export const ProductErrors = {
  OUT_OF_STOCK: {
    code: '100',
    message: 'No more available items for current product.'
  },
  NOT_ENOUGH_INVENTORY: {
    code: '101',
    message: 'Not enough inventory for selected quantity.'
  },
  NO_PRICING_AVAILABLE: {
    code: '102',
    message: 'No pricing data available.'
  },
  PRODUCT_CLASS_PARENT: {
    code: '103',
    message: 'Product is a variant parent.'
  },
  PRODUCT_CLASS_SET: {
    code: '104',
    message: 'Product is a set.'
  },
  SELECTED_VARIANT_IS_INVALID: {
    code: '105',
    message: 'The selected variant is not valid.'
  },
  NO_SELLING_MODELS: {
    code: '106',
    message: 'Selling Models are invalid.'
  },
  QUANTITY_INVALID: {
    code: '107',
    message: 'Requested quantity is invalid.'
  }
};