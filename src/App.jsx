import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import './App.css'
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

function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
   <Router>
     <Navbar user={user} />
      <Routes>
        <Route path="/" element={<DogList />} />
         <Route path="/register" element={<Register />} />
         <Route path="/login" element={<Login />} />
         <Route path="/logout" element={<Logout />} />
         <Route path="/breed/:id" element={<DogProfile />} />
         <Route path="/quiz" element={<PersonalityQuiz />} />
         <Route path="/results" element={<QuizResults />} />
         <Route path="/account" element={<Account />} />
         <Route path="/matches" element={<MyMatches />} />
      </Routes>
    </Router>
  )
}

export default App
