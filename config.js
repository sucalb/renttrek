// Cấu hình kết nối Supabase cho RentTrek.
// Điền 2 giá trị lấy ở Supabase → Project Settings → API (xem HUONG-DAN.md).
// Để trống cả hai = chế độ DEMO: dữ liệu chỉ lưu trong trình duyệt đang mở.
window.RENTTREK_CONFIG = {
  SUPABASE_URL: '',      // ví dụ: 'https://abcdxyz.supabase.co'
  SUPABASE_ANON_KEY: '', // khóa "anon public" (được phép để công khai)
  BUCKET: 'products',    // tên kho ảnh trong Supabase Storage
};
