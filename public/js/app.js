const API = '';

// =====================
// SECTION NAV
// =====================
function showSection(name) {
  document.getElementById('hero').classList.add('hidden');
  ['realestate','cars','jobs'].forEach(s => {
    document.getElementById(`section-${s}`).classList.add('hidden');
  });
  document.getElementById(`section-${name}`).classList.remove('hidden');
  if (name === 'realestate') loadRealEstate(1);
  if (name === 'cars')       loadCars(1);
  if (name === 'jobs')       loadJobs(1);
}

function resetFilters(prefix) {
  document.querySelectorAll(`[id^="${prefix}-"]`).forEach(el => {
    if (el.tagName === 'SELECT') el.value = '';
    else if (el.type === 'checkbox') el.checked = false;
    else if (el.type !== 'button') el.value = '';
  });
}

// =====================
// FORMAT HELPERS
// =====================
function formatPrice(p) {
  if (!p) return '—';
  if (p >= 1000000) return (p / 1000000).toFixed(0) + ' сая ₮';
  return p.toLocaleString() + ' ₮';
}
function imgOrPlaceholder(images, emoji) {
  if (images && images.length && images[0]) {
    return `<img src="/uploads/${images[0]}" alt="зураг"/>`;
  }
  return `<div style="font-size:48px;display:flex;align-items:center;justify-content:center;height:160px;background:#f5f5f5">${emoji}</div>`;
}

// =====================
// REAL ESTATE
// =====================
async function loadRealEstate(page = 1) {
  const params = new URLSearchParams({
    location:  v('re-location'),
    rooms:     v('re-rooms'),
    floor_min: v('re-floor-min'),
    floor_max: v('re-floor-max'),
    price_min: v('re-price-min'),
    price_max: v('re-price-max'),
    area_min:  v('re-area-min'),
    area_max:  v('re-area-max'),
    is_new:    v('re-is-new'),
    has_garage:v('re-garage'),
    page, limit: 12
  });
  const res = await fetch(`${API}/api/realestate?${params}`);
  const json = await res.json();
  const grid = document.getElementById('re-grid');
  if (!json.data.length) { grid.innerHTML = '<p style="color:#999;padding:20px">Зар олдсонгүй.</p>'; document.getElementById('re-pagination').innerHTML=''; return; }
  grid.innerHTML = json.data.map(r => `
    <div class="ad-card" onclick="showREDetail(${r.id})">
      <div class="ad-img">${imgOrPlaceholder(r.images,'🏠')}</div>
      <div class="ad-body">
        <div class="ad-title">${r.title || `${r.rooms} өрөө орон сууц`}</div>
        <div class="ad-price">${formatPrice(r.price)}</div>
        <div class="ad-meta">
          <span class="ad-tag">📍 ${r.location}</span>
          <span class="ad-tag">${r.rooms} өрөө</span>
          <span class="ad-tag">${r.area} м²</span>
          <span class="ad-tag">${r.floor || '?'}-р давхар</span>
          ${r.has_garage ? '<span class="ad-tag">🚗 Гарааш</span>' : ''}
          <span class="ad-tag">${r.is_new ? '🆕 Шинэ' : '🔄 Хуучин'}</span>
        </div>
      </div>
    </div>`).join('');
  renderPagination('re-pagination', json.pages, page, loadRealEstate);
}

async function showREDetail(id) {
  const r = await (await fetch(`${API}/api/realestate/${id}`)).json();
  document.getElementById('detail-title').textContent = r.title || `${r.rooms} өрөө орон сууц`;
  document.getElementById('detail-images').innerHTML = (r.images && r.images[0])
    ? r.images.map(f => `<img src="/uploads/${f}" alt=""/>`).join('')
    : '<div style="font-size:80px">🏠</div>';
  document.getElementById('detail-body').innerHTML = rows([
    ['Байршил', r.location], ['Талбай', r.area + ' м²'],
    ['Өрөө', r.rooms], ['Давхар', `${r.floor} / ${r.total_floors}`],
    ['Үнэ', formatPrice(r.price)], ['Байдал', r.is_new ? 'Шинэ' : 'Хуучин'],
    ['Баригдсан он', r.built_year], ['Гарааш', r.has_garage ? 'Тийм' : 'Үгүй'],
    ['Утас', r.phone], ['Тайлбар', r.description, true],
  ]);
  openDetailModal();
}

