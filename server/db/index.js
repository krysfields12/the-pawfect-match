// server/db/index.js
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

// const pool = new Pool({
// //   user: 'kfields2',
// //   host: 'localhost',
// //   database: 'the_pawfect_match',
// //   password: 'Ballin#####1212',
// //   port: 5434,
// // });

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
   ssl: {
    rejectUnauthorized: false, 
    require: true              
  }
});

export default pool;

