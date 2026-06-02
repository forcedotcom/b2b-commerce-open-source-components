const validatePersonalDetails = (profile, editData) => {
  const {
    firstName: editFirstName,
    lastName: editLastName
  } = editData;
  const {
    firstName: profileFirstName,
    lastName: profileLastName
  } = profile;
  if (editFirstName === profileFirstName && editLastName === profileLastName) {
    return false;
  }
  if (editFirstName === profileFirstName && editLastName === undefined || editLastName === profileLastName && editFirstName === undefined) {
    return false;
  }
  if (editFirstName === '' || editLastName === '') {
    return false;
  }
  return Boolean(editFirstName || editLastName);
};
const validateEmail = (profile, editData) => {
  const {
    email: updatedEmail,
    confirmEmail
  } = editData;
  const email = profile?.email;
  return !!updatedEmail && !!confirmEmail && updatedEmail !== email && updatedEmail === confirmEmail;
};
const validatePhoneNumber = (profile, editData) => {
  const {
    phoneNumber: updatedPhone,
    confirmPhoneNumber
  } = editData;
  const phone = profile?.phoneNumber;
  return !!updatedPhone && !!confirmPhoneNumber && updatedPhone !== phone && updatedPhone === confirmPhoneNumber;
};
export const validate = (profile = {}, editData, editMode) => {
  switch (editMode) {
    case 'personalDetails':
      return validatePersonalDetails(profile, editData);
    case 'email':
      return validateEmail(profile, editData);
    case 'phone':
      return validatePhoneNumber(profile, editData);
    default:
      return false;
  }
};
export const validateEmailConfirmation = editData => {
  return !editData.email || !editData.confirmEmail || editData.email === editData.confirmEmail;
};
export const validatePhoneConfirmation = editData => {
  return !editData.phoneNumber || !editData.confirmPhoneNumber || editData.phoneNumber === editData.confirmPhoneNumber;
};
export const validateEmailIsDifferent = (email, updatedEmail) => {
  return !email || !updatedEmail || email !== updatedEmail;
};
export const validatePhoneIsDifferent = (phone, updatedPhone) => {
  return !phone || !updatedPhone || phone !== updatedPhone;
};