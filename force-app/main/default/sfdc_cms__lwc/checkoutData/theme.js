export function getThemeVersion() {
  const themeVersion = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--com-c-theme-version') : '2';
  return themeVersion ? Number(themeVersion) : undefined;
}