import React, { useContext, useEffect, useState } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { UserContext } from './context/UserContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import axios from 'axios';
import { FaUserCircle, FaUserCog, FaKey, FaImage, FaSignOutAlt, FaSave, FaTimes } from 'react-icons/fa';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/th'



dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

function formatDateBuddhist(date) {
  const d = dayjs(date);
  const day = d.date();
  const month = d.format('MMMM');
  const yearBE = d.year() + 543;
  return `${day} ${month} ${yearBE}`;
}

const startOfWeek = dayjs().startOf('week').add(1, 'day');
const endOfWeek = dayjs().endOf('week').add(1, 'day');  
const todayFormatted = dayjs().add(543, 'year').format('D MMMM YYYY');
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const CalendarSection = () => {
const [events, setEvents] = useState([]);

const zoneColors = {
  A: '#0088FE',
  B: '#00C49F',
  C: '#FFBB28',
  D: '#FF8042',
  E: '#AA00FF',
};


useEffect(() => {
  axios.get('http://localhost:5050/api/bookings/calendar')
    .then((res) => {
      const transformed = res.data.map((booking) => {
        const zoneKey = booking.court_name?.slice(-1); // ดึง A/B/C จาก 'กระจก A'
        const color = zoneColors[zoneKey] || '#ccc';
        return {
          title: `กิจกรรม: ${booking.event_name} (${booking.booker_name}) - ${booking.court_name}`,
          start: dayjs(`${booking.booking_date}T${booking.start_time}`).toISOString(),
          end: dayjs(`${booking.booking_date}T${booking.end_time}`).toISOString(),
          backgroundColor: color,
          borderColor: color,
          textColor: '#fff',
        };
      });
      setEvents(transformed);
    })
    .catch((err) => {
      console.error('❌ Error loading bookings:', err);
    });
}, []);

 
return (
  <div className="calendar-container">
    <div className='head-table'>ตารางการใช้กระจก</div>
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      locale="th"
      events={events}
      height="auto"
      slotMinTime="09:00:00"  
      slotMaxTime="21:00:00"
    />
  </div>
);

};

//piechart

function StatsSection(setBookingStats) {
  axios.get('/api/stats/today-zone-bookings')
    .then(res => {
      const safeBookingStats = res.data.map(stat => ({
        ...stat,
        value: Math.max(0, Number(stat.value) || 0),
      }));
      setBookingStats(safeBookingStats);
    })
    .catch(err => console.error('Error loading booking stats:', err));
}

  
function ProfileModal({ user, onClose, onSave }) {
  const [username, setUsername] = useState(user.username || '');
  const [tel, setTel] = useState(user.tel || '');

  const handleSave = () => {
    onSave({ ...user, username, tel });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        <h2>แก้ไขข้อมูลส่วนตัว</h2>

        <label>ชื่อผู้ใช้</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ชื่อผู้ใช้"
        />

        <label>เบอร์โทรศัพท์</label>
        <input
          type="tel"
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          placeholder="เบอร์โทรศัพท์"
        />

        <label>อีเมล </label>
        <input type="email" value={user.email} readOnly />

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="btn-save" onClick={handleSave}><FaSave style={{ marginRight: 5 }} /> บันทึกข้อมูล</button>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose, onSave }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    onSave({ currentPassword, newPassword });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content change-password-modal">
        <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        <h2>เปลี่ยนรหัสผ่าน</h2>

        <label>รหัสผ่านปัจจุบัน</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="กรอกรหัสผ่านปัจจุบัน"
        />

        <label>รหัสผ่านใหม่</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="กรอกรหัสผ่านใหม่"
        />

        <label>ยืนยันรหัสผ่านใหม่</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="ยืนยันรหัสผ่านใหม่"
        />

        {error && <p className="error-message">{error}</p>}

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="btn-save" onClick={handleSave}><FaSave style={{ marginRight: 5 }} /> บันทึก</button>
        </div>
      </div>
    </div>
  );
}

function ChangeAvatarModal({ user, onClose, onSave }) {
  const [avatarPreview, setAvatarPreview] = React.useState(user.avatar || '');
  const [avatarFile, setAvatarFile] = React.useState(null);


function resizeImage(file, maxWidth = 800, maxHeight = 800) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    reader.onerror = (error) => reject(error);

    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg', 
        0.7 
      );
    };

    img.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
}

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

const handleSave = async () => {
  if (!avatarFile) return alert("กรุณาเลือกไฟล์ภาพก่อนบันทึก");

  try {
    const resizedBlob = await resizeImage(avatarFile); // ย่อรูปก่อนส่ง
    onSave(resizedBlob); // ส่ง blob กลับไปจัดการใน parent component
  } catch (error) {
    alert("เกิดข้อผิดพลาดในการประมวลผลรูปภาพ");
  }
};
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        <h2>เปลี่ยนรูปโปรไฟล์</h2>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <img
            src={avatarPreview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="avatar-preview"
            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="btn-save" onClick={handleSave}><FaSave style={{ marginRight: 5 }} /> บันทึก</button>
        </div>
      </div>
    </div>
  );
}



