import jsPDF from "jspdf";

interface CredentialData {
  name: string;
  email: string;
  password: string;
  role: string;
  kindergartenName: string;
  isAr: boolean;
}

export function generateCredentialPdf(data: CredentialData) {
  const { name, email, password, role, kindergartenName, isAr } = data;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // Header band
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("Kinder BH", pageWidth / 2, 18, { align: "center" });
  doc.setFontSize(12);
  doc.text(
    isAr ? "بيانات الدخول للحساب الجديد" : "New Account Login Credentials",
    pageWidth / 2, 30, { align: "center" }
  );
  doc.setFontSize(9);
  const date = new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.text(date, pageWidth / 2, 39, { align: "center" });

  y = 60;

  // Info box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(200, 200, 220);
  doc.roundedRect(margin, y, contentWidth, 90, 4, 4, "FD");

  const fields = [
    { label: isAr ? "الاسم" : "Name", value: name },
    { label: isAr ? "الدور" : "Role", value: role },
    { label: isAr ? "الروضة" : "Kindergarten", value: kindergartenName },
    { label: isAr ? "البريد الإلكتروني" : "Email", value: email },
    { label: isAr ? "كلمة المرور المؤقتة" : "Temporary Password", value: password },
  ];

  let fy = y + 12;
  fields.forEach((field) => {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(field.label, margin + 10, fy);
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(field.value, margin + 10, fy + 7);
    fy += 17;
  });

  y = fy + 10;

  // Instructions box
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentWidth, 50, 4, 4, "F");
  doc.setFontSize(11);
  doc.setTextColor(22, 163, 74);
  doc.text(isAr ? "تعليمات تسجيل الدخول:" : "Login Instructions:", margin + 10, y + 12);

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const instructions = isAr
    ? [
        "1. افتح التطبيق من الرابط المرسل إليك",
        "2. أدخل البريد الإلكتروني وكلمة المرور أعلاه",
        "3. يُنصح بتغيير كلمة المرور بعد أول تسجيل دخول من الإعدادات",
      ]
    : [
        "1. Open the app from the link sent to you",
        "2. Enter the email and password above",
        "3. It is recommended to change your password after first login from Settings",
      ];
  instructions.forEach((line, i) => {
    doc.text(line, margin + 10, y + 22 + i * 7);
  });

  y += 60;

  // Security notice
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, y, contentWidth, 20, 4, 4, "F");
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text(
    isAr
      ? "⚠️ تنبيه أمني: لا تشارك هذه البيانات مع أي شخص غير المستخدم المعني. قم بحذف هذا الملف بعد تسليمه."
      : "⚠️ Security Notice: Do not share these credentials with anyone other than the intended user. Delete this file after delivery.",
    pageWidth / 2, y + 12, { align: "center", maxWidth: contentWidth - 20 }
  );

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageH - 14, pageWidth, 14, "F");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Kinder BH - Child Development Tracking System", pageWidth / 2, pageH - 7, { align: "center" });

  // Save
  const fileName = `${name.replace(/\s+/g, "_")}_credentials.pdf`;
  doc.save(fileName);
  return fileName;
}

export function buildCredentialWhatsAppMessage(data: CredentialData): string {
  const { name, email, password, role, kindergartenName, isAr } = data;

  if (isAr) {
    return [
      `🔐 *بيانات الدخول - Kinder BH*`,
      `━━━━━━━━━━━━━━━━`,
      `👤 الاسم: *${name}*`,
      `🏷️ الدور: ${role}`,
      `🏫 الروضة: ${kindergartenName}`,
      `📧 البريد: ${email}`,
      `🔑 كلمة المرور: ${password}`,
      ``,
      `📋 *خطوات الدخول:*`,
      `1️⃣ افتح رابط التطبيق`,
      `2️⃣ أدخل البريد وكلمة المرور`,
      `3️⃣ غيّر كلمة المرور من الإعدادات`,
      ``,
      `⚠️ لا تشارك هذه البيانات مع أي شخص آخر`,
    ].join("\n");
  }

  return [
    `🔐 *Login Credentials - Kinder BH*`,
    `━━━━━━━━━━━━━━━━`,
    `👤 Name: *${name}*`,
    `🏷️ Role: ${role}`,
    `🏫 Kindergarten: ${kindergartenName}`,
    `📧 Email: ${email}`,
    `🔑 Password: ${password}`,
    ``,
    `📋 *Login Steps:*`,
    `1️⃣ Open the app link`,
    `2️⃣ Enter email and password`,
    `3️⃣ Change password from Settings`,
    ``,
    `⚠️ Do not share these credentials with anyone else`,
  ].join("\n");
}
