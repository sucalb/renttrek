// Phần dùng chung cho index.html và san-pham.html: thẻ sản phẩm, popup, túi thuê, hiệu ứng, con trỏ.
const IMG = (url, w = 900) => RTStore.imgUrl(url, w);
const EXTRA = 20000;
const fmt = n => n.toLocaleString('vi-VN') + 'đ';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const kShort = n => (n / 1000).toLocaleString('vi-VN') + '';
const priceShort = p => p.priceMax ? `${kShort(p.price)}–${kShort(p.priceMax)}K` : `${kShort(p.price)}K`;
const priceFull = (p, add = 0) => p.priceMax ? `${fmt(p.price + add)} – ${fmt(p.priceMax + add)}` : fmt(p.price + add);

// Sản phẩm lấy từ trang admin (Supabase) — xem store.js / admin.html
let PRODUCTS = [];
const findP = id => PRODUCTS.find(x => x.id === id);

const CAT_NAME = { 'trang-phuc': 'Trang phục', 'phu-kien': 'Phụ kiện' };
const catUrl = q => 'san-pham.html?' + new URLSearchParams(q).toString();
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

// ---------- thẻ sản phẩm (dùng cho cả trang chủ và trang danh mục) ----------
function makeCard(p, i, { uniform = false, delay = 0 } = {}) {
  const wide = !uniform && /\bw12\b/.test(p.layout);
  const shape = (p.layout.match(/\br[1-4]\b/) || ['r2'])[0];
  const el = document.createElement('button');
  el.className = uniform ? `card fade ${shape === 'r4' ? 'r2' : shape}` : `card fade ${esc(p.layout)}`;
  el.dataset.id = p.id;
  el.setAttribute('data-hover', 'Xem');
  el.style.transitionDelay = delay + 's';
  if (wide) el.style.gridColumn = '1/-1';
  el.innerHTML = `
    <div class="ph"${wide ? ' style="aspect-ratio:21/8"' : ''}>
      <img loading="lazy" src="${esc(IMG(p.img, wide ? 1800 : 900))}" alt="${esc(p.name)}">
      <span class="price-tag">Xem chi tiết →</span>
    </div>
    <div class="info">
      <div><span class="num">${String(i + 1).padStart(2, '0')} / ${esc(p.type)}</span><h4>${esc(p.name)}</h4><div class="sub">${esc(p.sub)}</div></div>
      <div class="p">${priceShort(p)}<small>/ lượt thuê</small></div>
    </div>
    <div class="sizes">${p.sizes.map(s => `<i>${esc(s)}</i>`).join('')}</div>`;
  el.addEventListener('click', () => openModal(p));
  if (window.__io) window.__io.observe(el); else requestAnimationFrame(() => window.__io?.observe(el));
  return el;
}
// nhóm loại theo thứ tự xuất hiện: { 'trang-phuc': [['Áo', 2], ...] }
function typesByCat(list) {
  const out = {};
  list.forEach(p => {
    const arr = out[p.cat] = out[p.cat] || [];
    const t = arr.find(x => x[0] === p.type);
    t ? t[1]++ : arr.push([p.type, 1]);
  });
  return out;
}

// ---------- trang chủ: mỗi danh mục hiện trước 6 món + nút Xem thêm ----------
const HOME_STEP = 6;
function renderCards(list) {
  const types = typesByCat(list);
  document.querySelectorAll('.cat-block').forEach(block => {
    const cat = block.dataset.cat, items = list.filter(p => p.cat === cat);
    const grid = block.querySelector('[data-grid]');
    block.style.display = items.length ? '' : 'none';
    const cnt = block.querySelector('[data-cat-count]');
    if (cnt) cnt.textContent = `${cnt.dataset.prefix} — ${String(items.length).padStart(2, '0')} món`;
    // chip loại: bấm để sang trang danh mục của loại đó
    const chips = block.querySelector('[data-types]');
    if (chips) chips.innerHTML = (types[cat] || []).map(([t, n]) =>
      `<a class="type-chip" href="${catUrl({ loai: t })}" data-hover="Xem">${esc(t)} <i>${n}</i></a>`).join('');
    let shown = 0;
    const more = block.querySelector('[data-more]');
    const all = block.querySelector('[data-all]');
    if (all) all.href = catUrl({ dm: cat });
    const step = () => {
      const next = items.slice(shown, shown + HOME_STEP);
      next.forEach((p, k) => grid.appendChild(makeCard(p, list.indexOf(p), { delay: (k % 3) * 0.08 })));
      shown += next.length;
      const left = items.length - shown;
      if (more) { more.hidden = left <= 0; more.querySelector('span').textContent = `Xem thêm ${CAT_NAME[cat].toLowerCase()} (${left})`; }
    };
    grid.innerHTML = '';
    step();
    if (more && !more.dataset.bound) { more.dataset.bound = 1; more.addEventListener('click', () => more._step()); }
    if (more) more._step = step;
  });
  const tc = document.getElementById('total-count');
  if (tc) tc.textContent = `(${String(list.length).padStart(2, '0')})`;
}

