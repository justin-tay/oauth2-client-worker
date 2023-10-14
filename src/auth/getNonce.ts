import getRandomValues from './getRandomValues';

/**
 * Gets the nonce to prevent replay of id token at token endpoint.
 *
 * @returns the nonce
 */
const getNonce = () => {
  return getRandomValues();
};

export default getNonce;
