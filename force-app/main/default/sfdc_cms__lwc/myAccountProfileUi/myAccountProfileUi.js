import { LightningElement, api } from 'lwc';
import { NoDataLabel, EditActionLabel, VerifyActionLabel, AddActionLabel, VerifiedLabel, UnVerifiedLabel } from './labels';
export default class MyAccountProfileUi extends LightningElement {
  static renderMode = 'light';
  @api
  profile;
  @api
  firstNameLabel;
  @api
  lastNameLabel;
  @api
  emailLabel;
  @api
  phoneLabel;
  @api
  showPhoneDetails;
  @api
  passwordLessLoginEnabled;
  @api
  focus() {
    const target = this.refs?.card;
    target?.focus();
  }
  get _editActionLabel() {
    return EditActionLabel;
  }
  get _verifyActionLabel() {
    return VerifyActionLabel;
  }
  get _addActionLabel() {
    return AddActionLabel;
  }
  get _firstName() {
    return this.profile?.firstName;
  }
  get _lastName() {
    return this.profile?.lastName;
  }
  get _email() {
    return this.profile?.email || NoDataLabel;
  }
  get _phone() {
    return this.profile?.phoneNumber || NoDataLabel;
  }
  get _showEmailPill() {
    return !!(this.passwordLessLoginEnabled && this.profile?.email);
  }
  get _showPhonePill() {
    return !!(this.passwordLessLoginEnabled && this.profile?.phoneNumber);
  }
  get _emailPillText() {
    return this.profile?.isEmailVerified ? VerifiedLabel : UnVerifiedLabel;
  }
  get _phonePillText() {
    return this.profile?.isPhoneVerified ? VerifiedLabel : UnVerifiedLabel;
  }
  get _emailPillClass() {
    return this.profile?.isEmailVerified ? 'pill' : 'pill unverified-pill';
  }
  get _phonePillClass() {
    return this.profile?.isPhoneVerified ? 'pill' : 'pill unverified-pill';
  }
  get _showEmailEditButton() {
    return !!(this.profile?.email && (!this.passwordLessLoginEnabled || this.profile?.isEmailVerified));
  }
  get _showPhoneEditButton() {
    return !!(this.profile?.phoneNumber && (this.profile.isPhoneVerified || this.profile.isEmailVerified || !this.passwordLessLoginEnabled));
  }
  get _showEmailVerifyButton() {
    return !!(this.passwordLessLoginEnabled && this.profile?.email && !this.profile?.isEmailVerified);
  }
  get _showPhoneVerifyButton() {
    return !!(this.passwordLessLoginEnabled && this.profile?.phoneNumber && !this.profile?.isPhoneVerified);
  }
  get _showPhoneAddButton() {
    return !this.profile?.phoneNumber;
  }
  dispatchProfileEvent(eventName, mode) {
    const detail = eventName === 'editprofile' ? {
      editMode: mode
    } : {
      verifyMode: mode
    };
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail
    }));
  }
  handlePersonalDetailsEditActionClick() {
    this.dispatchProfileEvent('editprofile', 'personalDetails');
  }
  handleEmailEditActionClick() {
    this.dispatchProfileEvent('editprofile', 'email');
  }
  handlePhoneEditActionClick() {
    this.dispatchProfileEvent('editprofile', 'phone');
  }
  handleEmailVerifyActionClick() {
    this.dispatchProfileEvent('verifyprofile', 'email');
  }
  handlePhoneVerifyActionClick() {
    this.dispatchProfileEvent('verifyprofile', 'phone');
  }
  handlePhoneAddActionClick() {
    this.dispatchEvent(new CustomEvent('addphone', {
      bubbles: true,
      composed: true
    }));
  }
}