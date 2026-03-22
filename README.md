
| Method | URL | Тайлбар |
|--------|-----|---------|
| GET | /api/realestate | Бүх зар (шүүлтүүртэй) |
| GET | /api/realestate/:id | Нэг зар |
| POST | /api/realestate | Зар нэмэх (multipart/form-data) |
| PUT | /api/realestate/:id | Зар засах |
| DELETE | /api/realestate/:id | Зар устгах |

**Шүүлтүүрийн параметрүүд:**
`location, rooms, floor_min, floor_max, price_min, price_max, area_min, area_max, is_new, has_garage, page, limit`

### Автомашин
| Method | URL | Тайлбар |
|--------|-----|---------|
| GET | /api/cars | Бүх зар (шүүлтүүртэй) |
| GET | /api/cars/:id | Нэг зар |
| POST | /api/cars | Зар нэмэх |
| PUT | /api/cars/:id | Зар засах |
| DELETE | /api/cars/:id | Зар устгах |

**Шүүлтүүрийн параметрүүд:**
`brand, model, car_type, fuel_type, drive_type, transmission, steering, year_min, year_max, engine_min, engine_max, mileage_min, mileage_max, price_min, price_max, has_plate, doors, page, limit`

### Ажлын байр
| Method | URL | Тайлбар |
|--------|-----|---------|
| GET | /api/jobs | Бүх зар (шүүлтүүртэй) |
| GET | /api/jobs/:id | Нэг зар |
| POST | /api/jobs | Зар нэмэх |
| PUT | /api/jobs/:id | Зар засах |
| DELETE | /api/jobs/:id | Зар устгах |

**Шүүлтүүрийн параметрүүд:**
`sector, sub_sector, title, salary_min, salary_max, degree, experience, location, page, limit`

---

## Жишээ API дуудалт

```bash
# Баянзүрхэд, 2-3 өрөөтэй, 200 саяас доош
GET /api/realestate?location=Баянзүрх&rooms=2&price_max=200000000

# Toyota, автомат, 2015-2020
GET /api/cars?brand=Toyota&transmission=Автомат&year_min=2015&year_max=2020

# МТ салбарт, туршлагагүй
GET /api/jobs?sector=Мэдээллийн технологи&experience=Туршлагагүй
```