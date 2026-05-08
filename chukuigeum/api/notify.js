import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { venue, address, mealCost, reporterEmail } = req.body;

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL,
      subject: `[축의금] 새 제보: ${venue}`,
      html: `
        <h2>새 예식장 제보가 들어왔어요!</h2>
        <ul>
          <li><b>예식장:</b> ${venue}</li>
          <li><b>주소:</b> ${address || '-'}</li>
          <li><b>식대:</b> ${Number(mealCost).toLocaleString()}원</li>
          <li><b>제보자:</b> ${reporterEmail || '익명'}</li>
          <li><b>시간:</b> ${new Date().toLocaleString('ko-KR')}</li>
        </ul>
        <a href="https://chukuigeum.vercel.app/admin">관리자 페이지 바로가기</a>
      `,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}