require('dotenv').config();
process.env.TZ = 'Asia/Bangkok';

// Core modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const util = require('util');

// App setup
const app = express();
const port = process.env.PORT || 5050;
const upload = multer({ storage: multer.memoryStorage() });

// Setup Day.js
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
dayjs.extend(timezone);


// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(express.json());


// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME
});


db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    return;
  }
  console.log('✅ Connected to MySQL database!');
});
db.query = util.promisify(db.query);

{/*apis*/}

 // signup api
 app.post('/api/signup', (req, res) => {
  const { username, email, password, tel } = req.body;
  
  console.log("Signup body:", req.body);
  const checkEmailSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailSql, [email], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("MySQL check error:", checkErr);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบอีเมล" });
    }

    if (checkResult.length > 0) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }
    
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("Hash error:", hashErr);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน" });
      }
    
      const insertSql = "INSERT INTO users (username, email, password, tel) VALUES (?, ?, ?, ?)";
      db.query(insertSql, [username, email, hashedPassword, tel], (err, result) => {
        if (err) {
          console.error("MySQL insert error:", err);
          return res.status(500).json({ message: "สมัครสมาชิกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง" });
        }
        return res.json({ message: "สมัครสมาชิกสำเร็จ" });
    });
  });
});
});



//  login api
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const results = await db.query(
      `SELECT u.id, u.username, u.email, u.tel, u.password, a.avatar
       FROM users u
       LEFT JOIN user_avatars a ON u.id = a.user_id
       WHERE u.email = ?`,
      [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: 'ไม่พบผู้ใช้' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });

    let avatarBase64 = null;
    if (user.avatar) {
      avatarBase64 = 'data:image/jpeg;base64,' + user.avatar.toString('base64');
    }

    res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        tel: user.tel,
        avatar: avatarBase64
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});


{/*ฟังก์ชันหน้าHome*/}
//change password
app.put('/api/change-password', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    const { currentPassword, newPassword } = req.body;
    const results = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(403).json({ message: 'Token ผิดพลาดหรือหมดอายุ หรือเกิดข้อผิดพลาดอื่น ๆ' });
  }
});


//แก้ไขข้อมูลส่วนตัว
app.put('/api/update-profile', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    const { username, tel } = req.body;

    if (!username || !tel) {
      return res.status(400).json({ message: 'กรุณาระบุ username และ เบอร์โทร' });
    }

    // อัปเดตด้วย promise
    await db.promise().query(
      'UPDATE users SET username = ?, tel = ? WHERE id = ?',
      [username, tel, userId]
    );

    // ดึงข้อมูลผู้ใช้ใหม่
    const [results] = await db.promise().query(
      'SELECT id, username, email, tel FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = results[0];
    res.json({ message: 'อัปเดตข้อมูลสำเร็จ', user: updatedUser });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(403).json({ message: 'Token ผิดพลาดหรือหมดอายุ หรือเกิดข้อผิดพลาดอื่น ๆ' });
  }
});



//เปลี่ยนรูปโปรไฟล์
app.put('/api/update-avatar', upload.single('avatar'), (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
  } catch (err) {
    return res.status(403).json({ message: 'Token ไม่ถูกต้อง' });
  }

  const userId = decoded.id;

  if (!req.file) {
    return res.status(400).json({ message: 'ไม่พบไฟล์รูปภาพ' });
  }

  const avatarBuffer = req.file.buffer;

  // ตรวจสอบว่ามีใน user_avatars อยู่แล้วไหม
  db.query('SELECT * FROM user_avatars WHERE user_id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error (select)' });

    if (result.length > 0) {
      // อัปเดต
      db.query(
        'UPDATE user_avatars SET avatar = ? WHERE user_id = ?',
        [avatarBuffer, userId],
        (err2) => {
          if (err2) return res.status(500).json({ message: 'Database error (update)' });
          fetchUserWithAvatar(userId, res);
        }
      );
    } else {
      db.query(
        'INSERT INTO user_avatars (user_id, avatar) VALUES (?, ?)',
        [userId, avatarBuffer],
        (err3) => {
          if (err3) return res.status(500).json({ message: 'Database error (insert)' });
          fetchUserWithAvatar(userId, res);
        }
      );
    }
  });
});

function fetchUserWithAvatar(userId, res) {
  db.query(
    `SELECT u.id, u.username, u.email, u.tel, a.avatar
     FROM users u
     LEFT JOIN user_avatars a ON u.id = a.user_id
     WHERE u.id = ?`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error (final select)' });

      const user = rows[0];
      if (user.avatar) {
        // ตรงนี้แปลง Buffer เป็น base64 string พร้อม prefix ให้ถูกต้อง
        user.avatar = 'data:image/jpeg;base64,' + user.avatar.toString('base64');
      }
      // ส่ง user ที่มี avatar base64 กลับไป frontend
      res.json({ message: 'อัปเดตรูปโปรไฟล์สำเร็จ', user });
    }
  );
}


