import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RedirectIfAuthed({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? <Navigate to="/home" replace /> : children;
}
