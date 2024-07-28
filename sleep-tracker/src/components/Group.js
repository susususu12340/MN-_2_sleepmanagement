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

const API_BASE_URL = 'http://localhost:8000';
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
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="メッセージを入力してください"
      />
      <button onClick={handleSend}>送信</button>
    </div>
  );
};

const ChatDisplay = ({ messages }) => {
  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index}>{msg.user_name}: {msg.message}</div>
      ))}
    </div>
  );
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bedtime, setBedtime] = useState("");
  const [wakeup, setWakeup] = useState("");
  const [sleepData, setSleepData] = useState([]);
  const [groupname, setGroupname] = useState('');
  const [grouppassword, setGroupPassword] = useState('');
  const [currentgroupid, setCurrenGroupId] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentUserid, setCurrentUserid] = useState('');
  const [messages, setMessages] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserSleepData, setSelectedUserSleepData] = useState([]);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

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
      return response.data.id;  // ユーザーIDを返す
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

      fetchChatData(Group_id);
      fetchGroupUsers(Group_id);

      const ws = new WebSocket(`ws://localhost:8000/ws/${Group_id}`);
      ws.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      };

      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
        }
        ws.close();
      };
    }
  }, [location.pathname]);

  const fetchSleepData = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE_URL}/sleep-data/week`, {
        params: { user_id: userId, date: new Date().toISOString().split('T')[0] },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sleepTimes = response.data.map(entry => entry.sleeptime || 0);
      setSleepData(sleepTimes);
      chartRef.current.data.datasets[0].data = sleepTimes;
      chartRef.current.update();
    } catch (error) {
      console.error('Error fetching sleep data:', error);
    }
  };


  const handleUserChange = (event) => {
    const userId = event.target.value;
    setSelectedUser(userId);
    fetchSleepData(userId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    const previous_day = new Date();
    previous_day.setDate(previous_day.getDate() - 1);

    console.log(bedtime);

    const bedtimes = new Date(bedtime).getTime();
    const wakeups = new Date(wakeup).getTime();
    let dayofweek = new Date(bedtime).getDay() - 1;
    if (dayofweek === -1) {
      dayofweek = 6;
    }
    console.log(dayofweek);
    var diff = wakeups - bedtimes;

    chartRef.current.data.datasets[0].data[dayofweek] = Math.abs(diff) / (60 * 60 * 1000);

    chartRef.current.update();
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
    <div className="App">
      <h1>睡眠管理アプリ</h1>
      <div>
        {groupname && (
          <div>
            <h2>グループ名</h2>
            <p>グループ: {groupname}</p>
          </div>
        )}
      </div>
      <canvas id="chart" ref={canvasRef} />
      <h2>抜ける</h2>
      <form onSubmit={Back}>
        <button type="submit">抜ける</button>
      </form>
      <div>
        <h2>Chat</h2>
        <ChatDisplay messages={messages} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
      <div>
        <h2>グループメンバーの睡眠データ</h2>
        <select onChange={handleUserChange}>
          <option value="">ユーザーを選択してください</option>
          {groupUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        {selectedUser && (
          <div>
            <h3>ユーザー: {groupUsers.find(user => user.id === selectedUser)?.username}</h3>
            {selectedUserSleepData.map((data, index) => (
              <div key={index}>
                <p>日付: {data.date}</p>
                <p>睡眠時間: {data.sleeptime} 時間</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
