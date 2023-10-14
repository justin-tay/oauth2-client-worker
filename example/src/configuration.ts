const keycloakBaseUrl = import.meta.env.VITE_KEYCLOAK_BASE_URL;
const redirectUrl = import.meta.env.VITE_REDIRECT_URL;

const configuration = {
  keycloakBaseUrl,
  redirectUrl,
};

export default configuration;
