import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer } from 'react-toastify';
import { auth } from './firebase';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import DogList from './components/DogList';
import DogProfile from './components/DogProfile';
import PersonalityQuiz from './components/PersonalityQuiz';
import QuizResults from './components/QuizResults';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import Navbar from './components/Navbar';
import Account from './components/Account';
import MyMatches from './components/MyMatches';
import AdminRoleSetter from './components/AdminRoleSetter';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const res = await fetch('http://localhost:8080/api/admin-check', {
            headers: {
              'x-user-id': currentUser.uid,
            },
          });
          setIsAdmin(res.ok);
        } catch (err) {
          console.error('Failed to check admin status', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />
      <Navbar user={user} isAdmin={isAdmin} />
      <Routes>
        <Route path="/" element={<DogList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/breed/:id" element={<DogProfile />} />
        <Route path="/quiz" element={<PersonalityQuiz />} />
        <Route path="/results" element={<QuizResults />} />
        <Route path="/account" element={<Account user={user} isAdmin={isAdmin} />} />
        <Route path="/matches" element={<MyMatches />} />
        <Route path="/set-role" element={<AdminRoleSetter />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;