{/*Misc Routes*/}
app.get('/', (req, res) => {
    res.send('Welcome to the backend API!');
  });
  
app.get('/test', (req, res) => {
  res.send('Test route working!');
});

app.get('/api/users', (req, res) => {
    console.log('Request received at /users');
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Database query failed' });
        return;
      }
      console.log('Results:', results); // See the data in the logs
      res.json(results); // Return users as JSON
    });
  });


  {/*หน้าBooking*/}
  app.post('/api/bookings', (req, res) => {
    const {
      booking_date,
      userId,
      event_name,
      court_name,
      start_time,
      end_time,
      booker_name,
      phone_number,
      phone_number2
    } = req.body;
  
    if (!userId) {
      return res.status(400).json({ message: "กรุณาล็อกอินก่อนทำการจอง" });
    }
  
    if (!booking_date || !start_time || !end_time) {
      return res.status(400).json({ message: "กรุณาระบุวันที่และเวลาที่ต้องการจอง" });
    }
  
    if (!event_name || !court_name || !booker_name || !phone_number|| !phone_number2) {
      return res.status(400).json({ message: "กรุณาระบุข้อมูลให้ครบถ้วน" });
    }
  
    if (start_time >= end_time) {
      return res.status(400).json({ message: "⚠️ เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด" });
    }

    //เช็คโควต้า ห้ามเกินวันละ3เวลา
    const sqlCheckQuota = `
    SELECT COUNT(*) AS bookingCount
    FROM bookings
    WHERE user_id = ? AND booking_date = ? AND status <> 'ยกเลิก'
  `;
  db.query(sqlCheckQuota, [userId, booking_date], (err, result) => {
    if (err) {
      console.error('MySQL error:', err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }

    const count = result[0].bookingCount;
    if (count >= 3) {
      return res.status(400).json({ message: 'คุณจองครบจำนวนโควต้าสูงสุดของวันนี้แล้ว (3 ช่วงเวลา)' });
    }

    //เช็คเวลาซ้อนทับ
    const checkBookingSql = `
      SELECT * FROM bookings 
      WHERE booking_date = ? 
        AND court_name = ?
        AND NOT (end_time <= ? OR start_time >= ?)
    `;
  
    db.query(checkBookingSql, [booking_date, court_name, end_time, start_time], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบการจอง" });
      }
  
      if (results.length > 0) {
        return res.status(400).json({ message: "มีการจองแล้วในเวลานี้ กรุณาเลือกเวลาอื่น" });
      }
  
      const insertBookingSql = `
        INSERT INTO bookings (
          user_id, booking_date, start_time, end_time, event_name,
          court_name, booker_name, phone_number, phone_number2
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      db.query(insertBookingSql, [
        userId,
        booking_date,
        start_time,
        end_time,
        event_name,
        court_name,
        booker_name,
        phone_number,
        phone_number2
      ], (err, result) => {
        if (err) {
          console.error("Database Insert Error:", err);
          return res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกการจอง" });
        }
  
        res.status(201).json({ message: "ทำการจองสำเร็จ" });
      });
    });
  });
});

  
  

app.get('/api/bookings', (req, res) => {
  const { court, date } = req.query;

  // ตรวจสอบว่ามี court และ date มาจาก frontend หรือไม่
  if (!court || !date) {
    return res.status(400).json({ message: "กรุณาระบุ court และ date" });
  }

  const sql = `
    SELECT 
      id, user_id, event_name, court_name, 
      DATE_FORMAT(booking_date, '%Y-%m-%d') AS booking_date, 
      start_time, end_time, booker_name, phone_number, phone_number2, status
    FROM bookings
    WHERE (status IS NULL OR status != 'ยกเลิก')
      AND court_name = ?
      AND DATE(booking_date) = ?
  `;

  db.query(sql, [court, date], (err, results) => {
    if (err) {
      console.error("❌ เกิดข้อผิดพลาด:", err);
      return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้", error: err.message });
    }

    res.json(results);
  });
});


  app.get('/api/user-bookings', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    const getBookings = 'SELECT * FROM bookings WHERE user_id = ?';
    db.query(getBookings, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    });
  });
  
  
//ยกเลิกการจอง
app.patch('/api/bookings/:id/cancel', (req, res) => {
  const bookingId = req.params.id;
  const sql = 'UPDATE bookings SET status = "ยกเลิก" WHERE id = ?';

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.error('❌ ยกเลิกการจองล้มเหลว:', err);
      return res.status(500).json({ message: 'ไม่สามารถยกเลิกได้' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบการจองนี้' });
    }

    res.status(200).json({ message: '✅ ยกเลิกการจองเรียบร้อยแล้ว' });
  });
});


 // API สำหรับรับรีวิว (POST /api/review) issue,image
  app.post('/api/reviews', upload.array('images', 10), (req, res) => {
    const { feedback, zone, comment} = req.body;
    const issues = req.body.issues ? JSON.stringify(req.body.issues) : null;
    const images = req.files;

    if (!feedback || !zone || !comment) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    const insertReview = 'INSERT INTO reviews (feedback, zone, issues, comment) VALUES (?, ?, ?, ?)';
    db.query(insertReview, [feedback, zone, issues, comment], (err, result) => {
      if (err) {
        console.error('Review insert error:', err);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกรีวิว' });
      }
  
      const reviewId = result.insertId;
  
      // ถ้ามีรูป ค่อย insert
      if (images.length > 0) {
        const insertImages = 'INSERT INTO review_images (review_id, image) VALUES ?';
        const imageValues = images.map(file => [reviewId, file.buffer]);
  
        db.query(insertImages, [imageValues], (imgErr) => {
          if (imgErr) {
            console.error('Image insert error:', imgErr);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกรูปภาพ' });
          }
          res.status(201).json({ message: 'รีวิวและรูปภาพถูกส่งสำเร็จ' });
        });
      } else {
        res.status(201).json({ message: 'รีวิวถูกส่งสำเร็จ (ไม่มีรูปภาพ)' });
      }
    });
  });
  
  // ดึงรูปทั้งหมดของรีวิว ID นั้น
  app.get('/api/reviews/:id/images', (req, res) => {
    const reviewId = req.params.id;
    const query = 'SELECT image FROM review_images WHERE review_id = ?';
    db.query(query, [reviewId], (err, results) => {
      if (err) {
        return res.status(500).send('เกิดข้อผิดพลาด');
      }
  
      if (results.length === 0) {
        return res.status(404).send('ไม่พบรูปภาพ');
      }
  
      const base64Images = results.map(row => row.image.toString('base64'));
      res.json(base64Images);
    });
  });


//calendar หน้าแรก
app.get('/api/bookings/calendar', (req, res) => {
  const sql = `
    SELECT 
      id, user_id, event_name, court_name, 
      DATE_FORMAT(booking_date, '%Y-%m-%d') AS booking_date, 
      start_time, end_time, booker_name, phone_number, status
    FROM bookings
    WHERE (status IS NULL OR status != 'ยกเลิก')
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching bookings for calendar:", err);
      return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้", error: err.message });
    }
    res.json(results);
  });
});

