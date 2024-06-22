
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

const labels = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];

const initialData = {
  labels,
  datasets: [
    {
      type: "bar", // 棒グラフ
      label: "睡眠時間",
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "white",
      borderWidth: 2,
      data: [9, 10, 8, 9, 0, 0, 0],
      yAxisID: "y" // Y軸の設定
    },
    // {
    //   type: "line", // 折れ線
    //   label: "就寝時間",
    //   borderColor: "rgb(53, 162, 235)",
    //   borderWidth: 2,
    //   fill: false,
    //   data: ['23:30', '23:10', '23:00', '23:40', '00:00', '00:00', '00:00'],
    //   yAxisID: "y1" // optionsで設定したIDを割り振ってY軸を設定する
    // },
    // {
    //   type: "line", // 折れ線
    //   label: "起床時間",
    //   borderColor: "rgb(53, 162, 235)",
    //   borderWidth: 2,
    //   fill: false,
    //   data: ['07:30', '09:10', '08:00', '08:40', '00:00', '00:00', '00:00'],
    //   yAxisID: "y1" // optionsで設定したIDを割り振ってY軸を設定する
    // },
  ]
};

export const options = {
  plugins: {
    title: {
      display: true,
      text: "睡眠データ"
    },
    legend: { // 凡例の設定
      position: "bottom" // 下に配置
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
    // y1: { // Y軸が複数あるのでyとy1のように軸にIDを付ける
    //   scaleLabel: { display: true, labelString: '時間' },
    //   //type: 'time',
    //   time: { parser: 'HH:mm', unit: 'hour', stepSize: 1, displayFormats: { 'hour': 'HH:mm' } },
    //   ticks: { min: '00:00', max: '24:00' }
    // },
  }
};

export default function App() {
  const [bedtime, setBedtime] = useState("");
  const [wakeup, setWakeup] = useState("");
  const [sleepData, setSleepData] = useState([]);

  const chartRef = useRef(null); // chartの参照を取得するため必要

  useEffect(() => {
    const ctx = document.getElementById("chart").getContext("2d");
    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: initialData,
      options: options
    });
    return () => {
      chartRef.current.destroy();
    };
  }, []);

  const fetchSleepData = async () => {
    const response = await axios.get("http://localhost:8000/sleep-data/");
    setSleepData(response.data);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    const previous_day = new Date();
    previous_day.setDate(previous_day.getDate() - 1);

    console.log(bedtime)

    const bedtimes = new Date(bedtime).getTime();
    const wakeups = new Date(wakeup).getTime();
    let dayofweek = new Date(bedtime).getDay() - 1;
    console.log(dayofweek)
    var diff = wakeups - bedtimes;

    // ref.currentでchartの参照にアクセスできる
    //chartRef.current.data.datasets[0].data[dayofweek] = bedtime;
    //chartRef.current.data.datasets[1].data[dayofweek] = wakeup;
    chartRef.current.data.datasets[0].data[dayofweek] = Math.abs(diff) / (60 * 60 * 1000);

    chartRef.current.update(); // update()を呼ぶと再レンダリングする
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
      <canvas id="chart" />
    </div>
  );
}