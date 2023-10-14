/**
 * Encodes the bytes using base64url encoding.
 *
 * @param bytes to encode
 * @returns the encoded string
 */
const encodeBase64Url = (bytes: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export default encodeBase64Url;