// ---------- bảng giá: bấm một dòng sang trang danh mục của loại đó ----------
const PRICE_ROWS = [
  ['Mũ', 'chống nắng', '35.000'], ['Kính', 'chống UV', '30.000'], ['Áo', 'khoác & giữ nhiệt', '70.000'],
  ['Quần', 'nhanh khô', '70.000'], ['Giày', 'tùy mẫu', '70.000 – 160.000'], ['Balo', 'trekking', '80.000'], ['Gậy', 'trekking', '45.000'],
];
const plist = document.getElementById('plist');
if (plist) PRICE_ROWS.forEach(([n, s, v]) => {
  const li = document.createElement('li');
  li.className = 'fade';
  li.innerHTML = `<a href="${catUrl({ loai: n })}" data-hover="Xem"><span class="n">${n}<span class="serif">${s}</span></span><span class="v">${v}</span>
    <span class="arr">${ARROW}</span></a>`;
  // bấm vào bất kỳ chỗ nào trên dòng cũng chuyển trang
  li.addEventListener('click', e => { if (!e.target.closest('a')) li.querySelector('a').click(); });
  plist.appendChild(li);
});

// ---------- lọc danh mục ở trang chủ ----------
document.querySelectorAll('.tab[data-filter]').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab[data-filter]').forEach(x => x.setAttribute('aria-pressed', x === t));
  const f = t.dataset.filter;
  document.querySelectorAll('.cat-block').forEach(b => b.classList.toggle('hidden', f !== 'all' && b.dataset.cat !== f));
}));

// ---------- modal ----------
const modal = document.getElementById('modal');
let cur = null, size = null, days = 0;
function openModal(p) {
  cur = p; size = p.sizes[0]; days = 0;
  document.getElementById('m-img').src = IMG(p.img, 1200);
  document.getElementById('m-img').alt = p.name;
  document.getElementById('m-cat').textContent = (p.cat === 'trang-phuc' ? 'Trang phục' : 'Phụ kiện') + ' / ' + p.type;
  document.getElementById('m-title').textContent = p.name;
  document.getElementById('m-desc').textContent = p.desc;
  document.getElementById('m-price').textContent = p.priceMax ? `${priceShort(p)}` : fmt(p.price);
  document.getElementById('m-spec').innerHTML = p.spec.map(([k, v]) => `<li><span>${esc(k)}</span><span>${esc(v)}</span></li>`).join('');
  const sz = document.getElementById('m-sizes');
  sz.innerHTML = p.sizes.map(s => `<button aria-pressed="${s === size}">${esc(s)}</button>`).join('');
  sz.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    size = b.textContent; sz.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  }));
  updEst();
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
function updEst() {
  document.getElementById('m-days').textContent = days;
  document.getElementById('m-est').textContent = priceFull(cur, days * EXTRA);
}
modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
modal.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { days = Math.max(0, Math.min(14, days + +b.dataset.step)); updEst(); }));

// ---------- bag ----------
let bag = [];
try { bag = JSON.parse(localStorage.getItem('renttrek-bag') || '[]'); } catch (e) {}
const drawer = document.getElementById('drawer');
const save = () => { try { localStorage.setItem('renttrek-bag', JSON.stringify(bag)); } catch (e) {} };
function renderBag() {
  document.querySelectorAll('[data-count]').forEach(c => c.textContent = bag.length);
  const box = document.getElementById('bag-items');
  if (!bag.length) box.innerHTML = `<div class="empty"><span class="serif">Túi còn trống</span>Chọn vài món đồ cho chuyến đi nhé.</div>`;
  else box.innerHTML = bag.map((b, i) => {
    const p = findP(b.id);
    if (!p) return '';
    return `<div class="item"><img src="${esc(IMG(p.img, 200))}" alt=""><div><h5>${esc(p.name)}</h5><small>Size ${esc(b.size)}${b.days ? ' · +' + b.days + ' ngày' : ''}</small><br><button class="rm" data-rm="${i}">Bỏ ra</button></div><b>${(p.priceMax ? 'từ ' : '') + fmt(p.price + b.days * EXTRA)}</b></div>`;
  }).join('');
  box.querySelectorAll('[data-rm]').forEach(r => r.addEventListener('click', () => { bag.splice(+r.dataset.rm, 1); save(); renderBag(); }));
  const total = bag.reduce((s, b) => { const p = findP(b.id); return p ? s + p.price + b.days * EXTRA : s; }, 0);
  document.getElementById('bag-total').textContent = fmt(total);
}
const openBag = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); };
const closeBag = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); };
document.querySelectorAll('[data-open-bag]').forEach(b => b.addEventListener('click', openBag));
drawer.querySelectorAll('[data-close-bag]').forEach(b => b.addEventListener('click', closeBag));
document.getElementById('m-add').addEventListener('click', () => {
  bag.push({ id: cur.id, size, days }); save(); renderBag(); closeModal();
  toast(`Đã thêm “${cur.name}” vào túi thuê`);
});
function orderText() {
  if (!bag.length) return '';
  const lines = bag.map((b, i) => {
    const p = findP(b.id) || { name: b.id };
    return `${i + 1}. ${p.name} — size ${b.size}${b.days ? ` — thêm ${b.days} ngày` : ''}`;
  });
  return `Chào RentTrek, mình muốn thuê:\n${lines.join('\n')}\nTạm tính: ${document.getElementById('bag-total').textContent}`;
}
async function copyOrder() {
  const t = orderText();
  if (!t) { toast('Túi thuê đang trống'); return false; }
  try { await navigator.clipboard.writeText(t); toast('Đã copy đơn — dán vào tin nhắn cho shop nhé'); } catch (e) { toast('Không copy được, bạn chụp màn hình gửi shop nhé'); }
  return true;
}
document.getElementById('bag-send').addEventListener('click', async () => { if (await copyOrder()) window.open('https://ig.me/m/renttrek.store', '_blank', 'noopener'); });
document.getElementById('bag-zalo').addEventListener('click', async e => { if (!bag.length) { e.preventDefault(); toast('Túi thuê đang trống'); return; } copyOrder(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeBag(); } });
renderBag();
RTStore.list()
  .catch(e => { console.warn('Không tải được sản phẩm, dùng dữ liệu mẫu:', e); return RTStore.DEFAULT_PRODUCTS; })
  .then(list => {
    PRODUCTS = list;
    // bỏ khỏi túi những món shop đã xoá
    bag = bag.filter(b => findP(b.id)); save();
    if (document.querySelector('[data-grid]')) renderCards(list);
    renderBag();
    window.dispatchEvent(new CustomEvent('rt:products', { detail: list }));
    window.RT_PRODUCTS = list;
  });

