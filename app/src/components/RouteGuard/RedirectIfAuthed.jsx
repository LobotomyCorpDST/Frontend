import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RedirectIfAuthed({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const rawRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const role = rawRole ? String(rawRole).toLowerCase() : null;

  if (token) {
    if (role === 'guest') {
      return <Navigate to="/home-guest" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
}
