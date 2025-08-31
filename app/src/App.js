import './App.css';
import HomePage from "./components/Home/Home";
import LoginPage from "./components/LoginPage/LoginPage";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/home" element={<HomePage />} />
                    {/* Remove individual routes for RoomList and InvoiceHistory */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;