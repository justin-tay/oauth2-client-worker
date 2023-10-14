import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
// eslint-disable-next-line import/no-absolute-path
import viteLogo from '/vite.svg';
import './App.css';
import { User } from './User';
import configuration from './configuration';

const { keycloakBaseUrl } = configuration;

navigator.serviceWorker.addEventListener('message', (event) => {
  console.log(event);
});

function App() {
  const [users, setUsers] = useState<User[]>();
  const [fetchUsers, setFetchUsers] = useState<number>(0);

  const handleFetchUsers = () => {
    sessionStorage.setItem('fetchUsers', 'true');
    setFetchUsers(fetchUsers + 1);
  };

  const handleLogout = async () => {
    try {
      await fetch(
        `${keycloakBaseUrl}/realms/master/protocol/openid-connect/logout`,
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${keycloakBaseUrl}/admin/realms/master/users?first=0&max=999999&enabled=true`,
          { signal },
        );
        if (response.ok) {
          setUsers(await response.json());
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (fetchUsers) {
      fetchData();
    }
    return () => {
      controller.abort();
    };
  }, [fetchUsers]);

  useEffect(() => {
    if (sessionStorage.getItem('fetchUsers')) {
      handleFetchUsers();
    }
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => handleFetchUsers()}>Get Users</button>
        <button onClick={() => handleLogout()}>Logout</button>
      </div>
      {users?.map((user) => <div key={user.id}>{user.username}</div>)}
    </>
  );
}

export default App;
