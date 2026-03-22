const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const { sector, sub_sector, title, salary_min, salary_max, degree, experience, location, page = 1, limit = 12 } = req.query;
    const conditions = [];
    const values = [];
    let i = 1;

    if (sector)      { conditions.push(`sector ILIKE $${i++}`);         values.push(`%${sector}%`); }
    if (sub_sector)  { conditions.push(`sub_sector ILIKE $${i++}`);     values.push(`%${sub_sector}%`); }
    if (title)       { conditions.push(`title ILIKE $${i++}`);          values.push(`%${title}%`); }
    if (salary_min)  { conditions.push(`salary_max >= $${i++}`);        values.push(+salary_min); }
    if (salary_max)  { conditions.push(`salary_min <= $${i++}`);        values.push(+salary_max); }
    if (degree)      { conditions.push(`degree = $${i++}`);             values.push(degree); }
    if (experience)  { conditions.push(`experience = $${i++}`);         values.push(experience); }
    if (location)    { conditions.push(`location ILIKE $${i++}`);       values.push(`%${location}%`); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (page - 1) * limit;

    const countRes = await pool.query(`SELECT COUNT(*) FROM jobs ${where}`, values);
    const total = parseInt(countRes.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM jobs ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`,
      [...values, +limit, offset]
    );

    res.json({ total, page: +page, pages: Math.ceil(total / limit), data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM jobs WHERE id=$1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Зар олдсонгүй' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { sector, sub_sector, title, salary_min, salary_max, requirements, degree, experience, location, phone, description } = req.body;
    const result = await pool.query(
      `INSERT INTO jobs (sector,sub_sector,title,salary_min,salary_max,requirements,degree,experience,location,phone,description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [sector, sub_sector, title, salary_min, salary_max, requirements, degree, experience, location, phone, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { sector, sub_sector, title, salary_min, salary_max, requirements, degree, experience, location, phone, description } = req.body;
    const result = await pool.query(
      `UPDATE jobs SET sector=$1,sub_sector=$2,title=$3,salary_min=$4,salary_max=$5,
       requirements=$6,degree=$7,experience=$8,location=$9,phone=$10,description=$11 WHERE id=$12 RETURNING *`,
      [sector, sub_sector, title, salary_min, salary_max, requirements, degree, experience, location, phone, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query(`DELETE FROM jobs WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Зар устгагдлаа' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};