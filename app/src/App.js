import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./components/LoginPage/LoginPage";
import HomePage from "./components/Home/Home";
import HomePageForGuest from "./components/HomeForGuest/HomeForGuest";
import HomeForUser from "./components/HomeForUser/HomeForUser";
import RoomDetail from './components/RoomDetail/RoomDetail';
import InvoiceListPage from './components/Invoice/InvoiceListPage';
import LeaseHistory from './components/LeaseHistory/LeaseHistory';
import TenantDetail from "./components/TenantDetail/TenantDetail";
import PrivateRoute from './components/RouteGuard/PrivateRoute';
import RedirectIfAuthed from './components/RouteGuard/RedirectIfAuthed';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* ===== LOGIN & ROOT ===== */}
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />

          {/* ===== DASHBOARDS ===== */}
          {/* Main home for ADMIN, STAFF, USER - role-based navigation within components */}
          <Route
            path="/home"
            element={
              <PrivateRoute allowedRoles={['ADMIN', 'STAFF', 'USER']}>
                <HomePage />
              </PrivateRoute>
            }
          />

          {/* Guest-specific home - dashboard only, no maintenance */}
          <Route
            path="/home-guest"
            element={
              <PrivateRoute allowedRoles={['GUEST']}>
                <HomePageForGuest />
              </PrivateRoute>
            }
          />

          {/* Legacy route - redirect to /home */}
          <Route path="/home-user" element={<Navigate to="/home" replace />} />

          {/* ===== OTHER PROTECTED ROUTES ===== */}
          {/* Room details: ADMIN, STAFF, and USER (USER can only view their own room) */}
          <Route
            path="/room-details/:roomNumber"
            element={
              <PrivateRoute allowedRoles={['ADMIN', 'STAFF', 'USER']}>
                <RoomDetail />
              </PrivateRoute>
            }
          />

          <Route
            path="/tenant-details/:tenantId"
            element={
              <PrivateRoute allowedRoles={['ADMIN', 'STAFF']}>
                <TenantDetail />
              </PrivateRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <PrivateRoute allowedRoles={['ADMIN', 'STAFF']}>
                <InvoiceListPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/lease-history"
            element={
              <PrivateRoute allowedRoles={['ADMIN', 'STAFF']}>
                <LeaseHistory />
              </PrivateRoute>
            }
          />

          {/* ===== CATCH-ALL ===== */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
