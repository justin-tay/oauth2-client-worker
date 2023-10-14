/**
 * Configuration for OpenID Connect providers.
 */
export interface ProviderConfiguration {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint?: string;
  registrationEndpoint?: string;
  endSessionEndpoint?: string;
  jwksUri?: string;
  pushedAuthorizationRequestEndpoint?: string;
  issuer: string;
}
