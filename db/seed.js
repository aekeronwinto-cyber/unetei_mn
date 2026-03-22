require('dotenv').config();
const pool = require('./index');

const locations = ['Баянзүрх', 'Хан-Уул', 'Сүхбаатар', 'Чингэлтэй', 'Налайх', 'Багануур', 'Багахангай', 'Сонгинохайрхан', 'Бага тойруу', 'Яармаг'];
const carBrands = ['Toyota', 'Hyundai', 'Lexus', 'BMW', 'Mercedes', 'Mitsubishi', 'Honda', 'Nissan', 'Kia', 'Mazda'];
const carModels = {
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Prius'],
  Hyundai: ['Sonata', 'Tucson', 'Santa Fe', 'Elantra', 'Accent'],
  Lexus: ['LX570', 'RX350', 'GX460', 'ES350', 'NX200'],
  BMW: ['X5', '3 Series', '5 Series', 'X3', '7 Series'],
  Mercedes: ['E-Class', 'C-Class', 'GLE', 'S-Class', 'GLC'],
  Mitsubishi: ['Outlander', 'Pajero', 'Eclipse Cross', 'ASX', 'L200'],
  Honda: ['CR-V', 'Accord', 'Civic', 'HR-V', 'Pilot'],
  Nissan: ['X-Trail', 'Qashqai', 'Patrol', 'Juke', 'Murano'],
  Kia: ['Sportage', 'Sorento', 'Seltos', 'K5', 'Carnival'],
  Mazda: ['CX-5', 'CX-30', 'Mazda3', 'CX-9', 'Mazda6'],
};
const transmissions = ['Автомат', 'Механик', 'Робот', 'Вариатор'];
const fuelTypes = ['Бензин', 'Дизель', 'Цахилгаан', 'Гибрид'];
const driveTypes = ['4WD', 'FWD', 'RWD', 'AWD'];
const carTypes = ['Жижиг', 'Жийп', 'Пикап', 'Минивэн', 'Купе'];
const sectors = ['Мэдээллийн технологи', 'Санхүү', 'Боловсрол', 'Эрүүл мэнд', 'Барилга', 'Худалдаа', 'Тээвэр', 'Уул уурхай'];
const subSectors = {
  'Мэдээллийн технологи': ['Программ хангамж', 'Сүлжээ', 'Дата шинжилгээ'],
  'Санхүү': ['Нягтлан бодох бүртгэл', 'Банк', 'Даатгал'],
  'Боловсрол': ['Их сургууль', 'Дунд сургууль', 'Цэцэрлэг'],
  'Эрүүл мэнд': ['Эмнэлэг', 'Эмийн сан', 'Клиник'],
  'Барилга': ['Дизайн', 'Угсралт', 'Зураг төсөл'],
  'Худалдаа': ['Жижиглэн', 'Бөөний', 'Онлайн'],
  'Тээвэр': ['Авто', 'Агаарын', 'Логистик'],
  'Уул уурхай': ['Геологи', 'Олборлолт', 'Боловсруулалт'],
};
const degrees = ['Бакалавр', 'Магистр', 'Доктор', 'Дипломант', 'Шаардлагагүй'];
const experiences = ['Туршлагагүй', '1-2 жил', '3-5 жил', '5+ жил'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seedRealEstate() {
  console.log('Үл хөдлөх seed...');
  for (let i = 0; i < 80; i++) {
    const rooms = randInt(1, 6);
    const floor = randInt(1, 25);
    await pool.query(
      `INSERT INTO real_estate (title, area, location, rooms, floor, total_floors, has_garage, price, is_new, built_year, phone, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        `${rooms} өрөө орон сууц - ${rand(locations)}`,
        (randInt(30, 180) + Math.random()).toFixed(1),
        rand(locations),
        rooms,
        floor,
        Math.max(floor, randInt(floor, 30)),
        Math.random() > 0.5,
        randInt(80, 800) * 1000000,
        Math.random() > 0.4,
        randInt(1990, 2024),
        `9${randInt(10000000, 99999999)}`,
        `${rooms} өрөө, ${rand(['тохилог', 'гэрэлтэй', 'чанартай засвартай', 'галт тогоотой'])} орон сууц. ${rand(['Гудамжны харагдацтай', 'Цэцэрлэгт хүрээлэнтэй ойр', 'Дэлгүүртэй ойр'])}.`
      ]
    );
  }
  console.log('✓ 80 үл хөдлөх нэмэгдлээ');
}

async function seedCars() {
  console.log('Автомашин seed...');
  for (let i = 0; i < 80; i++) {
    const brand = rand(carBrands);
    const model = rand(carModels[brand]);
    await pool.query(
      `INSERT INTO cars (brand, model, built_year, car_type, engine_size, drive_type, steering, transmission, fuel_type, doors, mileage, has_plate, price, phone, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        brand, model,
        randInt(2005, 2024),
        rand(carTypes),
        (randInt(10, 40) / 10).toFixed(1),
        rand(driveTypes),
        Math.random() > 0.3 ? 'Зүүн' : 'Баруун',
        rand(transmissions),
        rand(fuelTypes),
        rand([2, 4, 5]),
        randInt(10000, 300000),
        Math.random() > 0.2,
        randInt(5, 150) * 1000000,
        `9${randInt(10000000, 99999999)}`,
        `${brand} ${model}, ${rand(['маш сайн байдалтай', 'анхны эзэн', 'засвар үйлчилгээ хийгдсэн', 'цэвэрхэн'])}.`
      ]
    );
  }
  console.log('✓ 80 автомашин нэмэгдлээ');
}

async function seedJobs() {
  console.log('Ажлын байр seed...');
  const jobTitles = ['Программ хөгжүүлэгч', 'Нягтлан бодогч', 'Маркетингийн менежер', 'Борлуулагч', 'Инженер', 'Эмч', 'Багш', 'Дизайнер', 'Жолооч', 'Геологич'];
  for (let i = 0; i < 60; i++) {
    const sector = rand(sectors);
    await pool.query(
      `INSERT INTO jobs (sector, sub_sector, title, salary_min, salary_max, requirements, degree, experience, location, phone, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        sector,
        rand(subSectors[sector]),
        rand(jobTitles),
        randInt(800, 2000) * 1000,
        randInt(2000, 5000) * 1000,
        `${rand(['Монгол хэлний мэдлэг', 'Англи хэлний мэдлэг', 'Компьютерийн мэдлэг'])}, ${rand(['багаар ажиллах чадвар', 'бие даан ажиллах чадвар'])}.`,
        rand(degrees),
        rand(experiences),
        rand(locations),
        `7${randInt(10000000, 99999999)}`,
        `${sector} салбарт ажиллах боломж. ${rand(['Цалин тохиролцоно', 'Урамшуулал бий', 'Гадаадад суралцах боломжтой'])}.`
      ]
    );
  }
  console.log('✓ 60 ажлын байр нэмэгдлээ');
}

async function main() {
  try {
    await seedRealEstate();
    await seedCars();
    await seedJobs();
    console.log('\n✅ Бүх seed data амжилттай нэмэгдлээ!');
  } catch (err) {
    console.error('Seed алдаа:', err.message);
  } finally {
    await pool.end();
  }
}

main();