import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Email-Key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { to, subject, html, key } = body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject, and html are required' });
    }

    if (key !== 'TilshunosMasterKey2026') {
      return res.status(403).json({ error: 'Unauthorized key' });
    }

    const gmailUser = process.env.GMAIL_USER || 'soxibgaybullayev439@gmail.com';
    const gmailPass = process.env.GMAIL_APP_PASSWORD || Buffer.from('cHNsdWV0Z3Nrd2NpeXhuYQ==', 'base64').toString('utf8');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"TILSHUNOS" <${gmailUser}>`,
      to: to.trim().toLowerCase(),
      subject,
      html,
    });

    console.log(`[VERCEL EMAIL DISPATCH] Sent to ${to}. MessageId: ${info.messageId}`);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('[VERCEL EMAIL ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
