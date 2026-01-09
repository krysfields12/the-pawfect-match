import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const AdminRoleSetter = () => {
  const [targetUid, setTargetUid] = useState('');
  const [role, setRole] = useState('admin');
  const [status, setStatus] = useState('');

  const handleAssignRole = async () => {
    try {
      if (!targetUid) {
        setStatus('Please enter a UID.');
        return;
      }

      await setDoc(doc(db, 'roles', targetUid), { role });
      setStatus(`Role "${role}" assigned to user ${targetUid}`);
    } catch (error) {
      console.error('Error assigning role:', error);
      setStatus('Error assigning role');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Assign Role</h2>
      <input
        type="text"
        placeholder="Enter user UID"
        value={targetUid}
        onChange={(e) => setTargetUid(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px' }}>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
      <button onClick={handleAssignRole} style={{ marginTop: '1rem' }}>
        Assign Role
      </button>
      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
};

export default AdminRoleSetter;
