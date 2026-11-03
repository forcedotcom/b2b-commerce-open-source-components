import { LightningElement, api } from 'lwc';
/**
 * @slot emptyHeaderLabel
 * @slot emptyBody
 * @slot emptyStateBreadcrumb
 * @slot itemsBreadcrumb
 * @slot itemsHeaderLabel
 * @slot itemsHeaderCount
 * @slot itemsDescription
 * @slot emptyStateDescription
 * @slot promotionDiscountsApproaching
 * @slot itemsBody
 */
export default class CartB2bView extends LightningElement {
  static renderMode = 'light';
  @api
  displayStates;
  @api
  items;
  @api
  messages;
  @api
  cartDetails;
  @api
  showSortOptions = false;
  @api
  newCartButtonLabel;
  @api
  cartNameLabel;
  @api
  cartDescriptionLabel;
  @api
  defaultPillLabel;
  @api
  optionsDropdownLabel;
  @api
  editCartLabel;
  @api
  markAsDefaultLabel;
  @api
  deleteCartLabel;
}