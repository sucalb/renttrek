-- ============================================================
-- RentTrek — chạy 1 lần trong Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Bảng sản phẩm
create table if not exists public.products (
  id          text primary key,
  cat         text not null check (cat in ('trang-phuc','phu-kien')),
  type        text not null,
  name        text not null,
  sub         text default '',
  price       integer not null check (price >= 0),
  price_max   integer,
  img_url     text,
  home_img    text,          -- ảnh riêng cho trang chủ (bỏ trống = dùng img_url)
  sizes       text[] default '{}',
  layout      text default 'w4 r2',
  description text default '',
  spec        jsonb default '[]'::jsonb,
  sort        integer default 0,
  visible     boolean default true,
  updated_at  timestamptz default now()
);
-- project tạo trước khi có cột ảnh trang chủ
alter table public.products add column if not exists home_img text;

-- 2) Danh sách email được quyền quản trị
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;  -- không ai đọc/ghi được từ web

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- 3) Quyền: ai cũng xem được sản phẩm đang hiện; chỉ admin được sửa
alter table public.products enable row level security;
drop policy if exists "public read" on public.products;
drop policy if exists "admin all" on public.products;
create policy "public read" on public.products for select using (visible or public.is_admin());
create policy "admin all"   on public.products for all using (public.is_admin()) with check (public.is_admin());

-- 3b) Cấp quyền truy cập bảng cho web (RLS ở trên vẫn giới hạn ai làm được gì)
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- 4) Kho ảnh công khai; chỉ admin được tải lên / xoá
insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do update set public = true;
drop policy if exists "rt public read" on storage.objects;
drop policy if exists "rt admin write" on storage.objects;
drop policy if exists "rt admin update" on storage.objects;
drop policy if exists "rt admin delete" on storage.objects;
create policy "rt public read"  on storage.objects for select using (bucket_id = 'products');
create policy "rt admin write"  on storage.objects for insert with check (bucket_id = 'products' and public.is_admin());
create policy "rt admin update" on storage.objects for update using (bucket_id = 'products' and public.is_admin());
create policy "rt admin delete" on storage.objects for delete using (bucket_id = 'products' and public.is_admin());

