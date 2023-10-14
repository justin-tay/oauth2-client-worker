import { JWTVerifyGetKey, RemoteJWKSetOptions, createRemoteJWKSet } from 'jose';

const jwksRegistry = new Map<string, JWTVerifyGetKey>();

const getRemoteJWKSet = (
  jwksUri?: string,
  options?: RemoteJWKSetOptions,
): JWTVerifyGetKey | null => {
  if (jwksUri) {
    let jwks = jwksRegistry.get(jwksUri);
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(jwksUri), options);
      jwksRegistry.set(jwksUri, jwks);
    }
    return jwks;
  }
  return null;
};

export default getRemoteJWKSet;
