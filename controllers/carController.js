const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const {
      brand, model, car_type, drive_type, steering, transmission,
      fuel_type, doors, has_plate, year_min, year_max,
      engine_min, engine_max, mileage_min, mileage_max,
      price_min, price_max, page = 1, limit = 12
    } = req.query;
    const conditions = [];
    const values = [];
    let i = 1;

    if (brand)       { conditions.push(`brand ILIKE $${i++}`);          values.push(`%${brand}%`); }
    if (model)       { conditions.push(`model ILIKE $${i++}`);          values.push(`%${model}%`); }
    if (car_type)    { conditions.push(`car_type = $${i++}`);           values.push(car_type); }
    if (drive_type)  { conditions.push(`drive_type = $${i++}`);         values.push(drive_type); }
    if (steering)    { conditions.push(`steering = $${i++}`);           values.push(steering); }
    if (transmission){ conditions.push(`transmission = $${i++}`);       values.push(transmission); }
    if (fuel_type)   { conditions.push(`fuel_type = $${i++}`);          values.push(fuel_type); }
    if (doors)       { conditions.push(`doors = $${i++}`);              values.push(+doors); }
    if (has_plate !== undefined && has_plate !== '') { conditions.push(`has_plate = $${i++}`); values.push(has_plate === 'true'); }
    if (year_min)    { conditions.push(`built_year >= $${i++}`);        values.push(+year_min); }
    if (year_max)    { conditions.push(`built_year <= $${i++}`);        values.push(+year_max); }
    if (engine_min)  { conditions.push(`engine_size >= $${i++}`);       values.push(+engine_min); }
    if (engine_max)  { conditions.push(`engine_size <= $${i++}`);       values.push(+engine_max); }
    if (mileage_min) { conditions.push(`mileage >= $${i++}`);           values.push(+mileage_min); }
    if (mileage_max) { conditions.push(`mileage <= $${i++}`);           values.push(+mileage_max); }
    if (price_min)   { conditions.push(`price >= $${i++}`);             values.push(+price_min); }
    if (price_max)   { conditions.push(`price <= $${i++}`);             values.push(+price_max); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (page - 1) * limit;

    const countRes = await pool.query(`SELECT COUNT(*) FROM cars ${where}`, values);
    const total = parseInt(countRes.rows[0].count);

    const result = await pool.query(
      `SELECT c.*, ARRAY_AGG(img.filename) FILTER (WHERE img.filename IS NOT NULL) AS images
       FROM cars c
       LEFT JOIN images img ON img.ad_type='car' AND img.ad_id=c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.created_at DESC
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
    const result = await pool.query(
      `SELECT c.*, ARRAY_AGG(img.filename) FILTER (WHERE img.filename IS NOT NULL) AS images
       FROM cars c
       LEFT JOIN images img ON img.ad_type='car' AND img.ad_id=c.id
       WHERE c.id=$1 GROUP BY c.id`, [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Зар олдсонгүй' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { brand, model, built_year, car_type, engine_size, drive_type, steering, transmission, fuel_type, doors, mileage, has_plate, price, phone, description } = req.body;
    const result = await pool.query(
      `INSERT INTO cars (brand,model,built_year,car_type,engine_size,drive_type,steering,transmission,fuel_type,doors,mileage,has_plate,price,phone,description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [brand, model, built_year, car_type, engine_size, drive_type, steering, transmission, fuel_type, doors, mileage, has_plate, price, phone, description]
    );
    const adId = result.rows[0].id;
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await pool.query(`INSERT INTO images (ad_type, ad_id, filename) VALUES ('car', $1, $2)`, [adId, file.filename]);
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
    const { brand, model, built_year, car_type, engine_size, drive_type, steering, transmission, fuel_type, doors, mileage, has_plate, price, phone, description } = req.body;
    const result = await pool.query(
      `UPDATE cars SET brand=$1,model=$2,built_year=$3,car_type=$4,engine_size=$5,drive_type=$6,
       steering=$7,transmission=$8,fuel_type=$9,doors=$10,mileage=$11,has_plate=$12,price=$13,phone=$14,description=$15
       WHERE id=$16 RETURNING *`,
      [brand, model, built_year, car_type, engine_size, drive_type, steering, transmission, fuel_type, doors, mileage, has_plate, price, phone, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query(`DELETE FROM images WHERE ad_type='car' AND ad_id=$1`, [req.params.id]);
    await pool.query(`DELETE FROM cars WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Зар устгагдлаа' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};