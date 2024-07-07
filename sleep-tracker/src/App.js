import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import User from './components/User';
import SleepTracker from './components/SleepTracker';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/sleeptracker" element={SleepTracker()} />
        <Route path="/" element={<Navigate to="/sleeptracker" />}></Route>
      </Routes>
    </div>
  );
}

export default App;
