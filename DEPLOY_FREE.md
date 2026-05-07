# Deploy miễn phí

Gợi ý dễ triển khai nhất cho bản demo:

- Frontend: Vercel.
- Backend: Render Web Service Free.
- Database: Supabase Postgres Free.

## 1. Tạo database Supabase

1. Vào Supabase, tạo project mới.
2. Vào `Project Settings` -> `Database`.
3. Copy PostgreSQL connection string.
4. Dùng connection string đó làm biến `DATABASE_URL` trên Render.

## 2. Deploy backend lên Render

1. Push source lên GitHub.
2. Vào Render -> `New` -> `Blueprint`, chọn repo.
3. Render sẽ đọc file `render.yaml`.
4. Điền biến môi trường:

```env
DATABASE_URL=postgresql://...
CLIENT_URL=http://localhost:5173,https://ten-frontend.vercel.app
```

Sau khi deploy backend xong, vào Render Shell chạy seed một lần:

```bash
npm run seed
```

Backend sẽ có URL dạng:

```text
https://medical-cases-api.onrender.com
```

## 3. Deploy frontend lên Vercel

1. Vào Vercel -> `Add New Project`.
2. Chọn repo GitHub.
3. Root Directory: `frontend`.
4. Build settings:

```text
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

5. Thêm biến môi trường:

```env
VITE_API_URL=https://ten-backend.onrender.com
```

6. Deploy.

Sau khi có domain Vercel, quay lại Render sửa:

```env
CLIENT_URL=https://ten-frontend.vercel.app
```

## Lưu ý upload file

Render Free không phù hợp lưu file upload lâu dài trên ổ đĩa local. Bản demo vẫn upload/tải được, nhưng file có thể mất khi service restart hoặc redeploy.

Muốn dùng thật, nên chuyển upload sang Supabase Storage hoặc S3-compatible storage.
