import BasePath from '@salesforce/community/basePath';
const SVG_PATH = BasePath + '/assets/images/social.svg#';
import { facebookRegex, facebookMessengerRegex, instagramRegex, linkedInRegex, mediumRegex, pinterestRegex, redditRegex, tumblrRegex, twitterRegex, vimeoRegex, whatsappRegex, youtubeRegex } from './siteRegex';
const ICON_TO_REGEX_MAP = new Map([['facebook', facebookRegex], ['facebookMessenger', facebookMessengerRegex], ['instagram', instagramRegex], ['linkedIn', linkedInRegex], ['medium', mediumRegex], ['pinterest', pinterestRegex], ['reddit', redditRegex], ['tumblr', tumblrRegex], ['twitter', twitterRegex], ['vimeo', vimeoRegex], ['whatsapp', whatsappRegex], ['youtube', youtubeRegex]]);
export function getDefaultIcon(url) {
  for (const [key, value] of ICON_TO_REGEX_MAP) {
    const regex = new RegExp(value);
    if (regex.test(url)) {
      return SVG_PATH + key;
    }
  }
  return SVG_PATH + 'general';
}