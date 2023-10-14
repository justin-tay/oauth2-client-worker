import { AuthorizationRequest } from './AuthorizationRequest';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import getCodeChallenge from './getCodeChallenge';

const getAuthorizationUrl = async (
  authorizationRequest: AuthorizationRequest,
  clientConfig: ClientConfiguration,
  providerConfig: ProviderConfiguration,
) => {
  const codeChallenge = await getCodeChallenge(
    authorizationRequest.codeVerifier,
  );
  const url = new URL(providerConfig.authorizationEndpoint);
  let params: Record<string, string> = {
    response_type: 'code',
    client_id: clientConfig.clientId,
    redirect_uri: clientConfig.redirectUrl,
    scope: clientConfig.scopes.join(' '),
    state: authorizationRequest.state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    ...(clientConfig.scopes.includes('openid')
      ? { nonce: authorizationRequest.nonce }
      : {}),
  };
  if (clientConfig.authorizationRequestCustomizer) {
    params = clientConfig.authorizationRequestCustomizer(params);
  }
  Object.entries(params).forEach((entry) => {
    const [key, value] = entry;
    url.searchParams.set(key, value);
  });
  return url.toString();
};

export default getAuthorizationUrl;
