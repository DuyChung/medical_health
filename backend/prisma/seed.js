import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.upsert({
    where: { email: "admin@yte.gov.vn" },
    update: {},
    create: {
      name: "Quan tri Y te",
      email: "admin@yte.gov.vn",
      passwordHash: await bcrypt.hash("Admin@123456", 12),
      role: "SUPER_ADMIN"
    }
  });

  const cases = [
    {
      title: "Cảnh báo ổ dịch sốt xuất huyết tại Quận 7",
      summary: "Ghi nhận chùm ca bệnh mới, khuyến cáo người dân chủ động diệt lăng quăng và theo dõi triệu chứng.",
      content: "Trung tâm y tế địa phương ghi nhận nhiều ca sốt cao, đau đầu, xuất huyết nhẹ. Người dân trong khu vực cần vệ sinh dụng cụ chứa nước, ngủ màn và đến cơ sở y tế khi có dấu hiệu cảnh báo.",
      location: "TP. Hồ Chí Minh",
      occurredAt: new Date("2026-05-05T08:00:00.000Z"),
      severity: "HIGH",
      urgent: true,
      imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Ca cúm mùa tăng tại khu vực miền Bắc",
      summary: "Số lượt khám hô hấp tăng, ưu tiên bảo vệ người cao tuổi và trẻ nhỏ.",
      content: "Các bệnh viện ghi nhận xu hướng tăng bệnh nhân cúm mùa. Khuyến cáo đeo khẩu trang ở nơi đông người, rửa tay thường xuyên và tiêm phòng theo hướng dẫn.",
      location: "Hà Nội",
      occurredAt: new Date("2026-05-02T02:00:00.000Z"),
      severity: "MEDIUM",
      urgent: false,
      imageUrl: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Theo dõi ca nghi ngờ tay chân miệng tại trường mầm non",
      summary: "Cơ sở giáo dục đã được khử khuẩn, phụ huynh theo dõi dấu hiệu sốt và nổi bóng nước.",
      content: "Ngành y tế phối hợp nhà trường rà soát tiếp xúc gần, hướng dẫn vệ sinh lớp học, đồ chơi và tạm thời cách ly ca nghi ngờ theo quy định.",
      location: "Đà Nẵng",
      occurredAt: new Date("2026-04-29T03:30:00.000Z"),
      severity: "LOW",
      urgent: false,
      imageUrl: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  for (const item of cases) {
    await prisma.caseReport.upsert({
      where: { id: item.title.toLowerCase().replaceAll(" ", "-") },
      update: {},
      create: { id: item.title.toLowerCase().replaceAll(" ", "-"), ...item, adminId: admin.id }
    });
  }

  const documents = [
    {
      id: "huong-dan-giam-sat-benh-truyen-nhiem-nhom-b",
      data: {
        title: "Hướng dẫn giám sát bệnh truyền nhiễm nhóm B",
        description: "Quy trình phát hiện, báo cáo và xử lý ổ dịch trong cộng đồng.",
        category: "Hướng dẫn",
        issuedBy: "Bộ Y tế",
        issuedAt: new Date("2026-04-20T00:00:00.000Z"),
        originalName: "huong-dan-giam-sat.pdf",
        fileName: "sample-huong-dan-giam-sat.pdf",
        mimeType: "application/pdf",
        size: 245760,
        url: "/uploads/sample-huong-dan-giam-sat.pdf",
        adminId: admin.id
      }
    },
    {
      id: "thong-tu-cap-nhat-phan-tuyen-dieu-tri",
      data: {
        title: "Thông tư cập nhật phân tuyến điều trị",
        description: "Cập nhật trách nhiệm tiếp nhận, phân tuyến, chuyển tuyến trong tình huống ca bệnh tăng.",
        category: "Thông tư",
        issuedBy: "Cục Quản lý Khám chữa bệnh",
        issuedAt: new Date("2026-03-18T00:00:00.000Z"),
        originalName: "thong-tu-phan-tuyen.docx",
        fileName: "sample-thong-tu-phan-tuyen.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 186420,
        url: "/uploads/sample-thong-tu-phan-tuyen.docx",
        adminId: admin.id
      }
    }
  ];

  for (const doc of documents) {
    await prisma.medicalDocument.upsert({
      where: { id: doc.id },
      update: {},
      create: { id: doc.id, ...doc.data }
    });
  }

  console.log("Seed complete. Login: admin@yte.gov.vn / Admin@123456");
}

main().finally(async () => prisma.$disconnect());
