import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const SleepData = ({ token }) => {
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [sleepData, setSleepData] = useState([]);

  const fetchSleepData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/sleepdata', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSleepData(response.data);
    } catch (error) {
      console.error('Error fetching sleep data', error);
    }
  };

  useEffect(() => {
    fetchSleepData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/sleepdata', {
        sleep_time: new Date(sleepTime),
        wake_time: new Date(wakeTime),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSleepData();
    } catch (error) {
      console.error('Error saving sleep data', error);
    }
  };

  const data = {
    labels: sleepData.map((d) => new Date(d.sleep_time).toLocaleDateString()),
    datasets: [
      {
        label: 'Sleep Duration (hours)',
        data: sleepData.map((d) => d.sleep_duration),
        fill: false,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <div>
      <h2>Sleep Data</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Sleep Time:</label>
          <input
            type="datetime-local"
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Wake Time:</label>
          <input
            type="datetime-local"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            required
          />
        </div>
        <button type="submit">Save</button>
      </form>
      <div>
        <Line data={data} />
      </div>
    </div>
  );
};

export default SleepData;
