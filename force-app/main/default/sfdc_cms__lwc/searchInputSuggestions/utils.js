export const generateRandomId = () => {
  const randomStr = Math.random().toString(36).substring(2, 9);
  return randomStr;
};