let tt;
function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600); }

// ---------- reveal: tách tiêu đề thành từng từ ----------
function splitWords(el) {
  let i = 0;
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const w = document.createElement('span');
        w.className = 'w'; w.style.setProperty('--i', i++); w.textContent = part;
        frag.appendChild(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
  });
  walk(el);
}
document.querySelectorAll('.reveal').forEach(splitWords);
const countUp = el => {
  const m = el.textContent.match(/^(\D*)(\d+)(.*)$/); if (!m) return;
  const [, pre, num, post] = m, end = +num, len = num.length, t0 = performance.now();
  const tick = t => {
    const k = Math.min(1, (t - t0) / 1400), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
    el.textContent = pre + String(v).padStart(len, '0') + post;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target;
  el.classList.add('in'); io.unobserve(el);
  if (el.classList.contains('stat')) countUp(el.querySelector('strong'));
}), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
window.__io = io;
document.querySelectorAll('[data-io]').forEach(el => io.observe(el));
document.querySelectorAll('.reveal, .fade').forEach((el, i) => {
  if (el.classList.contains('fade') && el.parentElement) {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('fade'));
    el.style.transitionDelay = (Math.min(sibs.indexOf(el), 6) * 0.07) + 's';
  }
  io.observe(el);
});

// ---------- nav ----------
const nav = document.querySelector('.nav');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('scrolled', y > 40);
  nav.classList.toggle('hide', y > 400 && y > lastY && !drawer.classList.contains('open'));
  lastY = y;
}, { passive: true });

// ---------- cursor: đế giày xoay theo hướng đi, để lại dấu chân ----------
const cur$ = document.querySelector('.cursor');
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  const SOLE = cur$.querySelector('.sole').innerHTML;
  const pool = Array.from({ length: 14 }, () => {
    const el = document.createElement('div'); el.className = 'print'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = SOLE;
    document.body.appendChild(el); return el;
  });
  let x = -100, y = -100, cx = x, cy = y, rot = 0, tr = 0, px = null, py = null, side = 1, pi = 0, idle;
  const stepLen = 46;
  addEventListener('mousemove', e => {
    x = e.clientX; y = e.clientY;
    if (px === null) { px = x; py = y; return; }
    const dx = x - px, dy = y - py, dist = Math.hypot(dx, dy);
    if (dist < 2) return;
    tr = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (dist >= stepLen && !cur$.classList.contains('big')) {
      // đặt dấu chân trái/phải lệch sang hai bên hướng đi
      const nx = -dy / dist, ny = dx / dist, off = 7 * side;
      const el = pool[pi++ % pool.length];
      el.classList.remove('on'); void el.offsetWidth;
      el.style.transform = `translate3d(${px + nx * off - 7.5}px,${py + ny * off - 12}px,0) rotate(${tr}deg) scaleX(${side})`;
      el.classList.add('on');
      side *= -1; px = x; py = y;
    }
  });
  (function loop() {
    cx += (x - cx) * .25; cy += (y - cy) * .25;
    let d = ((tr - rot + 540) % 360) - 180; rot += d * .18; // xoay mượt theo hướng ngắn nhất
    cur$.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    cur$.style.setProperty('--rot', rot.toFixed(1) + 'deg');
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    const h = e.target.closest('[data-hover], a, button');
    cur$.classList.toggle('big', !!h);
    cur$.querySelector('span').textContent = h?.dataset.hover ? h.dataset.hover.toUpperCase() : '';
  });
}
