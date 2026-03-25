const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const template = (title, body) => `
<div style="font-family:Arial;max-width:560px;margin:auto;background:#0d0d1a;border-radius:16px;padding:40px;color:#e2e2f0">
  <h2 style="color:#00d4ff">SkillSphere</h2>
  <h3>${title}</h3>${body}
  <p style="color:#555;font-size:12px;margin-top:24px">If you did not request this, ignore this email.</p>
</div>`;

exports.sendVerificationEmail = async (user, token) => {
  const url = process.env.CLIENT_URL + '/verify-email/' + token;
  await transporter.sendMail({
    from: '"SkillSphere" <' + process.env.EMAIL_USER + '>',
    to: user.email,
    subject: 'Verify Your Email — SkillSphere',
    html: template('Verify Your Email', `<p>Hi ${user.name}, click below to verify:</p>
      <a href="${url}" style="display:inline-block;background:#00d4ff;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Verify Email</a>
      <p style="color:#888;font-size:13px">Expires in 24 hours.</p>`)
  });
};

exports.sendPasswordResetEmail = async (user, token) => {
  const url = process.env.CLIENT_URL + '/reset-password/' + token;
  await transporter.sendMail({
    from: '"SkillSphere" <' + process.env.EMAIL_USER + '>',
    to: user.email,
    subject: 'Reset Password — SkillSphere',
    html: template('Reset Your Password', `<p>Hi ${user.name}, click below to reset your password:</p>
      <a href="${url}" style="display:inline-block;background:#00d4ff;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Reset Password</a>
      <p style="color:#888;font-size:13px">Expires in 1 hour.</p>`)
  });
};
