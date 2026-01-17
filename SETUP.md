# Telegram Clone - Setup va Ishga Tushirish Ko'rsatmalari

## 🚀 Tez Boshlash

### 1. Loyihani Klonlash
```bash
git clone <repository-url>
cd telegram-clone
```

### 2. Barcha Paketlarni O'rnatish
```bash
npm run install-all
```

### 3. MongoDB Ulanishini Tekshirish
Backend `.env` faylida MongoDB URI'ni tekshiring:
```env
MONGODB_URI=mongodb+srv://tilavovazizbek37_db_user:aevOGZSOsR80bbAO@cluster0.uzczovb.mongodb.net/?appName=Cluster0
```

### 4. Development Mode'da Ishga Tushirish

#### Variant 1: Batch File (Windows)
```bash
start_dev.bat
```

#### Variant 2: Manual
```bash
npm run dev
```

Bu buyruq:
- Backend'ni port 5000'da ishga tushiradi
- Frontend'ni port 3000'da ishga tushiradi

### 5. Brauzerda Ochish
```
http://localhost:3000
```

## 📝 Ro'yxatdan O'tish va Kirish

1. **Ro'yxatdan O'tish** (`/register`):
   - Username: Istalgan nom (3-30 belgi)
   - Email: Haqiqiy email
   - Phone: Telefon raqami
   - Password: Parol (minimal 6 belgi)
   - First Name: Ismi (ixtiyoriy)
   - Last Name: Familiyasi (ixtiyoriy)

2. **Kirish** (`/login`):
   - Email/Phone/Username: Ro'yxatdan o'tishda ishlatilgan ma'lumot
   - Password: Parol

## 🔧 Production Build

### Frontend Build Qilish
```bash
cd frontend
npm run build
```

Build fayllar `frontend/build` papkasida yaratiladi.

### Backend Production Mode'da Ishga Tushirish
```bash
cd backend
npm start
```

## 🐛 Muammolarni Hal Qilish

### MongoDB Ulanish Muammosi
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Yechim**: MongoDB serveringiz ishlab turganiga ishonch hosil qiling.

### Port Allaqachon Ishlatilgan
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Yechim**: Port 5000'da boshqa process ishlab turadi. Uni to'xtating yoki `.env`'da PORT'ni o'zgartiring.

### Frontend Build Xatosi
```
npm ERR! code ELIFECYCLE
```
**Yechim**: 
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Socket.io Ulanish Muammosi
**Yechim**: Frontend `.env`'da `REACT_APP_SOCKET_URL` to'g'ri o'rnatilganiga ishonch hosil qiling.

## 📊 API Testing

### Postman yoki cURL bilan Test Qilish

#### Ro'yxatdan O'tish
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone": "+998901234567",
    "password": "password123"
  }'
```

#### Kirish
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "test@example.com",
    "password": "password123"
  }'
```

## 🔐 Xavfsizlik Eslatmalari

1. **JWT Secret**: Production'da `JWT_SECRET`'ni o'zgartiring
2. **CORS**: Production'da `FRONTEND_URL`'ni to'g'ri o'rnatish
3. **MongoDB**: Production'da strong parol ishlatish
4. **Environment Variables**: `.env` faylini `.gitignore`'ga qo'shing

## 📱 Responsive Dizayn

Ilova quyidagi qurilmalarda test qilingan:
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

## 🎯 Keyingi Qadamlar

1. **Fayl Yuborish**: Multer bilan fayl upload qilish
2. **Voice/Video Qo'ng'iroqlar**: WebRTC integratsiyasi
3. **Guruh Chatlari**: Guruh yaratish va boshqarish
4. **Xabar Qidiruvi**: Advanced search funksiyalari
5. **Notification**: Push notifications

## 📞 Yordam

Muammolar yoki savollar uchun:
1. GitHub Issues'da issue oching
2. Pull Request yuboring
3. Dokumentatsiyani tekshiring

---

**Eslatma**: Bu loyiha ta'lim maqsadida yaratilgan. Production'da ishlatishdan oldin qo'shimcha xavfsizlik choralarini ko'rish tavsiya etiladi.
