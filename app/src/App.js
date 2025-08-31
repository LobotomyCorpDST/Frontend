import './App.css';
import Home from "./components/Home";
import InvoiceHistory from "./components/InvoiceHistory";
import RoomList from "./components/RoomList";
import LoginPage from "./components/LoginPage";  // ← Import LoginPage
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