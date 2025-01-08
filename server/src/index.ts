import express from 'express';
import cors from 'cors';
import db from './db';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic routes
app.get('/api/flows', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM estimation_flows');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/flows/:id/questions', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT q.*, 
              array_agg(json_build_object(
                'team_id', qi.team_id,
                'condition', qi.condition,
                'multiplier', qi.multiplier
              )) as impacts
       FROM questions q
       LEFT JOIN question_impacts qi ON q.id = qi.question_id
       WHERE q.flow_id = $1
       GROUP BY q.id
       ORDER BY q.sequence_number`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, 
             json_object_agg(
               tm.condition_key, 
               tm.multiplier
             ) as multipliers
      FROM teams t
      LEFT JOIN team_multipliers tm ON t.id = tm.team_id
      GROUP BY t.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 