import { LightningElement, api } from 'lwc';
export default class CommonDropdown extends LightningElement {
  static renderMode = 'light';
  @api
  options;
  @api
  get selected() {
    return this._selected;
  }
  set selected(values) {
    this._selected = values;
  }
  @api
  multiple = false;
  @api
  menuAlignment;
  get menuAlignmentValue() {
    return this.menuAlignment || 'left';
  }
  @api
  variant;
  get variantValue() {
    return this.variant || 'bare';
  }
  @api
  iconName;
  get icon() {
    return this.iconName || 'utility:chevrondown';
  }
  @api
  labelPrefix;
  @api
  disabled = false;
  _selected = [];
  get _normalizedSelected() {
    if (this._selected.length && !this.multiple) {
      return [this._selected[0]];
    }
    return this._selected;
  }
  _getSelectedLabel() {
    if (this._normalizedSelected.length) {
      if (this.multiple) {
        return this.options?.reduce((labels, option) => {
          if (this._normalizedSelected?.includes(option?.value) && option?.label !== undefined) {
            labels.push(option.label);
          }
          return labels;
        }, [])?.join(', ');
      }
      return this.options?.find(option => option.value === this._normalizedSelected[0])?.label;
    }
    return '';
  }
  get dropdownLabel() {
    const selectedLabel = this._getSelectedLabel() || '';
    return this.labelPrefix ? `${this.labelPrefix} ${selectedLabel}`.trim() : selectedLabel;
  }
  get normalizedOptions() {
    return this.options?.map(option => {
      return {
        ...option,
        selected: this._normalizedSelected?.some(selectedOption => selectedOption === option.value)
      };
    }) || [];
  }
  get computedButtonMenuClass() {
    return [this.variantValue !== 'border' ? 'no-border-button' : ''];
  }
  dropdownSelectHandler(event) {
    const selectedValue = event.detail.value;
    let selectedEventDetail;
    if (this.multiple) {
      this._selected = this.options?.reduce((selected, option) => {
        const isSelected = selected.includes(option?.value);
        if (option?.value === selectedValue) {
          if (isSelected) {
            const indexToRemove = selected.indexOf(option.value);
            selected.splice(indexToRemove, 1);
          } else {
            selected.push(option.value);
          }
        }
        return selected;
      }, [...this._selected]) || [];
      selectedEventDetail = this._selected;
    } else {
      this._selected = this.options?.find(option => option?.value === selectedValue) ? [selectedValue] : [];
      selectedEventDetail = this._selected?.[0];
    }
    this.dispatchEvent(new CustomEvent('dropdownselect', {
      bubbles: true,
      composed: true,
      detail: {
        selected: selectedEventDetail
      }
    }));
  }
}