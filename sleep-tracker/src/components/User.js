import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function User() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const history = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/users/', {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      alert("新規登録が完了しました");
      //history('/login'); // ログインページにリダイレクト
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
      const response = await axios.post('http://localhost:8000/token', {
        username: loginUsername,
        password: loginPassword
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      localStorage.setItem('token', response.data.access_token); // トークンをローカルストレージに保存
      history('/sleeptracker'); // sleeptrackerページにリダイレクト
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
      </div>
    </div>
  );
}

export default User;
