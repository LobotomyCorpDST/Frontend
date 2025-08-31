import './App.css';
import Home from "./components/Home/Home";
import InvoiceHistory from "./components/InvoiceHistory/InvoiceHistory";
import RoomList from "./components/RoomList/RoomList";
import LoginPage from "./components/LoginPage/LoginPage";  // ← Import LoginPage
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/room-list" element={<RoomList />} />
                    <Route path="/invoice-history" element={<InvoiceHistory />} />
                    <Route path="/" element={<LoginPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;