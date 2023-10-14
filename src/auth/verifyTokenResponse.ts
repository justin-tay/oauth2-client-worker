import { jwtVerify } from 'jose';
import { AuthorizationRequest } from './AuthorizationRequest';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import { TokenResponse } from './TokenResponse';
import getRemoteJWKSet from './getRemoteJWKSet';

interface VerifyTokenResponseParams {
  tokenResponse: TokenResponse;
  authorizationRequest: AuthorizationRequest;
  clientConfig: ClientConfiguration;
  providerConfig: ProviderConfiguration;
}

const verifyTokenResponse = async (params: VerifyTokenResponseParams) => {
  const { tokenResponse, authorizationRequest, clientConfig, providerConfig } =
    params;
  const jwks = getRemoteJWKSet(providerConfig.jwksUri);
  if (jwks) {
    try {
      // The access_token may be an opaque token and can't be validated then
      if (clientConfig.audience) {
        const accessToken = await jwtVerify(tokenResponse.accessToken, jwks, {
          issuer: providerConfig.issuer,
          audience: clientConfig.audience,
        });
        console.log('Access Token', accessToken.payload);
        if (!accessToken.payload) {
          return false;
        }
      }

      if (tokenResponse.idToken) {
        const idToken = await jwtVerify(tokenResponse.idToken, jwks, {
          issuer: providerConfig.issuer,
          audience: clientConfig.clientId,
        });
        console.log('ID Token', idToken.payload);
        if (
          !idToken.payload ||
          idToken.payload.nonce !== authorizationRequest.nonce
        ) {
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  return false;
};

export default verifyTokenResponse;
