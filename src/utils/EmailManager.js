/* eslint-disable import/no-extraneous-dependencies */
import nodemailer from 'nodemailer';

class EmailManager {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // Ganti dengan SMTP host dari penyedia layanan Anda
      port: 587, // Port standar untuk SMTP (587 atau 465)
      secure: false, // true untuk port 465, false untuk port 587
      auth: {
        user: process.env.SMTP_EMAIL, // Alamat email bisnis Anda
        pass: process.env.SMTP_PASSWORD, // Password email bisnis Anda
      },
    });
  }

  async sendOtpEmail(email, otp) {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Kode OTP Anda',
      text: `Kode OTP Anda adalah: ${otp}. Berlaku selama 15 menit.`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export default EmailManager;
