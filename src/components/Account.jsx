import React, { useEffect, useState } from 'react';
import { auth, storage } from '../firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Account = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("The current is:", auth.currentUser);
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setPhotoURL(currentUser.photoURL || '');
        setEmail(currentUser.email || '')
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName });
      await auth.currentUser.reload();
      setDisplayName(auth.currentUser.displayName || '');
      setEmail(auth.currentUser.email || '')
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setEditing(false);
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

      //This ensures Firebase updates the user object with the new photo
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      setPhotoURL(auth.currentUser.photoURL || '');
    } catch (err) {
      console.error('Error uploading profile photo:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <p>Loading user info...</p>;

  return (
    <div className="account-page">
      <h2>Account Info</h2>

      {/* Profile Photo */}
      {photoURL ? (
        <img
          src={photoURL}
          alt="Profile"
          width="120"
          style={{ borderRadius: '50%' }}
        />
      ) : (
        <p>No profile photo set</p>
      )}

      <div style={{ marginTop: '1rem' }}>
        <label htmlFor="photo-upload" className="upload-label">
          Upload New Photo:
        </label>
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          onChange={handlePhotoUpload}
        />
        {uploading && <p>Uploading...</p>}
      </div>
      <p>
        <strong>Email:</strong>{' '}
        {editing ? (
          <>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSave}>Save</button>
          </>
        ) : (
          <>
            {email || 'N/A'}{' '}
            <button onClick={() => setEditing(true)}>Edit Email</button>
          </>
        )}
      </p>

      <p>
        <strong>Display Name:</strong>{' '}
        {editing ? (
          <>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <button onClick={handleSave}>Save</button>
          </>
        ) : (
          <>
            {displayName || 'N/A'}{' '}
            <button onClick={() => setEditing(true)}>Edit Name</button>
          </>
        )}
      </p>

      <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>

      <p>
        <strong>Sign-in Method:</strong>{' '}
        {user.providerData.map((provider, index) => (
          <span key={index}>
            {provider.providerId.replace('.com', '')}
            {index < user.providerData.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
    </div>
  );
};

export default Account;





