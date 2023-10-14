import { AuthorizationRequest } from './AuthorizationRequest';

/**
 * The authorization request context for the authorization requests sent to the OpenID Connect provider.
 *
 * This is uniquely identified by the state parameter.
 */
export interface AuthorizationRequestContext {
  authorizationRequest: AuthorizationRequest;
  clientRegistrationId: string;
}