//main
function Home() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isChangeAvatarOpen, setChangeAvatarOpen] = useState(false);
  const [bookingStats, setBookingStats] = useState([]);
  const [usageStats, setUsageStats] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5050/api/stats/today-zone-bookings')
      .then(res => setBookingStats(res.data))
      .catch(err => console.error('Error loading booking stats:', err));
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser(null);
    }
  }, [setUser]);
  useEffect(() => {
  StatsSection(setBookingStats, setUsageStats);
}, []);

useEffect(() => {
  const today = dayjs().tz(); 
  const endOfWeek = today.day() === 6 ? today : today.day(6); 
  const startOfWeek = endOfWeek.subtract(6, 'day'); 

  console.log("Start:", startOfWeek.format('YYYY-MM-DD')); 
  console.log("End:", endOfWeek.format('YYYY-MM-DD'));   

  axios.get(`/api/stats/weekly-usage?start=${startOfWeek.format('YYYY-MM-DD')}&end=${endOfWeek.format('YYYY-MM-DD')}`)
    .then(res => {
      setUsageStats(res.data);
    })
    .catch(err => console.error(err));
}, []);



  const displayName = user && user.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : 'Log in';

  const goToBooking = () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการจอง');
      navigate('/login');
    } else {
      navigate('/booking');
    }
  };

  const handleOpenProfileModal = () => setProfileModalOpen(true);
  const handleCloseProfileModal = () => setProfileModalOpen(false);
  const handleSaveProfile = async (updatedUser) => {
    console.log("กำลังส่ง:", updatedUser); 
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5050/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: updatedUser.username,
          tel: updatedUser.tel, 
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ไม่สามารถอัปเดตข้อมูลได้');
      }
  
      const data = await response.json();
  
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setProfileModalOpen(false);
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
  
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };
  

  const handleOpenChangePassword = () => setChangePasswordOpen(true);
  const handleCloseChangePassword = () => setChangePasswordOpen(false);
  const handleSaveChangePassword = async ({ currentPassword, newPassword }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('JWT Token:', token);
      const response = await fetch('http://localhost:5050/api/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
      }

      alert('เปลี่ยนรหัสผ่านสำเร็จ');
      setChangePasswordOpen(false);
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const handleOpenChangeAvatar = () => setChangeAvatarOpen(true);
  const handleCloseChangeAvatar = () => setChangeAvatarOpen(false);
  const handleSaveChangeAvatar = async (resizedBlob) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', resizedBlob, 'avatar.jpg');
  
      const response = await fetch('http://localhost:5050/api/update-avatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ไม่สามารถอัปเดตรูปโปรไฟล์ได้');
      }
  
      const data = await response.json();
  
      setUser(prevUser => ({
        ...prevUser,
        avatar: data.user.avatar
      }));
  
      const storedUser = JSON.parse(localStorage.getItem('user'));
      storedUser.avatar = data.user.avatar;
      localStorage.setItem('user', JSON.stringify(storedUser));
  
      setChangeAvatarOpen(false);
      alert('เปลี่ยนรูปโปรไฟล์สำเร็จ');
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };
  
  

  return (
    <div className="home-container">
      <nav className="home-navbar">
        <h1 className="logo">GYMNASIUM 7</h1>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><span onClick={goToBooking}>Booking</span></li>

          <li>
            {user ? (
              <div className="dropdown">
                <button className="dropbtn">
                  <img
                    src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt="nav-avatar"
                    style={{ width: '24px', height: '24px', borderRadius: '50%', marginRight: '8px' }}
                  />
                  {displayName} <span className="arrow">&#9662;</span>
                </button>

                <div className="dropdown-content">
                  <div className="profile-summary">
                    <img
                      src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                      alt="avatar"
                      className="dropdown-avatar"
                    />
                    <div>
                      <div className="dropdown-username">{user.username}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>
                  </div>
                  <hr />

                  <div className="dropdown-setting">
                    <button onClick={handleOpenProfileModal} className="link-button">
                      <FaUserCog /> ตั้งค่าข้อมูลส่วนตัว
                    </button>
                    <button onClick={handleOpenChangePassword} className="link-button">
                      <FaKey /> เปลี่ยนรหัสผ่าน
                    </button>
                    <button onClick={handleOpenChangeAvatar} className="link-button">
                      <FaImage /> เปลี่ยนรูปโปรไฟล์
                    </button>
                  </div>
                  <div className="dropdown-logout">
                    <Link to="/" onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setUser(null);
                    }}>
                      <FaSignOutAlt /> ออกจากระบบ
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login"><u>Log in</u></Link>
            )}
          </li>
        </ul>
      </nav>

      {isProfileModalOpen && (
        <ProfileModal user={user} onClose={handleCloseProfileModal} onSave={handleSaveProfile} />
      )}
      {isChangePasswordOpen && (
        <ChangePasswordModal onClose={handleCloseChangePassword} onSave={handleSaveChangePassword} />
      )}
      {isChangeAvatarOpen && (
        <ChangeAvatarModal user={user} onClose={handleCloseChangeAvatar} onSave={handleSaveChangeAvatar} />
      )}

