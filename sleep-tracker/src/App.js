import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import User from './components/User';
import SleepTracker from './components/SleepTracker';
import Chat from './components/Chat';
import Group from './components/Group';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/user" element={User()} />
        <Route path="/sleeptracker" element={SleepTracker()} />
        <Route path="/Chat" element={Chat()} />
        <Route path="/Group" element={Group()} />
        <Route path="/" element={<Navigate to="/user" />}></Route>
      </Routes>
    </div>
  );
}

export default App;
