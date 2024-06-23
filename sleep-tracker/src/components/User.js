import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function User() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const history = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/register/', {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      history.push('/login');
      alert("新規登録が完了しました")
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
      const response = await axios.post('http://localhost:8000/token', new URLSearchParams({
        username,
        password
      }));
      localStorage.setItem('token', response.data.access_token);
      history('/sleeptracker');
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
            <div>
              <label>Username:</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
              <button onClick={register}>Register</button>
        </div>
        <div>
          <h2>Login</h2>
            <div>
              <label>Username:</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          <button onClick={login}>Login</button>
        </div>
      </div>
    </div>
  );
  
}

export default User;
