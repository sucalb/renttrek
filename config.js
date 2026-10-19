// Cấu hình kết nối Supabase cho RentTrek.
// Điền 2 giá trị lấy ở Supabase → Project Settings → API (xem HUONG-DAN.md).
// Để trống cả hai = chế độ DEMO: dữ liệu chỉ lưu trong trình duyệt đang mở.
window.RENTTREK_CONFIG = {
  SUPABASE_URL: 'https://vhacolflnoavgriywsmv.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoYWNvbGZsbm9hdmdyaXl3c212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzODQ4NzAsImV4cCI6MjEwNzk2MDg3MH0.3em7kwsAw3AYmXaStOxZX4Km-oRA7SPxInYN4GIOUdY', // khóa "anon public" (được phép để công khai)
  BUCKET: 'products',    // tên kho ảnh trong Supabase Storage
};