//piechart
  app.get('/api/stats/today-zone-bookings', (req, res) => {
    const sql = `
      SELECT court_name AS name, COUNT(*) AS value
      FROM bookings
      WHERE 
        (status IS NULL OR status != 'ยกเลิก')
        AND booking_date = CURDATE()
      GROUP BY court_name
    `;
    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Error fetching today's zone bookings:", err);
        return res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
      }
      res.json(results);
    });
  });
  

//barchart
  app.get('/api/stats/weekly-usage', (req, res) => {
    const { start, end } = req.query;
  
    if (!start || !end) {
      return res.status(400).json({ message: "กรุณาระบุ start และ end ใน query" });
    }
  
    const sql = `
      SELECT 
        DAYNAME(booking_date) AS day,
        SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)) / 60 AS hours
      FROM bookings
      WHERE 
        booking_date BETWEEN ? AND ?
        AND (status IS NULL OR status != 'ยกเลิก')
      GROUP BY day
      ORDER BY FIELD(day, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
    `;
  
    db.query(sql, [start, end], (err, results) => {
      if (err) {
        console.error("❌ Error fetching weekly usage stats:", err);
        return res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
      }
  
      const dayMap = {
        Monday: 'Mon',
        Tuesday: 'Tue',
        Wednesday: 'Wed',
        Thursday: 'Thu',
        Friday: 'Fri',
        Saturday: 'Sat',
        Sunday: 'Sun',
      };
  
      const formatted = results.map(r => {
        const hoursNum = Number(r.hours);
        return {
          day: dayMap[r.day] || r.day,
          hours: isNaN(hoursNum) ? 0 : Number(hoursNum.toFixed(2)),
        };
      });
  
      const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const finalData = allDays.map(d => {
        const found = formatted.find(f => f.day === d);
        return found || { day: d, hours: 0 };
      });
  
      res.json(finalData);
    });
  });
  
  
  

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