// =====================
// CARS
// =====================
async function loadCars(page = 1) {
  const params = new URLSearchParams({
    brand:       v('car-brand'),
    model:       v('car-model'),
    car_type:    v('car-type'),
    fuel_type:   v('car-fuel'),
    drive_type:  v('car-drive'),
    transmission:v('car-trans'),
    steering:    v('car-steering'),
    year_min:    v('car-year-min'),
    year_max:    v('car-year-max'),
    mileage_max: v('car-mileage-max'),
    price_min:   v('car-price-min'),
    price_max:   v('car-price-max'),
    has_plate:   v('car-plate'),
    page, limit: 12
  });
  const res = await fetch(`${API}/api/cars?${params}`);
  const json = await res.json();
  const grid = document.getElementById('car-grid');
  if (!json.data.length) { grid.innerHTML = '<p style="color:#999;padding:20px">Зар олдсонгүй.</p>'; document.getElementById('car-pagination').innerHTML=''; return; }
  grid.innerHTML = json.data.map(c => `
    <div class="ad-card" onclick="showCarDetail(${c.id})">
      <div class="ad-img">${imgOrPlaceholder(c.images,'🚗')}</div>
      <div class="ad-body">
        <div class="ad-title">${c.brand} ${c.model} ${c.built_year}</div>
        <div class="ad-price">${formatPrice(c.price)}</div>
        <div class="ad-meta">
          <span class="ad-tag">${c.fuel_type}</span>
          <span class="ad-tag">${c.transmission}</span>
          <span class="ad-tag">${c.drive_type}</span>
          <span class="ad-tag">${(c.mileage||0).toLocaleString()} км</span>
          ${c.has_plate ? '' : '<span class="ad-tag">⚠️ Дугааргүй</span>'}
        </div>
      </div>
    </div>`).join('');
  renderPagination('car-pagination', json.pages, page, loadCars);
}

async function showCarDetail(id) {
  const c = await (await fetch(`${API}/api/cars/${id}`)).json();
  document.getElementById('detail-title').textContent = `${c.brand} ${c.model} ${c.built_year}`;
  document.getElementById('detail-images').innerHTML = (c.images && c.images[0])
    ? c.images.map(f => `<img src="/uploads/${f}" alt=""/>`).join('')
    : '<div style="font-size:80px">🚗</div>';
  document.getElementById('detail-body').innerHTML = rows([
    ['Үйлдвэрлэгч', c.brand], ['Загвар', c.model],
    ['Он', c.built_year], ['Төрөл', c.car_type],
    ['Мотор', c.engine_size + ' л'], ['Хөтлөгч', c.drive_type],
    ['Хүрд', c.steering], ['Хропны төрөл', c.transmission],
    ['Түлш', c.fuel_type], ['Хаалга', c.doors],
    ['Гүйлт', (c.mileage||0).toLocaleString() + ' км'], ['Дугаар', c.has_plate ? 'Тийм' : 'Үгүй'],
    ['Үнэ', formatPrice(c.price)], ['Утас', c.phone],
    ['Тайлбар', c.description, true],
  ]);
  openDetailModal();
}

// =====================
// JOBS
// =====================
async function loadJobs(page = 1) {
  const params = new URLSearchParams({
    sector:     v('job-sector'),
    title:      v('job-title'),
    salary_min: v('job-salary-min'),
    salary_max: v('job-salary-max'),
    degree:     v('job-degree'),
    experience: v('job-exp'),
    location:   v('job-location'),
    page, limit: 12
  });
  const res = await fetch(`${API}/api/jobs?${params}`);
  const json = await res.json();
  const grid = document.getElementById('job-grid');
  if (!json.data.length) { grid.innerHTML = '<p style="color:#999;padding:20px">Зар олдсонгүй.</p>'; document.getElementById('job-pagination').innerHTML=''; return; }
  grid.innerHTML = json.data.map(j => `
    <div class="ad-card" onclick="showJobDetail(${j.id})">
      <div style="font-size:48px;display:flex;align-items:center;justify-content:center;height:100px;background:#f5f5f5">💼</div>
      <div class="ad-body">
        <div class="ad-title">${j.title}</div>
        <div class="ad-price">${j.salary_min ? formatPrice(j.salary_min) + ' – ' + formatPrice(j.salary_max) : 'Тохиролцоно'}</div>
        <div class="ad-meta">
          <span class="ad-tag">🏢 ${j.sector}</span>
          <span class="ad-tag">📍 ${j.location}</span>
          <span class="ad-tag">🎓 ${j.degree}</span>
          <span class="ad-tag">⏱ ${j.experience}</span>
        </div>
      </div>
    </div>`).join('');
  renderPagination('job-pagination', json.pages, page, loadJobs);
}

