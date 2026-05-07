# Cổng quản lý và thông báo ca bệnh y tế

Full-stack website quản lý ca bệnh, văn bản y tế, cảnh báo khẩn cấp và dashboard analytics. Dự án gồm React + TailwindCSS ở frontend, ExpressJS + JWT + Socket.IO ở backend, PostgreSQL qua Prisma.

## Tính năng

- Người dùng xem ca bệnh mới, tin khẩn, chi tiết bài viết, tìm kiếm và tải văn bản PDF/DOCX.
- Admin đăng nhập JWT, tạo/sửa/xóa ca bệnh, upload file, thêm văn bản y tế, quản lý tài khoản admin qua API.
- Dashboard có thống kê lượt truy cập, lượt xem bài viết, bài nổi bật và biểu đồ.
- Realtime notification qua Socket.IO khi có ca bệnh mới.
- Dark mode, responsive mobile/desktop, giao diện xanh y tế theo phong cách cổng thông tin công.
- SEO cơ bản qua meta tags, HTML semantic và nội dung public indexable.

## Cấu trúc thư mục

```text
.
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src
│       ├── middleware
│       ├── routes
│       └── server.js
├── frontend
│   └── src
│       ├── components
│       ├── context
│       ├── lib
│       └── pages
├── storage/uploads
└── docker-compose.yml
```

## Chạy bằng Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/health`
- Admin mẫu: `admin@yte.gov.vn`
- Mật khẩu mẫu: `Admin@123456`

## Chạy thủ công khi phát triển

1. Tạo database PostgreSQL và copy file env:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Backend:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

## API chính

- `POST /api/auth/login`: đăng nhập admin.
- `GET /api/auth/me`: lấy thông tin admin hiện tại.
- `GET /api/cases`: danh sách ca bệnh public, hỗ trợ `q`, `severity`, `take`.
- `GET /api/cases/:id`: chi tiết ca bệnh và tăng lượt xem.
- `GET /api/cases/admin`: danh sách quản trị, yêu cầu JWT.
- `POST /api/cases`: tạo ca bệnh, multipart `files`, yêu cầu JWT.
- `PUT /api/cases/:id`: chỉnh sửa ca bệnh, yêu cầu JWT.
- `DELETE /api/cases/:id`: xóa ca bệnh, yêu cầu JWT.
- `GET /api/documents`: danh sách văn bản, hỗ trợ `q`, `category`.
- `POST /api/documents`: upload PDF/DOC/DOCX, yêu cầu JWT.
- `GET /api/analytics/summary`: dashboard analytics, yêu cầu JWT.
- `POST /api/analytics/visit`: ghi nhận lượt truy cập.
- `GET /api/admins`, `POST /api/admins`: quản lý tài khoản admin.

## Database schema

Schema chính nằm tại `backend/prisma/schema.prisma`, gồm:

- `Admin`: tài khoản quản trị, vai trò `SUPER_ADMIN` hoặc `EDITOR`.
- `CaseReport`: bài thông báo ca bệnh, mức độ `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- `Attachment`: file đính kèm cho ca bệnh.
- `MedicalDocument`: văn bản PDF/DOC/DOCX.
- `SiteVisit`: lượt truy cập website.
- `PostView`: lượt xem từng bài.

## Gợi ý production

- Đổi `JWT_SECRET`, tài khoản admin seed và mật khẩu database.
- Dùng object storage cho file upload nếu triển khai nhiều instance.
- Đặt reverse proxy HTTPS, giới hạn CORS theo domain thật.
- Bật backup PostgreSQL và log tập trung.
