const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const { query, initDb } = require('./db');
const { authenticateToken, JWT_SECRET } = require('./middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configure Nodemailer Transporter
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Reusable function to send email notification
async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n⚠️  SMTP Gmail credentials missing in backend/.env! Skipping email delivery.');
    return false;
  }

  try {
    await mailTransporter.sendMail({
      from: `"DYNO Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✉️  Email successfully sent to ${to}`);
    return true;
  } catch (err) {
    console.error('❌ Nodemailer Error sending email:', err.message);
    return false;
  }
}

// In-memory store for pending user registrations
const pendingUsers = {};
const resetPasswordTokens = {};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password || !role || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = await query.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate a random 4-digit verification code
    const code = String(Math.floor(1000 + Math.random() * 9000));
    pendingUsers[email] = { name, email, password, role, phone, code, timestamp: Date.now() };

    console.log('\n======================================================');
    console.log(`✉️  [VERIFICATION CODE FOR ${email}] => ${code}`);
    console.log('======================================================\n');

    // Send Real Email Notification via Nodemailer
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e4e7; border-radius: 16px; background-color: #faf9fb; color: #16171d;">
        <h2 style="color: #FF6B00; text-align: center; font-family: Georgia, serif; font-size: 32px; margin-top: 0; letter-spacing: 2px;">DYNO</h2>
        <p style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px;">Hi ${name},</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">Thank you for signing up with DYNO. Please use the following 4-digit verification code to complete your registration:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 36px; font-weight: 800; color: #FF6B00; background-color: rgba(255,107,0,0.08); padding: 14px 36px; border-radius: 12px; letter-spacing: 6px; border: 1.5px dashed rgba(255,107,0,0.5);">${code}</span>
        </div>
        
        <p style="font-size: 13px; color: #888; text-align: center; margin-bottom: 20px;">This code is valid for 10 minutes. If you didn't request this, you can ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e5e4e7; margin: 24px 0;">
        <p style="font-size: 11px; color: #aaa; text-align: center; margin-bottom: 0;">© 2025 Dyno Technologies Pvt. Ltd. · Delhi NCR, India</p>
      </div>
    `;

    // Fire-and-forget sending (don't block client response)
    sendEmail({
      to: email,
      subject: 'Verify your DYNO Account',
      html: emailHtml
    });

    res.status(200).json({
      verificationRequired: true,
      email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  const pending = pendingUsers[email];
  if (!pending) {
    return res.status(400).json({ error: 'No pending registration found for this email' });
  }

  if (pending.code !== String(code)) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  try {
    const hash = await bcrypt.hash(pending.password, 10);
    const result = await query.run(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [pending.name, pending.email, hash, pending.role, pending.phone]
    );

    // If role is worker, also seed profile in workers table
    if (pending.role === 'worker') {
      await query.run(`
        INSERT INTO workers (name, category, rate, location, verified, exp, img, bio, avail, lat, lng, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [pending.name, 'assistant', 600, 'Delhi', 1, '1 yr', '🧑‍🔧', 'Passionate professional worker ready to assist with daily tasks.', 'Immediate', 28.6304, 77.2177, result.id]);
    }

    const token = jwt.sign({ id: result.id, email: pending.email, role: pending.role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Clean up pending registration
    delete pendingUsers[email];

    res.status(201).json({
      token,
      user: { id: result.id, name: pending.name, email: pending.email, role: pending.role, phone: pending.phone }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error during email verification' });
  }
});

// Development-only endpoint to retrieve verification code programmatically for tests
app.get('/api/auth/otp', (req, res) => {
  const pending = pendingUsers[req.query.email];
  if (pending) {
    res.json({ code: pending.code });
  } else {
    res.status(404).json({ error: 'Verification code not found' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await query.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await query.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'No user exists with this email address' });
    }

    // Generate 6-digit random code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    resetPasswordTokens[email] = {
      code,
      timestamp: Date.now()
    };

    console.log('\n======================================================');
    console.log(`✉️  [PASSWORD RESET OTP FOR ${email}] => ${code}`);
    console.log('======================================================\n');

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e4e7; border-radius: 16px; background-color: #faf9fb; color: #16171d;">
        <h2 style="color: #FF6B00; text-align: center; font-family: Georgia, serif; font-size: 32px; margin-top: 0; letter-spacing: 2px;">DYNO</h2>
        <h3 style="color: #333; text-align: center; margin-top: 10px; font-family: Georgia, serif;">Password Reset Request</h3>
        <p style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px;">Hi ${user.name},</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">We received a request to reset the password for your DYNO account. Use the following 6-digit verification code to proceed:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 38px; font-weight: 800; color: #FF6B00; background-color: rgba(255,107,0,0.08); padding: 14px 36px; border-radius: 12px; letter-spacing: 8px; border: 1.5px dashed rgba(255,107,0,0.5);">${code}</span>
        </div>
        
        <p style="font-size: 13px; color: #888; text-align: center; margin-bottom: 20px;">This code is valid for 10 minutes. If you did not request a password reset, you can safely ignore this mail.</p>
        <hr style="border: 0; border-top: 1px solid #e5e4e7; margin: 24px 0;">
        <p style="font-size: 11px; color: #aaa; text-align: center; margin-bottom: 0;">© 2025 Dyno Technologies Pvt. Ltd. · Delhi NCR, India</p>
      </div>
    `;

    sendEmail({
      to: email,
      subject: 'Reset your DYNO Password',
      html: emailHtml
    });

    res.json({ success: true, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, code, and new password are required' });
  }

  const tokenInfo = resetPasswordTokens[email];
  if (!tokenInfo) {
    return res.status(400).json({ error: 'No password reset request found for this email' });
  }

  // Check code
  if (tokenInfo.code !== String(code)) {
    return res.status(400).json({ error: 'Invalid reset code' });
  }

  // Check expiration (10 minutes)
  if (Date.now() - tokenInfo.timestamp > 10 * 60 * 1000) {
    delete resetPasswordTokens[email];
    return res.status(400).json({ error: 'Reset code has expired' });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await query.run('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email]);

    // Clean token
    delete resetPasswordTokens[email];

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/reset-otp', (req, res) => {
  const tokenInfo = resetPasswordTokens[req.query.email];
  if (tokenInfo) {
    res.json({ code: tokenInfo.code });
  } else {
    res.status(404).json({ error: 'Reset code not found' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await query.get('SELECT id, name, email, role, phone FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Workers Routes
app.get('/api/workers', async (req, res) => {
  const { category, search, sortBy } = req.query;
  let sql = 'SELECT * FROM workers WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR location LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (sortBy === 'rate') {
    sql += ' ORDER BY rate ASC';
  } else {
    sql += ' ORDER BY rating DESC';
  }

  try {
    const workers = await query.all(sql, params);
    // Convert verified integer to boolean
    const formattedWorkers = workers.map(w => ({
      ...w,
      verified: w.verified === 1
    }));
    res.json(formattedWorkers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

app.get('/api/workers/me', authenticateToken, async (req, res) => {
  try {
    const worker = await query.get('SELECT * FROM workers WHERE user_id = ?', [req.user.id]);
    if (!worker) {
      return res.status(404).json({ error: 'Worker profile not found for this user' });
    }
    worker.verified = worker.verified === 1;
    res.json(worker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch worker profile' });
  }
});

app.put('/api/workers/profile', authenticateToken, async (req, res) => {
  const { rate, category, exp, bio, avail } = req.body;

  try {
    const worker = await query.get('SELECT id FROM workers WHERE user_id = ?', [req.user.id]);
    if (!worker) {
      return res.status(404).json({ error: 'Worker profile not found for this user' });
    }

    await query.run(
      `UPDATE workers 
       SET rate = COALESCE(?, rate), 
           category = COALESCE(?, category), 
           exp = COALESCE(?, exp), 
           bio = COALESCE(?, bio), 
           avail = COALESCE(?, avail) 
       WHERE id = ?`,
      [rate, category, exp, bio, avail, worker.id]
    );

    const updated = await query.get('SELECT * FROM workers WHERE id = ?', [worker.id]);
    updated.verified = updated.verified === 1;
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update worker profile' });
  }
});

app.get('/api/workers/:id', async (req, res) => {
  try {
    const worker = await query.get('SELECT * FROM workers WHERE id = ?', [req.params.id]);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    worker.verified = worker.verified === 1;
    res.json(worker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

// Bookings Routes
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    let sql = `
      SELECT b.*, w.name as worker_name, w.img as worker_img
      FROM bookings b
      JOIN workers w ON b.worker_id = w.id
    `;
    const params = [];

    if (req.user.role === 'client') {
      sql += ' WHERE b.client_id = ?';
      params.push(req.user.id);
    } else {
      // If user is a worker, they should see bookings assigned to them.
      sql += ' JOIN users u ON u.id = b.client_id WHERE w.user_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY b.created_at DESC';

    const bookings = await query.all(sql, params);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
  const { worker_id, role, start_date, days, amount } = req.body;
  if (!worker_id || !role || !start_date || !days || !amount) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  try {
    // Generate Booking ID (e.g. B104)
    const bookingId = 'B' + Math.floor(100 + Math.random() * 900);
    const status = 'upcoming';

    await query.run(
      'INSERT INTO bookings (id, worker_id, client_id, role, start_date, days, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [bookingId, worker_id, req.user.id, role, start_date, days, amount, status]
    );

    // Increment worker's job count
    await query.run('UPDATE workers SET jobs = jobs + 1 WHERE id = ?', [worker_id]);

    const newBooking = await query.get(
      'SELECT b.*, w.name as worker_name, w.img as worker_img FROM bookings b JOIN workers w ON b.worker_id = w.id WHERE b.id = ?',
      [bookingId]
    );

    // Send Booking Confirmation Email to client
    const clientUser = await query.get('SELECT name, email FROM users WHERE id = ?', [req.user.id]);
    if (clientUser && clientUser.email) {
      const bookingHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e4e7; border-radius: 16px; background-color: #faf9fb; color: #16171d;">
          <h2 style="color: #22c55e; text-align: center; font-family: Georgia, serif; font-size: 30px; margin-top: 0;">Booking Confirmed!</h2>
          <p style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px;">Hi ${clientUser.name},</p>
          <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">Your booking with <strong>${newBooking.worker_name}</strong> has been successfully placed. Here are your booking details:</p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e5e4e7; margin: 20px 0;">
            <table style="width: 100%; font-size: 14px; color: #444; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #888;">Booking ID:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #16171d;">${bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #888;">Worker Name:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #16171d;">${newBooking.worker_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #888;">Role Category:</td>
                <td style="padding: 8px 0; text-align: right;">${role}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #888;">Start Date:</td>
                <td style="padding: 8px 0; text-align: right;">${start_date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #888;">Duration:</td>
                <td style="padding: 8px 0; text-align: right;">${days} day(s)</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 14px 0 0 0; font-weight: bold; color: #FF6B00; font-size: 16px;">Total Cost:</td>
                <td style="padding: 14px 0 0 0; text-align: right; font-weight: bold; color: #FF6B00; font-size: 18px;">₹${amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #666; line-height: 1.5; margin-bottom: 24px;">Our team or the worker will connect with you shortly to coordinate timings. Thank you for booking through DYNO!</p>
          <hr style="border: 0; border-top: 1px solid #e5e4e7; margin: 24px 0;">
          <p style="font-size: 11px; color: #aaa; text-align: center; margin-bottom: 0;">© 2025 Dyno Technologies Pvt. Ltd. · Delhi NCR, India</p>
        </div>
      `;

      sendEmail({
        to: clientUser.email,
        subject: `Booking Confirmed: ${newBooking.worker_name} via DYNO`,
        html: bookingHtml
      });
    }

    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.patch('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    // Verify booking exists
    const booking = await query.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify authorized user: must be the assigned worker or the client who booked
    let isAuthorized = false;
    if (req.user.role === 'worker') {
      const worker = await query.get('SELECT id FROM workers WHERE user_id = ?', [req.user.id]);
      if (worker && worker.id === booking.worker_id) {
        isAuthorized = true;
      }
    } else if (req.user.role === 'client' && booking.client_id === req.user.id) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Unauthorized to update this booking' });
    }

    await query.run('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);

    const updated = await query.get(
      'SELECT b.*, w.name as worker_name, w.img as worker_img FROM bookings b JOIN workers w ON b.worker_id = w.id WHERE b.id = ?',
      [req.params.id]
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Jobs Routes
app.get('/api/jobs', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT * FROM jobs';
    const params = [];

    if (req.user.role === 'client') {
      sql += ' WHERE client_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY created_at DESC';
    const jobs = await query.all(sql, params);
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.post('/api/jobs', authenticateToken, async (req, res) => {
  const { category, location, start_date, days, budget, description, contact_name, contact_phone } = req.body;
  if (!category || !location || !start_date || !days || !budget || !contact_name || !contact_phone) {
    return res.status(400).json({ error: 'Missing required job fields' });
  }

  try {
    const result = await query.run(
      'INSERT INTO jobs (client_id, category, location, start_date, days, budget, description, contact_name, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, category, location, start_date, days, budget, description, contact_name, contact_phone]
    );

    const newJob = await query.get('SELECT * FROM jobs WHERE id = ?', [result.id]);
    res.status(201).json(newJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post job' });
  }
});

// Serve static frontend assets in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback index.html for Single Page Application routing (SPA)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
});

// Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
