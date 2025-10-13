import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./components/LoginPage/LoginPage";
import HomePage from "./components/Home/Home";
import RoomDetail from './components/RoomDetail/RoomDetail';
import InvoiceListPage from './components/Invoice/InvoiceListPage';
import LeaseHistory from './components/LeaseHistory/LeaseHistory';
import PrivateRoute from './components/RouteGuard/PrivateRoute';
import RedirectIfAuthed from './components/RouteGuard/RedirectIfAuthed';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* หน้า login: ถ้ามี token อยู่แล้วให้พาไป /home */}
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />

          {/* root (/) ชี้ไป login */}
          <Route
            path="/"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />

          {/* หน้าหลังล็อกอินเท่านั้น */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/room-details/:roomNumber"
            element={
              <PrivateRoute>
                <RoomDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <InvoiceListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/lease-history"
            element={
              <PrivateRoute>
                <LeaseHistory />
              </PrivateRoute>
            }
          />

          {/* เส้นทางอื่นที่ไม่ตรง -> ส่งกลับไปหน้า login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
