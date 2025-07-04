// server/db/index.js

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'kfields2',
  host: 'localhost',
  database: 'the_pawfect_match',
  password: 'Ballin#####1212',
  port: 5434,
});

export default pool;