async function showJobDetail(id) {
  const j = await (await fetch(`${API}/api/jobs/${id}`)).json();
  document.getElementById('detail-title').textContent = j.title;
  document.getElementById('detail-images').innerHTML = '<div style="font-size:80px">💼</div>';
  document.getElementById('detail-body').innerHTML = rows([
    ['Салбар', j.sector], ['Дэд салбар', j.sub_sector],
    ['Байршил', j.location], ['Зэрэг', j.degree],
    ['Туршлага', j.experience],
    ['Цалин', j.salary_min ? `${formatPrice(j.salary_min)} – ${formatPrice(j.salary_max)}` : 'Тохиролцоно'],
    ['Шаардлага', j.requirements, true],
    ['Тайлбар', j.description, true],
    ['Утас', j.phone],
  ]);
  openDetailModal();
}

// =====================
// SUBMIT FORMS
// =====================
async function submitRE(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  fd.set('is_new', e.target.is_new.checked);
  fd.set('has_garage', e.target.has_garage.checked);
  const r = await fetch(`${API}/api/realestate`, { method: 'POST', body: fd });
  if (r.ok) { toast('Зар амжилттай оруулагдлаа! ✅', 'success'); closeModal(); loadRealEstate(1); }
  else { const err = await r.json(); toast('Алдаа: ' + err.error, 'error'); }
}

async function submitCar(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  fd.set('has_plate', e.target.has_plate.checked);
  const r = await fetch(`${API}/api/cars`, { method: 'POST', body: fd });
  if (r.ok) { toast('Зар амжилттай оруулагдлаа! ✅', 'success'); closeModal(); loadCars(1); }
  else { const err = await r.json(); toast('Алдаа: ' + err.error, 'error'); }
}

async function submitJob(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  const r = await fetch(`${API}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (r.ok) { toast('Зар амжилттай оруулагдлаа! ✅', 'success'); closeModal(); loadJobs(1); }
  else { const err = await r.json(); toast('Алдаа: ' + err.error, 'error'); }
}

// =====================
// UTILITIES
// =====================
function v(id) { const el = document.getElementById(id); return el ? el.value : ''; }

function rows(fields) {
  return fields.map(([label, value, full]) => value ? `
    <div class="detail-row ${full ? 'full' : ''}">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    </div>` : '').join('');
}

function renderPagination(containerId, pages, current, loadFn) {
  const el = document.getElementById(containerId);
  if (pages <= 1) { el.innerHTML = ''; return; }
  let html = '';
  if (current > 1) html += `<button class="page-btn" onclick="${loadFn.name}(${current-1})">‹</button>`;
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= current - 2 && i <= current + 2)) {
      html += `<button class="page-btn ${i===current?'active':''}" onclick="${loadFn.name}(${i})">${i}</button>`;
    } else if (i === current - 3 || i === current + 3) {
      html += `<span style="padding:0 4px">…</span>`;
    }
  }
  if (current < pages) html += `<button class="page-btn" onclick="${loadFn.name}(${current+1})">›</button>`;
  el.innerHTML = html;
}

function showPostModal() {
  document.getElementById('post-modal').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('post-modal').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
}
function openDetailModal() {
  document.getElementById('detail-modal').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}
function closeDetailModal() {
  document.getElementById('detail-modal').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.form-tab').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.remove('hidden');
  btn.classList.add('active');
}

function toast(msg, type = '') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}