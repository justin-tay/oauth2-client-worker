import { AuthorizationRequestCustomizer } from './AuthorizationRequestCustomizer';
import { TokenRequestCustomizer } from './TokenRequestCustomizer';

/**
 * Configuration for clients registered at an OpenID Connect provider.
 */
export interface ClientConfiguration {
  /**
   * The client id registered at the OpenID Connect provider.
   */
  clientId: string;

  /**
   * The scopes to request from the OpenID Connect provider.
   */
  scopes: string[];

  /**
   * The redirect url registered at the OpenID Connect provider.
   */
  redirectUrl: string;

  /**
   * The provider registration id that this client is registered at.
   */
  providerRegistrationId: string;

  /**
   * The audience the access token should have if it is a JWT token and
   * not an opaque token.
   */
  audience?: string;

  /**
   * The post logout redirect uri used for the end session endpoint.
   */
  postLogoutRedirectUri?: string;

  /**
   * Customize the authorization request to add additional parameters.
   */
  authorizationRequestCustomizer?: AuthorizationRequestCustomizer;

  /**
   * Customize the token request to add additional parameters.
   */
  tokenRequestCustomizer?: TokenRequestCustomizer;
}
