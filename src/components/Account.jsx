import React, { useEffect, useState } from 'react';
import { auth, storage } from '../firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Account = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setPhotoURL(currentUser.photoURL || '');
        setEmail(currentUser.email || '');
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

const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !auth.currentUser) return;

  setUploading(true);
  const storageRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
  try {
    console.log("Uploading file...");
    await uploadBytes(storageRef, file);

    console.log("Getting download URL...");
    const url = await getDownloadURL(storageRef);
    console.log("Download URL:", url);

    await updateProfile(auth.currentUser, { photoURL: url });
    await auth.currentUser.reload();

    console.log("Reloaded user:", auth.currentUser);

    setUser(auth.currentUser);
    setPhotoURL(auth.currentUser.photoURL || '');
  } catch (err) {
    console.error('❌ Error uploading profile photo:', err);
  } finally {
    setUploading(false);
  }
};


  if (!user) return <p>Loading user info...</p>;

  return (
    <div className="account-page">
      <h2>Account Info</h2>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {photoURL ? (
          <img
            src={photoURL}
            alt="Profile"
            width="120"
            height="120"
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            backgroundColor: '#ccc', display: 'flex',
            justifyContent: 'center', alignItems: 'center',
            fontSize: '40px', color: '#fff', margin: '0 auto'
          }}>
            {displayName?.charAt(0) || user.email.charAt(0)}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
        />
        {uploading && <p>Uploading...</p>}
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>

      <p>
        <strong>Email:</strong>{' '}
        {editingEmail ? (
          <>
            <input
              type='text' 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ backgroundColor: '#fff', color: '#000', padding: '4px' }} 
            />
            <button onClick={() => setEditingEmail(false)}>Cancel</button>
          </>
        ) : (
          <>
            {email || 'N/A'}{' '}
            <button onClick={() => setEditingEmail(true)}>Edit Email</button>
          </>
        )}
      </p>

      <p>
        <strong>Display Name:</strong>{' '}
        {editingName ? (
          <>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ backgroundColor: '#fff', color: '#000', padding: '4px' }}
            />
            <button onClick={handleSaveName}>Save</button>
            <button onClick={() => setEditingName(false)}>Cancel</button>
          </>
        ) : (
          <>
            {displayName || 'N/A'}{' '}
            <button onClick={() => setEditingName(true)}>Edit Name</button>
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






