import './App.css';
import HomePage from "./components/Home/Home";
import LoginPage from "./components/LoginPage/LoginPage";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomDetail from './components/RoomDetail/RoomDetail';
import RoomList from './components/RoomList/RoomList';
import InvoiceHistory from './components/InvoiceHistory/InvoiceHistory';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/room-details/:roomNumber" element={<RoomDetail />} />
                    <Route path="/room-list" element={<RoomList />} />
                    <Route path="/invoice-history" element={<InvoiceHistory />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
