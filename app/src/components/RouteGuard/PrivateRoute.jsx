import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute that works when used like:
 *  <PrivateRoute allowedRoles={['ADMIN','STAFF']}><Home/></PrivateRoute>
 *
 * Props:
 *  - allowedRoles: optional array of uppercased role names (e.g. ['ADMIN','GUEST'])
 *  - children: the protected component(s)
 */
export default function PrivateRoute({ allowedRoles = null, children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const rawRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const role = rawRole ? String(rawRole).toUpperCase() : null;

  // not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // if allowedRoles provided and current role not in list -> redirect appropriately
  if (allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(role)) {
    // if the current user is a guest, send to guest home
    if (role === 'GUEST') return <Navigate to="/home-guest" replace />;
    // otherwise send to admin home
    return <Navigate to="/home" replace />;
  }

  // authorized -> render children
  return children;
}
