const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const { location, rooms, floor_min, floor_max, price_min, price_max, is_new, has_garage, area_min, area_max, page = 1, limit = 12 } = req.query;
    const conditions = [];
    const values = [];
    let i = 1;

    if (location)  { conditions.push(`location ILIKE $${i++}`);  values.push(`%${location}%`); }
    if (rooms)     { conditions.push(`rooms = $${i++}`);          values.push(+rooms); }
    if (floor_min) { conditions.push(`floor >= $${i++}`);         values.push(+floor_min); }
    if (floor_max) { conditions.push(`floor <= $${i++}`);         values.push(+floor_max); }
    if (price_min) { conditions.push(`price >= $${i++}`);         values.push(+price_min); }
    if (price_max) { conditions.push(`price <= $${i++}`);         values.push(+price_max); }
    if (is_new !== undefined && is_new !== '') { conditions.push(`is_new = $${i++}`); values.push(is_new === 'true'); }
    if (has_garage !== undefined && has_garage !== '') { conditions.push(`has_garage = $${i++}`); values.push(has_garage === 'true'); }
    if (area_min)  { conditions.push(`area >= $${i++}`);          values.push(+area_min); }
    if (area_max)  { conditions.push(`area <= $${i++}`);          values.push(+area_max); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (page - 1) * limit;

    const countRes = await pool.query(`SELECT COUNT(*) FROM real_estate ${where}`, values);
    const total = parseInt(countRes.rows[0].count);

    const result = await pool.query(
      `SELECT r.*, ARRAY_AGG(img.filename) FILTER (WHERE img.filename IS NOT NULL) AS images
       FROM real_estate r
       LEFT JOIN images img ON img.ad_type='realestate' AND img.ad_id=r.id
       ${where}
       GROUP BY r.id
       ORDER BY r.created_at DESC
       LIMIT $${i++} OFFSET $${i++}`,
      [...values, +limit, offset]
    );

    res.json({ total, page: +page, pages: Math.ceil(total / limit), data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT r.*, ARRAY_AGG(img.filename) FILTER (WHERE img.filename IS NOT NULL) AS images
       FROM real_estate r
       LEFT JOIN images img ON img.ad_type='realestate' AND img.ad_id=r.id
       WHERE r.id=$1 GROUP BY r.id`, [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Зар олдсонгүй' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, area, location, rooms, floor, total_floors, has_garage, price, is_new, built_year, phone, description } = req.body;
    const result = await pool.query(
      `INSERT INTO real_estate (title,area,location,rooms,floor,total_floors,has_garage,price,is_new,built_year,phone,description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [title, area, location, rooms, floor, total_floors, has_garage, price, is_new, built_year, phone, description]
    );
    const adId = result.rows[0].id;
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await pool.query(
          `INSERT INTO images (ad_type, ad_id, filename) VALUES ('realestate', $1, $2)`,
          [adId, file.filename]
        );
      }
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, area, location, rooms, floor, total_floors, has_garage, price, is_new, built_year, phone, description } = req.body;
    const result = await pool.query(
      `UPDATE real_estate SET title=$1,area=$2,location=$3,rooms=$4,floor=$5,total_floors=$6,
       has_garage=$7,price=$8,is_new=$9,built_year=$10,phone=$11,description=$12 WHERE id=$13 RETURNING *`,
      [title, area, location, rooms, floor, total_floors, has_garage, price, is_new, built_year, phone, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query(`DELETE FROM images WHERE ad_type='realestate' AND ad_id=$1`, [req.params.id]);
    await pool.query(`DELETE FROM real_estate WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Зар устгагдлаа' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};