import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import User from './components/User';
import SleepTracker from './components/SleepTracker';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/user" element={User()} />
        <Route path="/sleeptracker" element={SleepTracker()} />
        <Route path="/" element={<Navigate to="/user" />}></Route>
      </Routes>
    </div>
  );
}

export default App;
