import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'dota',
  host: 'localhost',
  port: 5432,
  database: 'estimate'
});

export default pool; 