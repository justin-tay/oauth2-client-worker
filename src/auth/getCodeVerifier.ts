import getRandomValues from './getRandomValues';

/**
 * Gets the code_verifier for PKCE.
 *
 * @returns the code_verifier
 */
const getCodeVerifier = () => {
  return getRandomValues();
};

export default getCodeVerifier;