<header className="hero">
  <h2 className="hero-title">RESERVE A PUBLIC MIRROR GYMNASIUM 7</h2>

  <div className="hero-container">
    <div className="hero-carousel">
      <Carousel autoPlay infiniteLoop showThumbs={false}>
        <div>
          <img
            src="https://i.postimg.cc/ZKJGB9Fn/7.jpg"
            alt="Gym 1"
            className="carousel-image"
          />
        </div>
        <div>
          <img
            src="https://i.postimg.cc/wvY9wwWk/IMG-8456.avif"
            alt="Gym 2"
            className="carousel-image"
          />
        </div>
        <div>
          <img
            src="https://i.postimg.cc/fRM2fmj0/IMG-8454.avif"
            alt="Gym 3"
            className="carousel-image"
          />
        </div>
        <div>
          <img
            src="https://i.postimg.cc/ZqMwmgkr/IMG-8455.avif"
            alt="Gym 4"
            className="carousel-image"
          />
        </div>
        <div>
          <img
            src="https://i.postimg.cc/1tz1CbGw/IMG-8458.avif"
            alt="Gym 5"
            className="carousel-image"
          />
        </div>
      </Carousel>
    </div>

    <div className="hero-description">
      <p>
        พื้นที่ติดกระจกสำหรับการออกกำลังกาย การทำกิจกรรมกีฬา และการจัดงานต่าง ๆ
        โดยมุ่งเน้นการให้บริการแก่นักศึกษา บุคลากร และบุคคลภายนอกที่สนใจเข้ามาใช้บริการ
        ยิมเนเซียม 7 มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต มีลักษณะเป็นสถานที่อเนกประสงค์ที่ถูกออกแบบมาเพื่อรองรับกิจกรรมที่หลากหลาย
        เช่น ซ้อมเต้น ซ้อมเดินแบบ หรือกิจกรรมกลุ่มอื่น ๆ ที่ต้องใช้พื้นที่เพื่อดูตัวเองในกระจก
      </p>

      <div className="booking-steps">
      <h2>ขั้นตอนการจองกระจก</h2>
        <div className="step">
          <div className="step-icon">1</div>
          <div className="step-text">เข้าสู่ระบบ (Log in) </div>
        </div>
        <div className="step">
          <div className="step-icon">2</div>
          <div className="step-text">หากยังไม่มีบัญชี ทำการสมัครสมาชิก (Sign Up)</div>
        </div>
        <div className="step">
          <div className="step-icon">3</div>
          <div className="step-text">เลือก วันที่,โซน,เวลา ที่ต้องการจอง</div>
        </div>
        <div className="step">
          <div className="step-icon">4</div>
          <div className="step-text">กรอกข้อมูลและยืนยันการจองกระจก</div>
        </div>
      </div>

      <button className="cta-button" onClick={goToBooking}>
        BOOKING NOW
      </button>
    </div>
  </div>
</header>


      <section className="calendar-container">
      <CalendarSection />

    </section>



    <section className="visualize">
        <h2>สถิติการใช้งาน</h2>
        <div className="chart-container" style={{ display: 'flex', gap: '2rem' }}>
          <div className="chart" style={{ flex: 1 }}>
            <h4>ชั่วโมงการใช้งานของแต่ละโซน </h4>
            <h5>( {todayFormatted} )</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
              <Pie
  data={bookingStats}
  dataKey="value"
  nameKey="name"
  outerRadius={100}
  label={({ name, value }) => ` ${value} hrs `}
>
  {bookingStats.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
  ))}
</Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart" style={{ flex: 1 }}>
            <h4>ชั่วโมงการใช้งานกระจกต่อวันในสัปดาห์นี้</h4>
            <h5>( {formatDateBuddhist(startOfWeek)} - {formatDateBuddhist(endOfWeek)} )</h5>
            <br></br>
            <ResponsiveContainer width="100%" height={300}>
  <BarChart data={usageStats}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="day" />
    <YAxis domain={[0, 12]} ticks={[0,1,2,3,4,5,6,7,8,9,10,11,12]} interval={0} />
    <Tooltip />
    <Legend />
    <Bar dataKey="hours" fill="#8884d8" />
  </BarChart>
</ResponsiveContainer>


          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; PUBLIC MIRROR RESERVING GYMNASIUM 7 PROJECT</p>
      </footer>
    </div>
  );
}


export default Home;