import { UserProfileMenuAltLabel, UserProfileWithCompanyNameAltLabel } from './labels';
export default function userProfileMenuAltLabelGenerator(userName, companyName) {
  if (companyName) {
    return UserProfileWithCompanyNameAltLabel.replace('{userName}', userName).replace('{companyName}', companyName);
  }
  return UserProfileMenuAltLabel.replace('{userName}', userName);
}