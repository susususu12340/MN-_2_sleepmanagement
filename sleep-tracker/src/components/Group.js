import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Title,
  TimeScale
} from "chart.js";
import "chart.js/auto";
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Paper, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Title,
  TimeScale
);

const API_BASE_URL = 'http://172.16.15.35:8000';
const WS_BASE_URL = '172.16.15.35:8000';
//const API_BASE_URL = 'http://localhost:8000';
const URL_PATH = "/Group";

const labels = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];

const initialData = {
  labels,
  datasets: [
    {
      type: "bar",
      label: "睡眠時間",
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "white",
      borderWidth: 2,
      data: [0, 0, 0, 0, 0, 0, 0],
      yAxisID: "y"
    },
  ]
};

export const options = {
  plugins: {
    title: {
      display: true,
      text: "睡眠データ"
    },
    legend: {
      position: "bottom"
    }
  },
  responsive: true,
  scales: {
    x: {
      stacked: false
    },
    y: {
      stacked: false,
      max: 24,
      min: 0
    },
  }
};

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <Box display="flex" mt={2}>
      <TextField
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="メッセージを入力してください"
        variant="outlined"
      />
      <Button variant="contained" color="primary" onClick={handleSend} sx={{ ml: 2 }}>
        送信
      </Button>
    </Box>
  );
};

const ChatDisplay = ({ messages, currentUserid }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box mt={2} p={2} border={1} borderColor="grey.400" borderRadius={2} height={300} overflow="auto">
      {messages.map((msg, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent={msg.user_id === currentUserid ? "flex-end" : "flex-start"}
          mb={1}
        >
          <Box
            px={2}
            py={1}
            borderRadius={16}
            bgcolor={msg.user_id === currentUserid ? "primary.main" : "grey.300"}
            color={msg.user_id === currentUserid ? "white" : "black"}
            maxWidth="70%"
          >
            <Typography variant="body2">
              {msg.user_name}: {msg.message}
            </Typography>
          </Box>
        </Box>
      ))}
      <div ref={chatEndRef} />
    </Box>
  );
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [groupname] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentUserid, setCurrentUserid] = useState('');
  const [messages, setMessages] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [comparisonUser, setComparisonUser] = useState('');
  const chartRef = useRef(null);
  const comparisonChartRef = useRef(null);
  const canvasRef = useRef(null);
  const comparisonCanvasRef = useRef(null);

  const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCurrentUsername(response.data.username);
      setCurrentUserid(response.data.id);
      console.log('Username set:', response.data.username);
      console.log('User ID set:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  const fetchChatData = async (groupId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/${groupId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  };

  const fetchGroupUsers = async (groupId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE_URL}/group_users/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setGroupUsers(response.data);
    } catch (error) {
      console.error('Error fetching group users:', error);
    }
  };

  useEffect(() => {
    if (location.pathname === URL_PATH) {
      const Group_id = localStorage.getItem('group_id');
      console.log(Group_id);

      getCurrentUser().then(userId => {
        if (userId) {
          fetchSleepData(userId);
        }
      });

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        chartRef.current = new ChartJS(ctx, {
          type: 'bar',
          data: initialData,
          options: options
        });
      }

      if (comparisonCanvasRef.current) {
        const ctx = comparisonCanvasRef.current.getContext("2d");
        comparisonChartRef.current = new ChartJS(ctx, {
          type: 'bar',
          data: initialData,
          options: options
        });
      }

      fetchChatData(Group_id);
      fetchGroupUsers(Group_id);

      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
        }
        if (comparisonChartRef.current) {
          comparisonChartRef.current.destroy();
        }
      };
    }
  }, [location.pathname]);

  useEffect(() => {
    const Group_id = localStorage.getItem('group_id');

    const ws = new WebSocket(`ws://${WS_BASE_URL}/ws/${Group_id}`);
    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchSleepData = async (userId, chart = chartRef) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE_URL}/sleep-data/week`, {
        params: { user_id: userId, date: new Date().toISOString().split('T')[0] },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sleepTimes = response.data.map(entry => entry.sleeptime || 0);
      if (chart === chartRef) {
        //setSleepData(sleepTimes);
      } else {
        //setComparisonUserSleepData(sleepTimes);
      }
      chart.current.data.datasets[0].data = sleepTimes;
      chart.current.update();
    } catch (error) {
      console.error('Error fetching sleep data:', error);
    }
  };

  const handleUserChange = (event) => {
    const userId = event.target.value;
    setSelectedUser(userId);
    fetchSleepData(userId, chartRef);
  };

  const handleComparisonUserChange = (event) => {
    const userId = event.target.value;
    setComparisonUser(userId);
    fetchSleepData(userId, comparisonChartRef);
  };

  const Back = async (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('group_id', 0);
      navigate('/sleeptracker');
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
      } else {
        console.error('There was an error registering!', error);
      }
    }
  };

  const handleSendMessage = async (message) => {
    try {
      const Group_id = localStorage.getItem('group_id');
      const newMessage = {
        group_id: Group_id,
        user_id: currentUserid,
        user_name: currentUsername,
        message: message,
      };
      await axios.post(`${API_BASE_URL}/chats/`, newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h3" align="center" gutterBottom>
        睡眠管理アプリ
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        {groupname && (
          <Box mb={2}>
            <Typography variant="h6">グループ名</Typography>
            <Typography variant="body1">グループ: {groupname}</Typography>
          </Box>
        )}
        <FormControl fullWidth>
          <InputLabel id="select-user-label">ユーザーを選択してください</InputLabel>
          <Select
            labelId="select-user-label"
            value={selectedUser}
            onChange={handleUserChange}
            label="ユーザーを選択してください"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {groupUsers.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <canvas id="chart" ref={canvasRef} />
      </Paper>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="select-comparison-user-label">比較するユーザーを選択してください</InputLabel>
          <Select
            labelId="select-comparison-user-label"
            value={comparisonUser}
            onChange={handleComparisonUserChange}
            label="比較するユーザーを選択してください"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {groupUsers.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <canvas id="comparison-chart" ref={comparisonCanvasRef} />
      </Paper>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Chat
        </Typography>
        <ChatDisplay messages={messages} currentUserid={currentUserid} />
        <ChatInput onSendMessage={handleSendMessage} />
      </Paper>
      <Box textAlign="center" mt={3}>
        <form onSubmit={Back}>
          <Button type="submit" variant="contained" color="secondary">
            抜ける
          </Button>
        </form>
      </Box>
    </Container>
  );
}
