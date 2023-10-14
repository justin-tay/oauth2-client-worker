const keycloakBaseUrl = 'http://localhost:8080';
const realm = 'master';
const adminUsername = 'admin';
const adminPassword = 'admin';

const getAccessToken = async () => {
  const response = await fetch(
    `${keycloakBaseUrl}/realms/master/protocol/openid-connect/token`,
    {
      method: 'POST',
      body: new URLSearchParams({
        username: adminUsername,
        password: adminPassword,
        grant_type: 'password',
        client_id: 'admin-cli',
      }),
    },
  );
  const json = await response.json();
  return json.access_token;
};

const createClient = async (accessToken, body) => {
  console.log(body);
  const response = await fetch(
    `${keycloakBaseUrl}/admin/realms/${realm}/clients`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  console.log(response.statusText);
};

console.log('Getting admin token');
const accessToken = await getAccessToken();

console.log('Creating client');
await createClient(accessToken, {
  clientId: 'testclient',
  publicClient: true,
  webOrigins: [
    'http://localhost:4173',
    'http://localhost:5173',
    'https://localhost:4173',
    'https://localhost:5173',
  ],
  redirectUris: [
    'http://localhost:4173',
    'http://localhost:5173',
    'https://localhost:4173',
    'https://localhost:5173',
  ],
});
