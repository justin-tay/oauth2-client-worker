import { AuthorizationRequest } from './AuthorizationRequest';

export interface AuthorizationCodeAccessTokenRequest {
  code: string;
  authorizationRequest: AuthorizationRequest;
}
