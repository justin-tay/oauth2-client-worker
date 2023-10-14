export interface AuthorizationRequest {
  codeVerifier: string;
  state: string;
  nonce: string;
}
