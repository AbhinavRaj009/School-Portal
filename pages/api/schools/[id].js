import { query } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Ensure description column exists before selecting it
      const descCol = await query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schools' AND COLUMN_NAME = 'description'`
      );
      if (!Array.isArray(descCol) || descCol.length === 0) {
        try {
          await query('ALTER TABLE schools ADD COLUMN description TEXT NULL');
        } catch (_e) {
          // ignore if concurrent add
        }
      }

      const rows = await query(
        'SELECT id, name, address, city, state, contact, image, email_id, description FROM schools WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'School not found' });
      }
      
      return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
      console.error('GET /api/schools/[id] error:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const result = await query(
        'DELETE FROM schools WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'School not found' });
      }
      
      return res.status(200).json({ success: true, message: 'School deleted successfully' });
    } catch (error) {
      console.error('DELETE /api/schools/[id] error:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, address, city, state, contact, email_id, description } = req.body;
      
      if (!name || !address || !city || !state || !contact || !email_id) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      
      // Ensure description column exists
      await query(`
        ALTER TABLE schools
        ADD COLUMN IF NOT EXISTS description TEXT NULL
      `).catch(() => {});

      const result = await query(
        'UPDATE schools SET name = ?, address = ?, city = ?, state = ?, contact = ?, email_id = ?, description = ? WHERE id = ?',
        [name, address, city, state, String(contact), email_id, description || null, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'School not found' });
      }
      
      return res.status(200).json({ success: true, message: 'School updated successfully' });
    } catch (error) {
      console.error('PUT /api/schools/[id] error:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { rating } = req.body || {};
      const numericRating = Number(rating);

      if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5' });
      }

      await query(`
        CREATE TABLE IF NOT EXISTS schools_ratings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          school_id INT NOT NULL,
          rating TINYINT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX (school_id),
          CONSTRAINT fk_schools_ratings_school
            FOREIGN KEY (school_id) REFERENCES schools(id)
            ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await query(
        'INSERT INTO schools_ratings (school_id, rating) VALUES (?, ?)',
        [id, Math.round(numericRating)]
      );

      const agg = await query(
        'SELECT ROUND(AVG(rating), 2) as avg_rating, COUNT(*) as rating_count FROM schools_ratings WHERE school_id = ?',
        [id]
      );

      return res.status(201).json({ success: true, message: 'Rating submitted', data: agg[0] });
    } catch (error) {
      console.error('POST /api/schools/[id] error:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
