const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Replace with your database password
  database: 'safespacedb',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database.');
});

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // or other mail service
  auth: {
    user: 'ubsafespace@gmail.com', // Replace with your email
    pass: 'yourpassword', // Replace with your email password or app password
  },
});

// Register endpoint
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // OTP expires after 15 minutes

  const hashedPassword = bcrypt.hashSync(password, 10); // Hash password before storing

  const query = `
    INSERT INTO users (email, password, otp, otp_expired_at, is_verified)
    VALUES (?, ?, ?, ?, false)
    ON DUPLICATE KEY UPDATE otp = ?, otp_expired_at = ?;
  `;

  db.query(query, [email, hashedPassword, otp, otpExpiration, otp, otpExpiration], (err) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    const mailOptions = {
      from: 'ubsafespace@gmail.com',
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Email Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send email' });
      }

      res.status(200).json({ success: true, message: 'OTP sent successfully' });
    });
  });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isValidPassword = bcrypt.compareSync(password, user[0].password); // Use bcryptjs compareSync
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    const userData = {
      id: user[0].id,
      email: user[0].email,
      is_verified: user[0].is_verified,
    };

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error('Server error during login:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Example Fetch Posts Endpoint
app.post('/items', (req, res) => {
  console.log('Received POST request for /items', req.body);  // Debugging log
  const { user_id, description } = req.body;
  const query = 'INSERT INTO posts (user_id, description) VALUES (?, ?)';
  
  db.query(query, [user_id, description], (err, result) => {
    if (err) {
      console.error('Error inserting post:', err);
      return res.status(500).json({ success: false, message: 'Failed to create post.' });
    }

    res.status(200).json({ success: true, message: 'Post created successfully', postId: result.insertId });
  });
});



app.listen(port, () => {
  console.log(`Server running on http://192.168.1.3:${port}`);
});
