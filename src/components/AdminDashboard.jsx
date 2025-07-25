import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('breeds');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkAdmin(currentUser.uid);
      } else {
        toast.error('You must be logged in to access this page.');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkAdmin = async (uid) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/admin-check`, {
        headers: { 'x-user-id': uid },
      });
      const data = await res.json();

      if (res.ok && data.isAdmin) {
        setIsAdmin(true);
        fetchBreeds();
        fetchUsers(uid);
      } else {
        toast.error('Access denied. Admins only.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Admin check failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchBreeds = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/dog-breeds`);
      const data = await res.json();
      setBreeds(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dog breeds');
    }
  };

  const handleDeleteBreed = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/dog-breeds/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
      });

      if (res.ok) {
        toast.success('Breed deleted');
        fetchBreeds();
      } else {
        toast.error('Failed to delete breed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting breed');
    }
  };

  const fetchUsers = async (uid) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/users`, {
        headers: { 'x-user-id': uid },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    }
  };

  const handleUpdateUser = async (id, displayName) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ displayName }),
      });

      if (res.ok) {
        toast.success('User updated!');
        fetchUsers(user.uid);
        setEditingUserId(null);
      } else {
        toast.error('Failed to update user');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating user');
    }
  };

  const handleAssignAdmin = async (targetUserId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/assign-role/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ role: 'admin' }),
      });

      if (res.ok) {
        toast.success('Admin role assigned successfully!');
        fetchUsers(user.uid);
      } else {
        toast.error('Failed to assign admin role.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error assigning admin role');
    }
  };

  if (loading) return <p>Checking admin access...</p>;
  if (!isAdmin) return <p>Access denied.</p>;

  return (
    <div className="admin-dashboard">
      <h2>Welcome, Admin</h2>

      <nav className="admin-subnav">
        <button
          className={selectedTab === 'breeds' ? 'active' : ''}
          onClick={() => setSelectedTab('breeds')}
        >
          Manage Dog Breeds
        </button>
        <button
          className={selectedTab === 'users' ? 'active' : ''}
          onClick={() => setSelectedTab('users')}
        >
          Manage Users
        </button>
        <button
          className={selectedTab === 'assign' ? 'active' : ''}
          onClick={() => setSelectedTab('assign')}
        >
          Assign Admin Role
        </button>
      </nav>

      {selectedTab === 'breeds' && (
        <section>
          <h3>Manage Dog Breeds</h3>
          {breeds.length === 0 ? (
            <p>No breeds available.</p>
          ) : (
            <ul>
              {breeds.map((breed) => (
                <li key={breed.id}>
                  <strong>{breed.name}</strong> ({breed.temperament})
                  <button onClick={() => handleDeleteBreed(breed.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {selectedTab === 'users' && (
        <section>
          <h3>Manage Users</h3>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <ul>
              {users.map((u) => (
                <li key={u.id}>
                  <div style={{ flex: 1 }}>
                    {editingUserId === u.id ? (
                      <>
                        <input
                          type="text"
                          value={u.displayName || ''}
                          onChange={(e) => {
                            const updatedUsers = users.map((user) =>
                              user.id === u.id ? { ...user, displayName: e.target.value } : user
                            );
                            setUsers(updatedUsers);
                          }}
                        />
                        <br />
                        <small>{u.email || 'No email'}</small><br />
                        <small>UID: {u.id}</small>
                      </>
                    ) : (
                      <>
                        <strong>{u.displayName || 'Unnamed User'}</strong><br />
                        <small>{u.email || 'No email'}</small><br />
                        <small>UID: {u.id}</small>
                      </>
                    )}
                  </div>
                  <div>
                    {editingUserId === u.id ? (
                      <>
                        <button onClick={() => handleUpdateUser(u.id, u.displayName || '')}>
                          Save
                        </button>
                        <button onClick={() => setEditingUserId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setEditingUserId(u.id)}>Edit</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {selectedTab === 'assign' && (
        <section>
          <h3>Assign Admin Role</h3>
          {users.length === 0 ? (
            <p>No users to assign roles to.</p>
          ) : (
            <ul>
              {users.map((u) => (
                <li key={u.id}>
                  <div>
                    <strong>{u.displayName || 'Unnamed User'}</strong> - {u.email || 'No email'} <br />
                    <small>UID: {u.id}</small>
                  </div>
                  <button onClick={() => handleAssignAdmin(u.id)}>Make Admin</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;




