import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RedirectIfAuthed({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Redirect authenticated users based on role
  if (token) {
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    // Guest has separate dashboard-only experience
    if (role?.toLowerCase() === 'guest') {
      return <Navigate to="/home-guest" replace />;
    }
    // All other roles (ADMIN, STAFF, USER) go to main home
    return <Navigate to="/home" replace />;
  }

  return children;
}
