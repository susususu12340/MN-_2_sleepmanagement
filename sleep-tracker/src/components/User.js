import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Paper, Grid } from '@mui/material';

const API_BASE_URL = 'http://localhost:8000';

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
      localStorage.setItem('token', response.data.access_token);
      await getCurrentUser();
      navigate('/sleeptracker');
    } catch (error) {
      console.error('There was an error logging in!', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" align="center" gutterBottom>
        睡眠管理アプリ
      </Typography>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" align="center" gutterBottom>
              Register
            </Typography>
            <form onSubmit={register}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Box textAlign="center" marginTop={2}>
                <Button type="submit" variant="contained" color="primary">
                  Register
                </Button>
              </Box>
            </form>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" align="center" gutterBottom>
              Login
            </Typography>
            <form onSubmit={login}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <Box textAlign="center" marginTop={2}>
                <Button type="submit" variant="contained" color="primary">
                  Login
                </Button>
              </Box>
            </form>
          </Grid>
          {currentUsername && (
            <Grid item xs={12}>
              <Typography variant="h5" align="center" gutterBottom>
                Current User
              </Typography>
              <Typography variant="body1" align="center">
                Username: {currentUsername}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

export default User;

