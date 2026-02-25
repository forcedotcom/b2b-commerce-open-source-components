function addressValueProcessor(addressText) {
  const addressValue = {
    city: '',
    country: '',
    postalcode: '',
    state: '',
    street: ''
  };
  const addressString = addressText.match(/\[(.*?)\]/);
  const address = addressString ? addressString[1].split(',') : null;
  if (address) {
    [addressValue.street, addressValue.city, addressValue.state, addressValue.country, addressValue.postalcode] = address;
  }
  return addressValue;
}
function geolocationValueProcessor(geolocationText) {
  const geolocationValue = {
    latitude: '',
    longitude: ''
  };
  const geolocationString = geolocationText.match(/\[(.*?)\]/);
  const geolocation = geolocationString ? geolocationString[1].split(' ') : null;
  if (geolocation) {
    [geolocationValue.latitude, geolocationValue.longitude] = geolocation;
  }
  return geolocationValue;
}
export default function fieldValueProcessor(field, type) {
  if (field.text && type === 'address') {
    return addressValueProcessor(field.text);
  }
  if (field.text && type === 'geolocation') {
    return geolocationValueProcessor(field.text);
  }
  return field.text;
}