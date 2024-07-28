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
const URL_PATH = "/sleeptracker";

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

export default function SleepTracker() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bedtime, setBedtime] = useState("");
  const [wakeup, setWakeup] = useState("");
  const [sleepData, setSleepData] = useState(initialData.datasets[0].data);

  const [groupname, setGroupname] = useState('');
  const [grouppassword, setGroupPassword] = useState('');

  const [logingroupname, setLogingroupname] = useState('');
  const [logingroupPassword, setLogingroupPassword] = useState('');

  const [currentUsername, setCurrentUsername] = useState('');
  const [currentUserid, setCurrentUserid] = useState('');

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

  useEffect(() => {
    if (location.pathname === URL_PATH) {
      getCurrentUser().then(userId => {
        if (userId) {
          fetchSleepData(userId);
        }
      });

      const ctx = document.getElementById("chart").getContext("2d");
      chartRef.current = new ChartJS(ctx, {
        type: 'bar',
        data: initialData,
        options: options
      });

      return () => {
        chartRef.current.destroy();
      };
    }
  }, [location.pathname]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const input_date = new Date(bedtime).toISOString().split("T")[0];
    const previous_day = new Date();
    previous_day.setDate(previous_day.getDate() - 1);

    const bedtimes = new Date(bedtime).getTime();
    const wakeups = new Date(wakeup).getTime();
    let dayofweek = new Date(bedtime).getDay() - 1;
    if (dayofweek === -1) {
      dayofweek = 6;
    }
    const diff = Math.abs(wakeups - bedtimes) / (60 * 60 * 1000);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/sleep-data/`, {
        user_id: currentUserid,
        date: input_date,
        bedtime: new Date(bedtime).toISOString(),
        wakeup: new Date(wakeup).toISOString(),
        sleeptime: diff
      }, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      chartRef.current.data.datasets[0].data[dayofweek] = diff;
      chartRef.current.update();
    } catch (error) {
      console.error('Error submitting sleep data:', error);
    }
  };

  const register_group = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/create_group/`, {
        group_name: groupname,
        hashed_password: grouppassword,
        user_id: currentUserid,
        username: currentUsername
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert("新規登録が完了しました");
    } catch (error) {
      console.error('Error registering group:', error.response ? error.response.data : error);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/move_group/`, {
        group_name: logingroupname,
        hashed_password: logingroupPassword,
        user_id: currentUserid,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert("グループページに移動します。");
      localStorage.setItem('group_id', response.data.id);
      navigate('/Group');
    } catch (error) {
      console.error('Error logging in:', error.response ? error.response.data : error);
    }
  };

  return (
    <div className="App">
      <h1>睡眠管理アプリ</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>就寝時間 : </label>
          <input
            type="datetime-local"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
          />
        </div>
        <div>
          <label>起床時間 : </label>
          <input
            type="datetime-local"
            value={wakeup}
            onChange={(e) => setWakeup(e.target.value)}
          />
        </div>
        <button type="submit" id="btn">Submit</button>
      </form>
      <canvas id="chart" ref={canvasRef} />
      <div>
        <h2>Register</h2>
        <form onSubmit={register_group}>
          <div>
            <label>Username:</label>
            <input type="text" value={groupname} onChange={(e) => setGroupname(e.target.value)} required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={grouppassword} onChange={(e) => setGroupPassword(e.target.value)} required />
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
      <div>
        <h2>Login</h2>
        <form onSubmit={login}>
          <div>
            <label>Username:</label>
            <input type="text" value={logingroupname} onChange={(e) => setLogingroupname(e.target.value)} required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={logingroupPassword} onChange={(e) => setLogingroupPassword(e.target.value)} required />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
