
import express from 'express';
import pool from './db/index.js';
import cors from 'cors';


const app = express();
app.use(cors());
app.use(express.json());

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT 1+1 AS result');
    console.log('DB Connected. Result:', res.rows[0].result);
  } catch (err) {
    console.error('DB Connection failed:', err);
  }
};
testConnection();


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
  const { name, breed_group, temperament, life_span, image_url } = req.body;

  try {
    const result = await pool.query(
      'UPDATE dog_breeds SET name = $1, temperament = $2, life_span = $3, weight = $4, height = $5 WHERE id = $6 RETURNING *',
      [name, breed_group, temperament, life_span, image_url, id]
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



// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 8080;

const startServer = async() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}!~`)
    });
}
startServer();

app.get("/", (req, res) => {
    res.send("Hello");
});