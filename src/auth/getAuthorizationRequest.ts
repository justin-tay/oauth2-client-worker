import getCodeVerifier from './getCodeVerifier';
import getNonce from './getNonce';
import getState from './getState';

/**
 * Gets the authorization request.
 *
 * @returns the authorization request
 */
const getAuthorizationRequest = () => {
  return {
    codeVerifier: getCodeVerifier(),
    state: getState(),
    nonce: getNonce(),
  };
};

export default getAuthorizationRequest;
