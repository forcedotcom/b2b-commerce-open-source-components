function isDefaultLanguage(basePath, currentSiteLanguage) {
  return !new RegExp('\\/' + currentSiteLanguage).test(basePath);
}
export function changeLocale(url, basePath, currentSiteLanguage, newLocale) {
  if (typeof window !== 'undefined') {
    const newBasePath = isDefaultLanguage(basePath, currentSiteLanguage) ? `${basePath}/${newLocale}` : basePath.replace(new RegExp(`/${currentSiteLanguage}$`), '/' + newLocale);
    globalThis.location.href = globalThis.location.origin + newBasePath + url.substring(basePath.length);
  }
}