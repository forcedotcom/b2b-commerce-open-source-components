import { LightningElement, api, wire } from 'lwc';
import { getDefaultQuoteFields, getQuoteFields } from './quoteSummaryDataProcessor';
import { NavigationContext, generateUrl, navigate } from 'lightning/navigation';
import { generateStyleProperties } from 'experience/styling';
const QUOTE_DETAIL_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Quote_Summary'
  },
  state: {}
};

/**
 * @slot quoteNumberLabel
 * @slot quoteNumber
 */
export default class QuoteSummary extends LightningElement {
  static renderMode = 'light';
  @api
  get quote() {
    return this._quote;
  }
  set quote(quote) {
    this._quote = quote;
    if (this._navContext) {
      this.generateQuoteDetailUrl(this._navContext);
    }
  }
  @api
  quoteSummaryFieldMapping;
  @api
  viewDetailsLinkLabel;
  @api
  headerBgColor;
  @api
  borderColor;
  @api
  imageSize;
  @api
  imageAspectRatio;
  _quote;
  _navContext;
  _quoteDetailUrl;
  @wire(NavigationContext)
  wiredNavigationContext(context) {
    this._navContext = context;
    if (this._quote) {
      this.generateQuoteDetailUrl(context);
    }
  }
  get _quoteFieldsData() {
    return getQuoteFields(this.quote?.fields, this._quoteInputFields);
  }
  get _quoteInputFields() {
    if (this.quoteSummaryFieldMapping && this.quoteSummaryFieldMapping !== '[]') {
      return JSON.parse(this.quoteSummaryFieldMapping);
    }
    return getDefaultQuoteFields();
  }
  get productCount() {
    return this.quote?.products?.length || 0;
  }
  get currencyIsoCode() {
    return this.quote?.fields?.CurrencyIsoCode?.text;
  }
  get _customStyles() {
    return generateStyleProperties({
      '--com-c-quote-history-card-header-bg-color': this.headerBgColor ?? '',
      '--com-c-quote-history-card-border-color': this.borderColor ?? '',
      '--com-c-image-aspect-ratio': this.imageAspectRatio && parseFloat(this.imageAspectRatio) || 1,
      '--com-c-quote-summary-product-object-fit': this.imageSize || 'contain'
    });
  }
  generateQuoteDetailUrl(navContext) {
    if (this._quote && QUOTE_DETAIL_PAGE_REF.state) {
      QUOTE_DETAIL_PAGE_REF.state.recordId = this._quote.id;
      this._quoteDetailUrl = generateUrl(navContext, QUOTE_DETAIL_PAGE_REF);
    }
  }
  handleQuoteDetailNavigation(event) {
    event.stopPropagation();
    if (this._quote && this._navContext && QUOTE_DETAIL_PAGE_REF.state) {
      QUOTE_DETAIL_PAGE_REF.state.recordId = this._quote.id;
      navigate(this._navContext, QUOTE_DETAIL_PAGE_REF);
    }
  }
}