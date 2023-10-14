import { AuthorizationRequest } from './AuthorizationRequest';
import { TokenResponse } from './TokenResponse';

export interface AuthorizationContext {
  authorizationRequest: AuthorizationRequest;
  tokenResponse: TokenResponse;
}
