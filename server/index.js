import express from 'express';
import pool from './db/index.js';
import cors from 'cors';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!base64) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env variable");
}

const jsonString = Buffer.from(base64, 'base64').toString('utf8');
const serviceAccount = JSON.parse(jsonString);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const firestore = admin.firestore();

const checkIfAdmin = async (req, res, next) => {
  const uid = req.header('x-user-id');
  if (!uid) return res.status(401).json({ isAdmin: false, error: 'No UID provided' });

  try {
    const roleDoc = await firestore.collection('roles').doc(uid).get();
    if (roleDoc.exists && roleDoc.data().role === 'admin') {
      next();
    } else {
      res.status(403).json({ isAdmin: false, error: 'Access denied: Admins only' });
    }
  } catch (err) {
    console.error('Admin check failed:', err);
    res.status(500).json({ isAdmin: false, error: 'Server error' });
  }
};


const app = express();
app.use(cors());
app.use(express.json());

// Test DB connection
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT 1+1 AS result');
    console.log('DB Connected. Result:', res.rows[0].result);
  } catch (err) {
    console.error('DB Connection failed:', err);
  }
};
testConnection();

// DB Info
const dbInfo = await pool.query('SELECT current_database(), inet_server_addr(), inet_server_port();');
console.log('REALLY connected to:');
console.log('Database:', dbInfo.rows[0].current_database);
console.log('Host:', dbInfo.rows[0].inet_server_addr);
console.log('Port:', dbInfo.rows[0].inet_server_port);

//FIXED: Admin check route
app.get('/api/admin-check', async (req, res) => {
  const uid = req.header('x-user-id');
  console.log('Received UID:', uid);

  if (!uid) {
    return res.status(401).json({ isAdmin: false, error: 'No UID provided' });
  }

  try {
    const roleDoc = await firestore.collection('roles').doc(uid).get();
    if (roleDoc.exists) {
      const roleData = roleDoc.data();
      console.log('Role data:', roleData);

      if (roleData.role === 'admin') {
        return res.status(200).json({ isAdmin: true });
      }
    }
    return res.status(403).json({ isAdmin: false, error: 'Not an admin' });
  } catch (err) {
    console.error('Admin check failed:', err);
    return res.status(500).json({ isAdmin: false, error: 'Server error' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  const uid = req.headers['x-user-id'];
  console.log('Incoming UID:', uid);

  const db = getFirestore();
  const roleDoc = await db.collection('roles').doc(uid).get();

  if (!roleDoc.exists) {
    console.log('Role doc does not exist for UID:', uid);
    return res.status(403).json({ message: 'Not authorized' });
  }

  const role = roleDoc.data().role;
  console.log('Role found:', role);

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const users = [];
    let result = await getAuth().listUsers();
    users.push(...result.users.map(user => ({
      id: user.uid,
      email: user.email,
      displayName: user.displayName
    })));

    res.json(users);
  } catch (err) {
    console.error('Failed to get users:', err);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  const uid = req.params.id;
  const { displayName } = req.body;

  const authHeaderUid = req.headers['x-user-id'];
  const db = getFirestore();
  const roleDoc = await db.collection('roles').doc(authHeaderUid).get();

  if (!roleDoc.exists || roleDoc.data().role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    await getAuth().updateUser(uid, { displayName });
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user' });
  }
});


app.post('/api/set-role', checkIfAdmin, async (req, res) => {
  const { targetUid, role } = req.body;
  if (!targetUid || !role) {
    return res.status(400).json({ error: 'Missing targetUid or role' });
  }

  try {
    await firestore.collection('roles').doc(targetUid).set({ role });
    res.json({ message: `Role set to ${role} for UID ${targetUid}` });
  } catch (err) {
    console.error('Error setting role:', err);
    res.status(500).json({ error: 'Failed to set role' });
  }
});

app.delete('/api/delete-user/:uid', checkIfAdmin, async (req, res) => {
  const { uid } = req.params;

  try {
    await admin.auth().deleteUser(uid);
    res.json({ message: `User ${uid} deleted.` });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// CRUD API: Dog Breeds
app.get('/api/dog-breeds', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dog_breeds');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/api/dog-breeds/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM dog_breeds WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dog breed not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.put('/api/dog-breeds/:id', async (req, res) => {
  const { id } = req.params;
  const { name, temperament, life_span, weight, height } = req.body;
  try {
    const result = await pool.query(
      'UPDATE dog_breeds SET name = $1, temperament = $2, life_span = $3, weight = $4, height = $5 WHERE id = $6 RETURNING *',
      [name, temperament, life_span, weight, height, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dog breed not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/dog-breeds', async (req, res) => {
  const { name, temperament, life_span, weight, height } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO dog_breeds (name, temperament, life_span, weight, height) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, temperament, life_span, weight, height]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.delete('/api/dog-breeds/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM dog_breeds WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dog breed not found' });
    }
    res.json({ message: 'Dog breed deleted', breed: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Matches
app.post('/api/matches', async (req, res) => {
  const { userId, breedId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO matches (user_id, breed_id) VALUES ($1, $2) RETURNING *',
      [userId, breedId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving match:', err);
    res.status(500).json({ error: 'Failed to save match' });
  }
});

app.get('/api/matches/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM matches WHERE user_id = $1 ORDER BY matched_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Failed to retrieve matches' });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Hello');
});

// Start Server
const PORT = process.env.PORT || 8080;
const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}!~`);
  });
};
startServer();


