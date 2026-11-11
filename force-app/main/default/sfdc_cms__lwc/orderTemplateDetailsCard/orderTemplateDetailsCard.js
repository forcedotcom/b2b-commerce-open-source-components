import { LightningElement, api, wire } from 'lwc';
import { isDesignMode } from 'experience/clientApi';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import { truncateWithEllipsis } from './utils';
import LABELS from './labels';
const TEMPLATE_NAME_DISPLAY_TEXT_MAX_LENGTH = 80;
const TEMPLATE_DESCRIPTION_DISPLAY_TEXT_MAX_LENGTH = 100;
function buildTemplateDetailPageRef(templateId) {
  return {
    type: 'comm__namedPage',
    attributes: {
      name: 'Order_Template_Detail'
    },
    state: {
      recordId: templateId
    }
  };
}

/**
 * @slot addAllToCart - Slot for the per-card Add All to Cart button.
 * @slot templateOptions - Slot for the template options menu
 */
export default class OrderTemplateDetailsCard extends LightningElement {
  static renderMode = 'light';
  _navContext;
  _templateDetailUrl;
  @wire(NavigationContext)
  wiredNavigationContext(context) {
    this._navContext = context;
    this._refreshTemplateDetailUrl();
  }
  @api
  get orderTemplateSummaryData() {
    return this._orderTemplateSummaryData;
  }
  set orderTemplateSummaryData(value) {
    this._orderTemplateSummaryData = value;
    this._refreshTemplateDetailUrl();
  }
  _orderTemplateSummaryData;
  @api
  showItemCount;
  @api
  countType;
  @api
  itemsLabel;
  get _templateName() {
    return truncateWithEllipsis(this.orderTemplateSummaryData?.name ?? '', TEMPLATE_NAME_DISPLAY_TEXT_MAX_LENGTH);
  }
  get _templateNameHeadingRole() {
    return this._templateName ? 'heading' : undefined;
  }
  get _templateNameHeadingLevel() {
    return this._templateName ? '3' : undefined;
  }
  get _templateAriaLabel() {
    return this.orderTemplateSummaryData?.name || undefined;
  }
  get _itemCount() {
    const summary = this.orderTemplateSummaryData;
    if (this.countType === 'UniqueProductCount') {
      return summary?.wishlistProductCount ?? 0;
    }
    const total = summary?.wishlistTotalProductCount;
    if (total != null && total !== '') {
      const parsed = Number.parseInt(total, 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return summary?.wishlistProductCount ?? 0;
  }
  get _itemsLabel() {
    const label = this.itemsLabel || LABELS.itemsLabel;
    return `${this._itemCount} ${label}`;
  }
  get _showItemCount() {
    return this.showItemCount !== false;
  }
  get _showDescription() {
    return !!this._templateDescription;
  }
  get _templateDescription() {
    return truncateWithEllipsis(this.orderTemplateSummaryData?.description ?? '', TEMPLATE_DESCRIPTION_DISPLAY_TEXT_MAX_LENGTH);
  }
  get templateCardStyles() {
    return 'order-template-details-card slds-card';
  }
  get _cardLinkHref() {
    return this._templateDetailUrl;
  }
  _refreshTemplateDetailUrl() {
    const templateId = this._orderTemplateSummaryData?.id;
    if (!this._navContext || !templateId) {
      this._templateDetailUrl = undefined;
      return;
    }
    this._templateDetailUrl = generateUrl(this._navContext, buildTemplateDetailPageRef(templateId));
  }
  handleCardLinkClick(event) {
    const target = event.target;
    if (target?.closest('.template-actions')) {
      return;
    }
    if (isDesignMode) {
      event.preventDefault();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    const templateId = this._orderTemplateSummaryData?.id;
    if (!this._navContext || !templateId) {
      return;
    }
    event.preventDefault();
    navigate(this._navContext, buildTemplateDetailPageRef(templateId));
  }
}