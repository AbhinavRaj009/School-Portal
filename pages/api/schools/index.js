import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { query } from '@/lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

const imagesDir = path.join(process.cwd(), 'public', 'schoolImages');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, imagesDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `school-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
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

      // Ensure ratings table exists for aggregation
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

      const rows = await query(
        `SELECT s.id, s.name, s.address, s.city, s.state, s.contact, s.image, s.email_id, s.description,
                ROUND(COALESCE(AVG(r.rating), 3), 2) AS avg_rating,
                COUNT(r.id) AS rating_count
         FROM schools s
         LEFT JOIN schools_ratings r ON r.school_id = s.id
         GROUP BY s.id, s.name, s.address, s.city, s.state, s.contact, s.image, s.email_id, s.description
         ORDER BY s.id DESC`
      );
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error('GET /api/schools error:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.single('image'));

      const { name, address, city, state, contact, email_id, description } = req.body;
      const file = req.file;

      if (!name || !address || !city || !state || !contact || !email_id) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      let imagePath = null;
      if (file) {
        imagePath = `/schoolImages/${file.filename}`;
      }

      // Ensure description column exists
      await query(`
        ALTER TABLE schools
        ADD COLUMN IF NOT EXISTS description TEXT NULL
      `).catch(() => {});

      await query(
        'INSERT INTO schools (name, address, city, state, contact, image, email_id, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, address, city, state, String(contact), imagePath, email_id, description || null]
      );

      return res.status(201).json({ success: true });
    } catch (error) {
      console.error('POST /api/schools error:', error);
      return res.status(500).json({ success: false, error: 'Upload/Database error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}




