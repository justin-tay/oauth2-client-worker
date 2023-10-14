import encodeBase64Url from './encodeBase64Url';

/**
 * Generates random values.
 *
 * @returns the random values
 */
const getRandomValues = () => {
  const values = new Uint32Array(32);
  crypto.getRandomValues(values);
  return encodeBase64Url(values);
};

export default getRandomValues;
