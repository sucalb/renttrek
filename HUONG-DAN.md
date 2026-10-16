# RentTrek — Hướng dẫn trang admin

## Các file

| File | Dùng để |
|---|---|
| `index.html` | Trang chủ (mỗi danh mục hiện trước 6 món, có nút **Xem thêm**) |
| `san-pham.html` | Trang danh mục: lọc theo loại (`?loai=Áo`) hoặc danh mục (`?dm=trang-phuc`), sắp xếp theo giá, 12 món/trang |
| `style.css`, `shop.js` | Giao diện và phần chức năng dùng chung cho 2 trang trên (không cần sửa) |
| `admin.html` | Trang quản trị: đăng / sửa / ẩn / xoá sản phẩm và ảnh |
| `config.js` | Nơi dán 2 mã kết nối Supabase |
| `store.js` | Phần đọc/ghi dữ liệu dùng chung (không cần sửa) |
| `supabase/setup.sql` | Lệnh tạo bảng, kho ảnh, quyền admin và 9 sản phẩm mẫu |

Khi `config.js` còn để trống, web chạy **chế độ demo**: admin vẫn dùng được nhưng dữ liệu chỉ lưu trong trình duyệt đang mở (khách khác không thấy). Dùng để xem thử trước khi kết nối thật.

## Kết nối Supabase (làm 1 lần, khoảng 10 phút)

1. Vào https://supabase.com → đăng ký → **New project** (chọn region Singapore cho nhanh). Gói Free là đủ.
2. Mở **SQL Editor → New query**, dán toàn bộ nội dung `supabase/setup.sql` → **Run**.
3. Vẫn trong SQL Editor, chạy dòng sau (đổi thành email của shop):
   ```sql
   insert into public.admins (email) values ('email-cua-shop@gmail.com');
   ```
   Chỉ những email nằm trong bảng `admins` mới sửa được dữ liệu.
4. Vào **Authentication → Users → Add user → Create new user**, nhập đúng email ở bước 3 và mật khẩu, tick *Auto Confirm User*.
5. Vào **Authentication → Sign In / Providers**, tắt **Allow new users to sign up** (không ai tự đăng ký được).
6. Vào **Project Settings → API**, copy:
   - **Project URL** → dán vào `SUPABASE_URL` trong `config.js`
   - **anon public key** → dán vào `SUPABASE_ANON_KEY`

   Khoá *anon* được phép để công khai trên web; quyền ghi đã được khoá bằng bảng `admins`. **Không** dán khoá `service_role`.
7. Đưa cả thư mục lên hosting tĩnh (Netlify, Vercel, Cloudflare Pages hoặc GitHub Pages).

## Dùng trang admin

Vào `ten-mien-cua-shop/admin.html` → đăng nhập bằng email/mật khẩu ở bước 4.

- **+ Thêm sản phẩm**: kéo thả ảnh (hoặc bấm chọn từ điện thoại), điền tên, loại, giá, size → **Lưu**. Ảnh tự nén còn tối đa 1600px.
- **Giá đến**: điền khi giá dao động (VD giày 70.000 – 160.000).
- **Kiểu khung ảnh / Độ rộng thẻ**: chọn dáng ảnh trên web (vòm, bo góc, góc lượn, tròn) và thẻ to hay nhỏ.
- **Công tắc** bên phải mỗi dòng: ẩn/hiện sản phẩm trên web mà không cần xoá.
- **↑ ↓**: đổi thứ tự hiển thị.
- **Sửa → Xoá**: xoá hẳn sản phẩm.

Sau khi lưu, khách tải lại trang web là thấy thay đổi ngay.

## Lưu ý

- Bảng giá ở mục "Bảng giá" (Mũ, Kính, Áo…) đang ghi cứng theo bảng giá của shop trong `shop.js`; bấm vào một dòng sẽ sang trang danh mục của loại đó.
- Các nút loại (Áo, Quần, Giày…) tự sinh theo ô **Loại** khi đăng sản phẩm — gõ thống nhất (VD luôn là "Áo", không lúc "áo khoác" lúc "Áo") để gom đúng trang.
- Muốn đổi số món mỗi lần "Xem thêm" sửa `HOME_STEP` trong `shop.js`; số món mỗi trang danh mục sửa `PER_PAGE` trong `san-pham.html`.
- Ảnh cũ bị thay không tự xoá khỏi kho; có thể dọn trong Supabase → Storage → `products`.
- Gói Free của Supabase có 1 GB lưu ảnh. Project không có truy cập trong 7 ngày sẽ bị tạm dừng, vào dashboard bấm *Restore* là chạy lại.
