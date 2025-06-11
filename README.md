[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/w8H8oomW)
**<ins>Note</ins>: Students must update this `README.md` file to be an installation manual or a README file for their own CS403 projects.**

**รหัสโครงงาน:** 67-1_36_snk-r2

**ชื่อโครงงาน (ไทย):** เว็บแอปพลิเคชันจองกระจกในที่สาธารณะสำหรับทำกิจกรรมยิมเนเซียม 7
**Project Title (Eng):** PUBLIC MIRROR RESERVATIONS WEB APPLICATION FOE ACTIVITIES GYMNASIUM7

**อาจารย์ที่ปรึกษาโครงงาน:** ผศ.ดร.ศาตนาฏ กิจศิรานุวัตร

**ผู้จัดทำโครงงาน:** 
1.  นางสาวดลพร หาหอม    6309610027  donlaporn.hah@dome.tu.ac.th
2.  นางสาวมณสิชา วงษ์กราน 6309681531  monsicha.wong@dome.tu.ac.th
   

# Directory tree ของโปรแกรม

├── Project/<br/>
├── backend/  # ฝั่งเซิร์ฟเวอร์ (Node.js + Express)<br/>
│&emsp;├── package-lock.json<br/>
│&emsp;├── package.json<br/>
│&emsp;└── server.js<br/>
├── database/  # โครงสร้างฐานข้อมูล SQL<br/>
│&emsp;└── gymnasium7.sql<br/>
├── frontend/  # ฝั่งผู้ใช้ (React)<br/>
│&emsp;├── README.md<br/>
│&emsp;├── build/  # ไฟล์ production build<br/>
│&emsp;│&emsp;├── asset-manifest.json<br/>
│&emsp;│&emsp;├── favicon.ico<br/>
│&emsp;│&emsp;├── index.html<br/>
│&emsp;│&emsp;├── logo192.png<br/>
│&emsp;│&emsp;├── logo512.png<br/>
│&emsp;│&emsp;├── manifest.json<br/>
│&emsp;│&emsp;├── robots.txt<br/>
│&emsp;│&emsp;└── static/<br/>
│&emsp;├── package-lock.json<br/>
│&emsp;├── package.json<br/>
│&emsp;├── public/  # ไฟล์ static<br/>
│&emsp;│&emsp;├── favicon.ico<br/>
│&emsp;│&emsp;├── index.html<br/>
│&emsp;│&emsp;├── logo192.png<br/>
│&emsp;│&emsp;├── logo512.png<br/>
│&emsp;│&emsp;├── manifest.json<br/>
│&emsp;│&emsp;└── robots.txt<br/>
│&emsp;└── src/  # โค้ดหลักของ React<br/>
│&emsp;&emsp;├── App.js<br/>
│&emsp;&emsp;├── App.css<br/>
│&emsp;&emsp;├── App.test.js<br/>
│&emsp;&emsp;├── Booking.js<br/>
│&emsp;&emsp;├── Booking.css<br/>
│&emsp;&emsp;├── BookingConfirmation.js<br/>
│&emsp;&emsp;├── BookingConfirmation.css<br/>
│&emsp;&emsp;├── BookingDetail.js<br/>
│&emsp;&emsp;├── BookingDetail.css<br/>
│&emsp;&emsp;├── CalendarApp.js<br/>
│&emsp;&emsp;├── History.js<br/>
│&emsp;&emsp;├── History.css<br/>
│&emsp;&emsp;├── Home.js<br/>
│&emsp;&emsp;├── Home.css<br/>
│&emsp;&emsp;├── Logout.js<br/>
│&emsp;&emsp;├── Navbar.js<br/>
│&emsp;&emsp;├── Navbar.css<br/>
│&emsp;&emsp;├── PrivateRoute.js<br/>
│&emsp;&emsp;├── Review.js<br/>
│&emsp;&emsp;├── Review.css<br/>
│&emsp;&emsp;├── SignUp.js<br/>
│&emsp;&emsp;├── SignUp.css<br/>
│&emsp;&emsp;├── context/<br/>
│&emsp;&emsp;├── index.js<br/>
│&emsp;&emsp;├── index.css<br/>
│&emsp;&emsp;├── login.js<br/>
│&emsp;&emsp;├── login.css<br/>
│&emsp;&emsp;├── logo.svg<br/>
│&emsp;&emsp;├── reportWebVitals.js<br/>
│&emsp;&emsp;├── setupTests.js<br/>
│&emsp;&emsp;└── utils/<br/>
├── venv/  # Python virtual environment<br/>
│&emsp;├── bin/  # ไฟล์รันบน Unix<br/>
│&emsp;├── include/<br/>
│&emsp;├── lib/<br/>
│&emsp;│&emsp;└── python3.10/<br/>
│&emsp;└── pyvenv.cfg<br/>


