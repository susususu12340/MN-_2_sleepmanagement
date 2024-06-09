import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import SleepData from './components/SleepData';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const register = async () => {
    try {
      await axios.post('http://localhost:8000/register', {
        username,
        password,
      });
      alert('Registration successful. Please log in.');
    } catch (error) {
      console.error('Registration error', error);
      alert('Registration failed.');
    }
  };

  const login = async () => {
    try {
      const response = await axios.post('http://localhost:8000/token', {
        username,
        password,
      });
      const { access_token } = response.data;
      setToken(access_token);
      const decoded = jwt_decode(access_token);
      setCurrentUser(decoded.sub);
    } catch (error) {
      console.error('Login error', error);
      alert('Login failed.');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentUser(response.data.username);
    } catch (error) {
      console.error('Fetch current user error', error);
      alert('Failed to fetch current user.');
    }
  };

  return (
    <div>
      <h1>Sleep Tracker</h1>
      {token ? (
        <SleepData token={token} />
      ) : (
        <div>
          <div>
            <h2>Register</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={register}>Register</button>
          </div>
          <div>
            <h2>Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={login}>Login</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
