import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import StatusBar from './components/layout/StatusBar';
import ToastContainer from './components/common/Toast';
import LoadingBar from './components/common/LoadingBar';
import Dashboard from './pages/Dashboard';
import Live from './pages/Live';
import Schedule from './pages/Schedule';
import Weekend from './pages/Weekend';
import Results from './pages/Results';
import Grid from './pages/Grid';
import Standings from './pages/Standings';
import Driver from './pages/Driver';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app">
          <LoadingBar />
          <Sidebar />
          <div className="app__main">
            <Header />
            <main className="app__content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/live" element={<Live />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/weekend/:meetingKey" element={<Weekend />} />
                <Route path="/results" element={<Results />} />
                <Route path="/results/:sessionKey" element={<Results />} />
                <Route path="/grid" element={<Grid />} />
                <Route path="/grid/:sessionKey" element={<Grid />} />
                <Route path="/standings" element={<Standings />} />
                <Route path="/driver/:driverNumber" element={<Driver />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
            <StatusBar />
          </div>
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