-- 5) Dữ liệu mẫu ban đầu (có thể sửa / xoá sau trong trang admin)
insert into public.products (id, cat, type, name, sub, price, price_max, img_url, sizes, layout, description, spec, sort, visible) values
  ('ao-khoac', 'trang-phuc', 'Áo', 'Áo khoác gió chống nước', 'Nhẹ, cản gió, gấp gọn vào balo', 70000, null, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=75', array['S','M','L','XL']::text[], 'w5 r1', 'Lớp ngoài cản gió và mưa nhẹ, phù hợp các cung có sương và gió lớn trên đỉnh.', '[["Chất liệu","Vải gió phủ chống thấm"],["Phù hợp","Sương, gió, mưa nhẹ"],["Tình trạng","Vệ sinh sạch sau mỗi lượt thuê"]]'::jsonb, 10, true),
  ('ao-ni', 'trang-phuc', 'Áo', 'Áo nỉ giữ nhiệt', 'Mặc lót bên trong khi lên cao', 70000, null, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=75', array['S','M','L','XL']::text[], 'w7 r2', 'Lớp giữ ấm mềm, mặc bên trong áo khoác cho đêm cắm trại và sáng sớm săn mây.', '[["Chất liệu","Nỉ / fleece"],["Phù hợp","Nhiệt độ thấp, cắm trại qua đêm"],["Tình trạng","Vệ sinh sạch sau mỗi lượt thuê"]]'::jsonb, 20, true),
  ('quan', 'trang-phuc', 'Quần', 'Quần trekking nhanh khô', 'Co giãn, thoáng, khô nhanh', 70000, null, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=75', array['S','M','L','XL']::text[], 'w4 r3', 'Vải co giãn 4 chiều giúp bước dài thoải mái, khô nhanh khi lội suối hoặc dính mưa.', '[["Chất liệu","Vải dù co giãn"],["Phù hợp","Đường mòn, leo dốc, lội suối"],["Tình trạng","Vệ sinh sạch sau mỗi lượt thuê"]]'::jsonb, 30, true),
  ('giay-thap', 'trang-phuc', 'Giày', 'Giày trekking cổ thấp', 'Bám đường, nhẹ chân', 70000, null, 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=75', array['37','38','39','40','41','42','43']::text[], 'w4 r2', 'Đế bám tốt cho cung đường đất, đá nhỏ. Nhẹ, phù hợp trek trong ngày.', '[["Đế","Cao su bám địa hình"],["Phù hợp","Trek trong ngày, cung dễ – trung bình"],["Tình trạng","Khử mùi, vệ sinh sau mỗi lượt thuê"]]'::jsonb, 40, true),
  ('giay-cao', 'trang-phuc', 'Giày', 'Giày trekking cổ cao chống nước', 'Bảo vệ cổ chân cho cung khó', 160000, null, 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=75', array['38','39','40','41','42','43','44']::text[], 'w4 r1', 'Cổ cao ôm chân, chống nước — cho cung đường dài, dốc đá và thời tiết ẩm ướt.', '[["Đế","Cao su chống trượt"],["Phù hợp","Cung khó, nhiều ngày, đường ướt"],["Tình trạng","Khử mùi, vệ sinh sau mỗi lượt thuê"]]'::jsonb, 50, true),
  ('mu', 'phu-kien', 'Mũ', 'Mũ trekking chống nắng', 'Che nắng, thoáng khí', 35000, null, 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=75', array['Freesize']::text[], 'w3 r4', 'Vành che nắng, quai điều chỉnh vừa đầu. Gọn nhẹ, có thể gấp cất trong balo.', '[["Size","Freesize, có khóa điều chỉnh"],["Phù hợp","Nắng gắt, đường trống"],["Tình trạng","Vệ sinh sạch sau mỗi lượt thuê"]]'::jsonb, 60, true),
  ('kinh', 'phu-kien', 'Kính', 'Kính râm chống UV', 'Giảm chói khi lên cao', 30000, null, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=75', array['Freesize']::text[], 'w4 r2', 'Tròng chống tia UV, giảm chói khi đi đường trống hoặc ngắm biển mây giữa trưa.', '[["Tròng","Chống UV400"],["Phù hợp","Nắng gắt, độ cao lớn"],["Tình trạng","Kèm hộp đựng"]]'::jsonb, 70, true),
  ('balo', 'phu-kien', 'Balo', 'Balo trekking 40L', 'Đai trợ lực, nhiều ngăn', 80000, null, 'https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&q=75', array['40L']::text[], 'w5 r3', 'Đai hông và đai ngực trợ lực, chia ngăn hợp lý cho chuyến đi 2–3 ngày.', '[["Dung tích","~40 lít"],["Phù hợp","Trek 1–3 ngày"],["Kèm theo","Áo trùm mưa (nếu có)"]]'::jsonb, 80, true),
  ('gay', 'phu-kien', 'Gậy', 'Gậy trekking', 'Rút gọn, chỉnh độ dài', 45000, null, 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=75', array['Chỉnh 65–135cm']::text[], 'w12 r2', 'Đỡ gối khi xuống dốc, giữ thăng bằng khi qua suối. Rút gọn, khóa chắc.', '[["Chiều dài","Điều chỉnh khoảng 65–135cm"],["Phù hợp","Dốc dài, đường trơn"],["Tình trạng","Kiểm tra khóa trước khi giao"]]'::jsonb, 90, true)
on conflict (id) do nothing;

-- 6) THÊM EMAIL ADMIN — đổi thành email của shop rồi chạy dòng này
-- insert into public.admins (email) values ('email-cua-shop@gmail.com');
