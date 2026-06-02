import { couponCodeValueWithPromotionNameSeparator } from './labels';
export function generateDisplayablePromotionName(name, code) {
  let text = '';
  let textSrc;
  const codeExists = typeof code === 'string' && code.length > 0;
  const nameExists = typeof name === 'string' && name.length > 0;
  if (codeExists) {
    textSrc = nameExists ? couponCodeValueWithPromotionNameSeparator : code;
  } else {
    text = name;
  }
  if (textSrc) {
    text = textSrc.replace('{code}', code);
    text = text.replace('{name}', name);
  }
  return text;
}