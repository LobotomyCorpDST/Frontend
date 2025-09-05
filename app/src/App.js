import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from "./components/LoginPage/LoginPage";
import HomePage from "./components/Home/Home";
import RoomDetail from './components/RoomDetail/RoomDetail';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/room-details/:roomNumber" element={<RoomDetail />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
