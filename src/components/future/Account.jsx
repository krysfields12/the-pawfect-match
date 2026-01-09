import React, { useEffect, useState } from 'react';
import { auth, storage } from '../firebase';
import { toast } from 'react-toastify';
import { onAuthStateChanged, updateProfile, updateEmail } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Account.css';

const Account = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setPhotoURL(currentUser.photoURL || '');

      const uid = currentUser.uid;

      if (!uid) {
        console.warn('No UID found on currentUser.');
        toast.error('Admin check failed: No UID found.');
        return;
      }

      const url = `${import.meta.env.VITE_API_BASE}/api/admin-check`;
      console.log('Admin check URL:', url);

      try {
        const res = await fetch(url, {
          headers: {
            'x-user-id': uid,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error('Admin check failed:', errorData);
          toast.info('You are not an admin.');
          return;
        }

        const data = await res.json();
        console.log('Admin check response:', data);

        if (data.isAdmin) {
          setIsAdmin(true);
          toast.success('You are an admin!');
        } else {
          setIsAdmin(false);
          toast.info('You are not an admin.');
        }
      } catch (err) {
        console.error('Admin check fetch failed:', err);
        toast.error('Admin check error');
      }
    }
  });

  return () => unsubscribe();
}, []);


  const handleSaveName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName });
      await auth.currentUser.reload();
      setDisplayName(auth.currentUser.displayName || '');
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setEditingName(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      await updateEmail(auth.currentUser, email);
      await auth.currentUser.reload();
      setEmail(auth.currentUser.email || '');
      setErrorMsg('');
    } catch (error) {
      console.error('Error updating email:', error);
      setErrorMsg('Email update failed. You may need to reauthenticate.');
    } finally {
      setEditingEmail(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    const storageRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL: url });
      await auth.currentUser.reload();
      setPhotoURL(auth.currentUser.photoURL || '');
    } catch (err) {
      console.error('Error uploading profile photo:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="loading">Loading user info...</div>;

  return (
    <div className="account-page">
      <div className="account-card">
        <div className="avatar-section">
          {photoURL ? (
            <img src={photoURL} alt="Profile" className="profile-pic" />
          ) : (
            <div className="default-avatar">
              {displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
          )}
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          {uploading && <p>Uploading...</p>}
        </div>

        <div className="field">
          <label>Email:</label>
          {editingEmail ? (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button onClick={handleSaveEmail}>Save</button>
              <button onClick={() => setEditingEmail(false)}>Cancel</button>
              {errorMsg && <p className="error">{errorMsg}</p>}
            </>
          ) : (
            <>
              <span>{email || 'N/A'}</span>
              <button onClick={() => setEditingEmail(true)}>Edit</button>
            </>
          )}
        </div>

        <div className="field">
          <label>Display Name:</label>
          {editingName ? (
            <>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <button onClick={handleSaveName}>Save</button>
              <button onClick={() => setEditingName(false)}>Cancel</button>
            </>
          ) : (
            <>
              <span>{displayName || 'N/A'}</span>
              <button onClick={() => setEditingName(true)}>Edit</button>
            </>
          )}
        </div>

        <div className="field">
          <label>Email Verified:</label>
          <span>{user.emailVerified ? 'Yes' : 'No'}</span>
        </div>
        <div className="field">
          <label>Sign-in Method:</label>
          <span>
            {user.providerData.map((provider, idx) => (
              <span key={idx}>
                {provider.providerId.replace('.com', '')}
                {idx < user.providerData.length - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        </div>

        {isAdmin && (
          <div className="admin-section">
            <h3>Admin Tools</h3>
            <p>You have administrative privileges.</p>
            <a href="/set-role" className="admin-link">Manage Roles</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;