# โปรแกรมที่ใช้
โปรเจกต์นี้ถูกสร้างขึ้นด้วยเทคโนโลยีหลักๆ ดังต่อไปนี้:

- Node.js: ทำหน้าที่เป็น Backend Server สำหรับโปรแกรม Labeling รับผิดชอบในการจัดการคำขอ (request) จากฝั่งผู้ใช้ และประมวลผลข้อมูล

- MySQL: เป็น ตัวจัดการฐานข้อมูลหลัก ของโปรแกรม ใช้ในการจัดเก็บและเรียกใช้ข้อมูลทั้งหมด

- Visual Studio Code: เป็น โปรแกรมแก้ไขโค้ด (Code Editor) ที่ใช้ในการพัฒนาและจัดการ Source Code ของโปรเจกต์
# วิธีการโหลดไฟล์โปรเจกต์
- วิธีที่ 1 Download ZIP
1. ไปที่หน้า GitHub Repository
https://github.com/ComSciThammasatU/2567-2-cs403-final-submission-67-1_36_snk-r2-1 
คลิกปุ่ม สีเขียว ที่เขียนว่า Code
2. เลือก Download ZIP
3. แตกไฟล์ .zip ที่ดาวน์โหลดมา
4. เปิดโฟลเดอร์ใน Visual Studio Code

- วิธีที่ 2 Clone Code จาก GitHub
1. สร้างโฟลเดอร์ที่ต้องการเก็บโปรเจกต์
2. เปิดโปรแกรม Visual Studio Code และ Command Prompt(หรือTerminal)
3. พิมพ์คำสั่งนี้ใน Command Prompt(หรือTerminal) เพื่อ clone โปรเจกต์จาก GitHub
```
git clone https://github.com/ComSciThammasatU/2567-2-cs403-final-submission-67-1_36_snk-r2-1.git
```
# การติดตั้ง
ทำตามขั้นตอนด้านล่างเพื่อติดตั้งและรันโปรเจกต์บนเครื่องของคุณ

1. สิ่งที่ต้องติดตั้งเบื้องต้น
- Node.js และ npm แนะนำให้ติดตั้งเวอร์ชัน LTS (Long Term Support) เช่น เวอร์ชัน 20.x หรือใหม่กว่า

- MySQL Server: ติดตั้งเพื่อใช้เป็นฐานข้อมูล โดยค่าพื้นฐานที่แนะนำ
```
Host: localhost
Port: 3306
User: root
Password: 
```
- หลังจากติดตั้งเสร็จ ให้ สร้างฐานข้อมูล ชื่อ gymnasium7 โดยใช้คำสั่ง SQL
```
CREATE DATABASE gymnasium7;
```
2. ติดตั้ง Dependency (Backend)
นำทางไปยังโฟลเดอร์ backend
แล้วรันคำสั่งเพื่อติดตั้งแพ็กเกจที่จำเป็น
```
npm init -y
npm install express cors body-parser mysql2 multer dotenv jsonwebtoken bcrypt dayjs
```
3. ติดตั้ง Dependency (Frontend)
นำทางไปยังโฟลเดอร์ frontend
รันคำสั่งเพื่อติดตั้งไลบรารีที่จำเป็น
```
npm install react-calendar @schedule-x/react @schedule-x/calendar @schedule-x/events-service @schedule-x/theme-default react-modal dayjs react-router-dom
```
4. สร้างและตั้งค่าไฟล์ .env (สำหรับ Backend)
ในโฟลเดอร์ backend ให้สร้างไฟล์ชื่อ .env
ใส่ค่าต่อไปนี้ลงในไฟล์
```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=gymnasium7
PORT=5050
JWT_SECRET=1234
TZ=Asia/Bangkok
```
# การรันโปรแกรม
หลังจากติดตั้งเสร็จสิ้น คุณสามารถรันโปรแกรมได้โดย
- Backend
```
cd backend
node server.js
```
- Frontend
```
cd frontend
npm start
```
- ระบบจะเปิดหน้าเว็บอัตโนมัติที่ http://localhost:3000
- ส่วน Backend จะรันที่ http://localhost:5050

