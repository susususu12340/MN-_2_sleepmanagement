import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://172.16.15.35:8000';

function User() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  
  const navigate = useNavigate();

  const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCurrentUsername(response.data.username);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/users/`, {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      alert("新規登録が完了しました");
      //navigate('/login'); // ログインページにリダイレクト
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
      } else {
        console.error('There was an error registering!', error);
      }
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/token`, {
        username: loginUsername,
        password: loginPassword
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      localStorage.setItem('token', response.data.access_token); // トークンをローカルストレージに保存
      await getCurrentUser();
      navigate('/sleeptracker'); // sleeptrackerページにリダイレクト
    } catch (error) {
      console.error('There was an error logging in!', error);
    }
  };

  return (
    <div className="App">
      <h1>睡眠管理アプリ</h1>
      <div>
        <div>
          <h2>Register</h2>
          <form onSubmit={register}>
            <div>
              <label>Username:</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit">Register</button>
          </form>
        </div>
        <div>
          <h2>Login</h2>
          <form onSubmit={login}>
            <div>
              <label>Username:</label>
              <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required />
            </div>
            <div>
              <label>Password:</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
        {currentUsername && (
          <div>
            <h2>Current User</h2>
            <p>Username: {currentUsername}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default User;
