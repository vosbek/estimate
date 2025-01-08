import db from './index';
import fs from 'fs';
import path from 'path';

const initializeDb = async (clean: boolean = false) => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');
    const cleanupPath = path.join(__dirname, 'cleanup.sql');
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const seed = fs.readFileSync(seedPath, 'utf8');
    const cleanup = fs.readFileSync(cleanupPath, 'utf8');
    
    console.log('Initializing database...');
    
    // Run everything in a transaction
    await db.query('BEGIN');
    
    if (clean) {
      console.log('Cleaning up existing schema...');
      await db.query(cleanup);
    }
    
    console.log('Creating schema...');
    await db.query(schema);
    
    console.log('Seeding data...');
    await db.query(seed);
    
    await db.query('COMMIT');
    
    console.log('Database initialized successfully with seed data');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error initializing database:', error);
  } finally {
    process.exit();
  }
};

// Check if --clean flag is passed
const clean = process.argv.includes('--clean');
initializeDb(clean); 