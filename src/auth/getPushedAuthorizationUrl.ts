import { AuthorizationRequest } from './AuthorizationRequest';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import getCodeChallenge from './getCodeChallenge';

const getPushedAuthorizationUrl = async (
  authorizationRequest: AuthorizationRequest,
  clientConfig: ClientConfiguration,
  providerConfig: ProviderConfiguration,
) => {
  const codeChallenge = await getCodeChallenge(
    authorizationRequest.codeVerifier,
  );

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

  const response = await fetch(
    providerConfig.pushedAuthorizationRequestEndpoint!,
    {
      method: 'POST',
      body: new URLSearchParams(params),
    },
  );
  const data = await response.json();
  const parResponse = {
    requestUri: data.request_uri,
    expiresIn: data.expires_in,
  };
  const url = new URL(providerConfig.authorizationEndpoint);
  url.searchParams.set('request_uri', parResponse.requestUri);
  url.searchParams.set('client_id', clientConfig.clientId);
  return url.toString();
};

export default getPushedAuthorizationUrl;
