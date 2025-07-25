// src/components/CheckAdminButton.jsx
import React from 'react';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

const CheckAdminButton = () => {
 const checkAdminStatus = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("No user logged in.");
    return;
  }

  try {
    const token = await user.getIdToken();

    const response = await fetch('http://localhost:8080/api/admin-check', {
      method: 'GET',
      headers: {
        'x-user-id': user.uid,
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      toast.success('You are an admin!');
    } else {
      toast.error('You are not an admin.');
    }

  } catch (err) {
    console.error('Admin check failed:', err);
    alert('Something went wrong.');
  }
};
  return (
    <button onClick={checkAdminStatus}>Check Admin Access</button>
  );
};

export default CheckAdminButton;

