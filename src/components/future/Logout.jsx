import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './AuthForm.css';

const Logout = () => {
  const handleLogout = () => {
    signOut(auth).then(() => alert('Logged out'));
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
