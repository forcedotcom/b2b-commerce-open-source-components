import labels from './labels';
const {
  nameValueWithSeparator
} = labels;
export default function generateText(name, value) {
  return nameValueWithSeparator.replace('{name}', name).replace('{value}', value);
}