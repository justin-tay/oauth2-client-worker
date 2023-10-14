import { AuthorizationRequest } from './AuthorizationRequest';

export interface RefreshTokenRequest {
  refreshToken: string;
  authorizationRequest: AuthorizationRequest;
}
