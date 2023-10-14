import encodeBase64Url from './encodeBase64Url';

/**
 * Gets the S256 code_challenge.
 *
 * @param codeVerifier the code_verifier
 * @returns the code_challenge
 */
const getCodeChallenge = async (codeVerifier: string) => {
  const digest = await crypto.subtle.digest(
    { name: 'SHA-256' },
    new TextEncoder().encode(codeVerifier),
  );
  return encodeBase64Url(digest);
};

export default getCodeChallenge;
