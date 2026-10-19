// Lớp dữ liệu dùng chung cho trang chính (index.html) và trang quản trị (admin.html).
// Có Supabase trong config.js → đọc/ghi Supabase. Không có → chế độ demo lưu trong trình duyệt.
(() => {
  const U = 'https://images.unsplash.com/photo-';
  const ux = id => `${U}${id}?auto=format&fit=crop&q=75`;

  // Dữ liệu mẫu ban đầu (cũng là nội dung của supabase/setup.sql)
  const DEFAULT_PRODUCTS = [
    { id:'ao-khoac', cat:'trang-phuc', type:'Áo', name:'Áo khoác gió chống nước', sub:'Nhẹ, cản gió, gấp gọn vào balo', price:70000, priceMax:null,
      img:ux('1591047139829-d91aecb6caea'), sizes:['S','M','L','XL'], layout:'w5 r1',
      desc:'Lớp ngoài cản gió và mưa nhẹ, phù hợp các cung có sương và gió lớn trên đỉnh.',
      spec:[['Chất liệu','Vải gió phủ chống thấm'],['Phù hợp','Sương, gió, mưa nhẹ'],['Tình trạng','Vệ sinh sạch sau mỗi lượt thuê']] },
    { id:'ao-ni', cat:'trang-phuc', type:'Áo', name:'Áo nỉ giữ nhiệt', sub:'Mặc lót bên trong khi lên cao', price:70000, priceMax:null,
      img:ux('1556821840-3a63f95609a7'), sizes:['S','M','L','XL'], layout:'w7 r2',
      desc:'Lớp giữ ấm mềm, mặc bên trong áo khoác cho đêm cắm trại và sáng sớm săn mây.',
      spec:[['Chất liệu','Nỉ / fleece'],['Phù hợp','Nhiệt độ thấp, cắm trại qua đêm'],['Tình trạng','Vệ sinh sạch sau mỗi lượt thuê']] },
    { id:'quan', cat:'trang-phuc', type:'Quần', name:'Quần trekking nhanh khô', sub:'Co giãn, thoáng, khô nhanh', price:70000, priceMax:null,
      img:ux('1624378439575-d8705ad7ae80'), sizes:['S','M','L','XL'], layout:'w4 r3',
      desc:'Vải co giãn 4 chiều giúp bước dài thoải mái, khô nhanh khi lội suối hoặc dính mưa.',
      spec:[['Chất liệu','Vải dù co giãn'],['Phù hợp','Đường mòn, leo dốc, lội suối'],['Tình trạng','Vệ sinh sạch sau mỗi lượt thuê']] },
    { id:'giay-thap', cat:'trang-phuc', type:'Giày', name:'Giày trekking cổ thấp', sub:'Bám đường, nhẹ chân', price:70000, priceMax:null,
      img:ux('1539185441755-769473a23570'), sizes:['37','38','39','40','41','42','43'], layout:'w4 r2',
      desc:'Đế bám tốt cho cung đường đất, đá nhỏ. Nhẹ, phù hợp trek trong ngày.',
      spec:[['Đế','Cao su bám địa hình'],['Phù hợp','Trek trong ngày, cung dễ – trung bình'],['Tình trạng','Khử mùi, vệ sinh sau mỗi lượt thuê']] },
    { id:'giay-cao', cat:'trang-phuc', type:'Giày', name:'Giày trekking cổ cao chống nước', sub:'Bảo vệ cổ chân cho cung khó', price:160000, priceMax:null,
      img:ux('1595341888016-a392ef81b7de'), sizes:['38','39','40','41','42','43','44'], layout:'w4 r1',
      desc:'Cổ cao ôm chân, chống nước — cho cung đường dài, dốc đá và thời tiết ẩm ướt.',
      spec:[['Đế','Cao su chống trượt'],['Phù hợp','Cung khó, nhiều ngày, đường ướt'],['Tình trạng','Khử mùi, vệ sinh sau mỗi lượt thuê']] },
    { id:'mu', cat:'phu-kien', type:'Mũ', name:'Mũ trekking chống nắng', sub:'Che nắng, thoáng khí', price:35000, priceMax:null,
      img:ux('1521369909029-2afed882baee'), sizes:['Freesize'], layout:'w3 r4',
      desc:'Vành che nắng, quai điều chỉnh vừa đầu. Gọn nhẹ, có thể gấp cất trong balo.',
      spec:[['Size','Freesize, có khóa điều chỉnh'],['Phù hợp','Nắng gắt, đường trống'],['Tình trạng','Vệ sinh sạch sau mỗi lượt thuê']] },
    { id:'kinh', cat:'phu-kien', type:'Kính', name:'Kính râm chống UV', sub:'Giảm chói khi lên cao', price:30000, priceMax:null,
      img:ux('1572635196237-14b3f281503f'), sizes:['Freesize'], layout:'w4 r2',
      desc:'Tròng chống tia UV, giảm chói khi đi đường trống hoặc ngắm biển mây giữa trưa.',
      spec:[['Tròng','Chống UV400'],['Phù hợp','Nắng gắt, độ cao lớn'],['Tình trạng','Kèm hộp đựng']] },
    { id:'balo', cat:'phu-kien', type:'Balo', name:'Balo trekking 40L', sub:'Đai trợ lực, nhiều ngăn', price:80000, priceMax:null,
      img:ux('1622260614153-03223fb72052'), sizes:['40L'], layout:'w5 r3',
      desc:'Đai hông và đai ngực trợ lực, chia ngăn hợp lý cho chuyến đi 2–3 ngày.',
      spec:[['Dung tích','~40 lít'],['Phù hợp','Trek 1–3 ngày'],['Kèm theo','Áo trùm mưa (nếu có)']] },
    { id:'gay', cat:'phu-kien', type:'Gậy', name:'Gậy trekking', sub:'Rút gọn, chỉnh độ dài', price:45000, priceMax:null,
      img:ux('1533240332313-0db49b459ad6'), sizes:['Chỉnh 65–135cm'], layout:'w12 r2',
      desc:'Đỡ gối khi xuống dốc, giữ thăng bằng khi qua suối. Rút gọn, khóa chắc.',
      spec:[['Chiều dài','Điều chỉnh khoảng 65–135cm'],['Phù hợp','Dốc dài, đường trơn'],['Tình trạng','Kiểm tra khóa trước khi giao']] },
  ].map((p, i) => ({ ...p, sort: (i + 1) * 10, visible: true }));

  const cfg = window.RENTTREK_CONFIG || {};
  const live = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  const BUCKET = cfg.BUCKET || 'products';

  // Ảnh Unsplash nhận tham số kích thước; ảnh khác giữ nguyên
  const imgUrl = (url, w = 900) => !url ? '' : url.startsWith(U) ? `${url}${url.includes('?') ? '&' : '?'}w=${w}` : url;

  const fromRow = r => ({ id:r.id, cat:r.cat, type:r.type, name:r.name, sub:r.sub || '', price:r.price, priceMax:r.price_max,
    img:r.img_url || '', homeImg:r.home_img || '', sizes:r.sizes || [], layout:r.layout || 'w4 r2', desc:r.description || '', spec:r.spec || [],
    sort:r.sort ?? 0, visible:r.visible !== false });
  const toRow = p => ({ id:p.id, cat:p.cat, type:p.type, name:p.name, sub:p.sub, price:p.price, price_max:p.priceMax || null,
    img_url:p.img, home_img:p.homeImg || null, sizes:p.sizes, layout:p.layout, description:p.desc, spec:p.spec, sort:p.sort, visible:p.visible });

  const loadScript = src => new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Không tải được ' + src));
    document.head.appendChild(s);
  });

  // ---------- Supabase ----------
  function supabaseStore() {
    let sb;
    const ready = loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js')
      .then(() => { sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); });
    const chk = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
    return {
      mode: 'supabase', ready,
      async list({ all = false } = {}) {
        await ready;
        let q = sb.from('products').select('*').order('sort', { ascending: true });
        if (!all) q = q.eq('visible', true);
        return chk(await q).map(fromRow);
      },
      async save(p) { await ready; return fromRow(chk(await sb.from('products').upsert(toRow(p)).select().single())); },
      async remove(id) { await ready; chk(await sb.from('products').delete().eq('id', id)); },
      async upload(blob, name) {
        await ready;
        const path = `${Date.now()}-${name}`;
        chk(await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, upsert: false }));
        return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      },
      async signIn(email, password) { await ready; chk(await sb.auth.signInWithPassword({ email, password })); },
      async signOut() { await ready; await sb.auth.signOut(); },
      async user() { await ready; return (await sb.auth.getSession()).data.session?.user || null; },
    };
  }

  // ---------- Demo (localStorage) ----------
  function demoStore() {
    const KEY = 'renttrek-demo-products';
    const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(v)) return v; } catch (e) {} return DEFAULT_PRODUCTS.map(p => ({ ...p })); };
    const write = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { throw new Error('Bộ nhớ trình duyệt đã đầy — ở chế độ demo chỉ lưu được ít ảnh. Hãy kết nối Supabase.'); } };
    const sorted = l => l.slice().sort((a, b) => a.sort - b.sort);
    return {
      mode: 'demo', ready: Promise.resolve(),
      async list({ all = false } = {}) { const l = sorted(read()); return all ? l : l.filter(p => p.visible); },
      async save(p) { const l = read(); const i = l.findIndex(x => x.id === p.id); i < 0 ? l.push(p) : (l[i] = p); write(l); return p; },
      async remove(id) { write(read().filter(p => p.id !== id)); },
      async upload(blob) { return await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); }); },
      async signIn() { sessionStorage.setItem('rt-demo-auth', '1'); }, async signOut() { sessionStorage.removeItem('rt-demo-auth'); },
      async user() { return sessionStorage.getItem('rt-demo-auth') ? { email: 'demo' } : null; },
      reset() { localStorage.removeItem(KEY); },
    };
  }

  const store = live ? supabaseStore() : demoStore();
  window.RTStore = Object.assign(store, { DEFAULT_PRODUCTS, imgUrl });
})();
