# Muammolarni Hal Qilish (Troubleshooting)

## 🔴 Keng Uchraydigan Muammolar

### 1. Saytga Kirganda Blank Ekran Ko'rinadi

**Sabab**: Frontend build qilinmagan yoki backend build'ni serve qilmayapti.

**Yechim**:
```bash
# Frontend build qilish
cd frontend
npm run build

# Backend'ni restart qilish
cd ../backend
npm start
```

**Tekshirish**:
- Browser console'da (F12) xatolar bormi?
- Network tab'da API so'rovlar muvaffaqiyatli bo'lganmi?

---

### 2. "Cannot GET /" Xatosi

**Sabab**: Backend frontend build'ni serve qilmayapti.

**Yechim**:
```bash
# Frontend build papkasi mavjudligini tekshiring
ls frontend/build

# Agar yo'q bo'lsa, build qiling
cd frontend
npm run build
```

---

### 3. Login/Register Qilib Bo'lmaydi

**Sabab**: Backend API xatosi yoki MongoDB ulanish muammosi.

**Yechim**:
```bash
# Backend logs'ni tekshiring
# Terminal'da xatolar ko'ringanmi?

# MongoDB ulanishini tekshiring
# Backend console'da "MongoDB connected successfully" ko'ringanmi?

# API endpoint'ni test qiling
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"test@example.com","password":"password123"}'
```

---

### 4. Socket.io Ulanish Muammosi

**Sabab**: Frontend va backend Socket.io URL'lari mos kelmayapti.

**Yechim**:
```bash
# Frontend .env'ni tekshiring
cat frontend/.env

# Quyidagi bo'lishi kerak:
# REACT_APP_SOCKET_URL=http://localhost:5000

# Backend server.js'da CORS sozlamalarini tekshiring
# FRONTEND_URL=http://localhost:3000
```

**Browser Console'da Tekshirish**:
```javascript
// Browser console'da yozing
console.log(process.env.REACT_APP_SOCKET_URL)
```

---

### 5. "Port Already in Use" Xatosi

**Sabab**: Port 5000 yoki 3000 allaqachon ishlatilgan.

**Yechim**:

#### Windows:
```bash
# Port 5000'da qaysi process ishlab turganini topish
netstat -ano | findstr :5000

# Process'ni to'xtating (PID bilan)
taskkill /PID <PID> /F

# Yoki port'ni o'zgartiring
# backend/.env'da PORT=5001 qiling
```

#### macOS/Linux:
```bash
# Port 5000'da qaysi process ishlab turganini topish
lsof -i :5000

# Process'ni to'xtating
kill -9 <PID>
```

---

### 6. npm install Xatosi

**Sabab**: npm cache corrupted yoki network muammosi.

**Yechim**:
```bash
# npm cache'ni tozalash
npm cache clean --force

# node_modules'ni o'chirish
rm -rf node_modules package-lock.json

# Qayta o'rnatish
npm install
```

---

### 7. Frontend Build Xatosi

**Sabab**: Dependency muammosi yoki syntax xatosi.

**Yechim**:
```bash
cd frontend

# Cache'ni tozalash
npm cache clean --force

# node_modules'ni o'chirish
rm -rf node_modules package-lock.json

# Qayta o'rnatish
npm install

# Build qilish
npm run build
```

---

### 8. MongoDB Ulanish Xatosi

**Sabab**: MongoDB URI noto'g'ri yoki server ishlamayapti.

**Yechim**:
```bash
# MongoDB URI'ni tekshiring
cat backend/.env | grep MONGODB_URI

# MongoDB Atlas'da:
# 1. Cluster'ni tekshiring
# 2. IP whitelist'ni tekshiring
# 3. Username/password'ni tekshiring

# Local MongoDB:
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

---

### 9. CORS Xatosi

**Sabab**: Frontend va backend CORS sozlamalari mos kelmayapti.

**Yechim**:
```bash
# backend/.env'ni tekshiring
cat backend/.env | grep FRONTEND_URL

# Quyidagi bo'lishi kerak:
# FRONTEND_URL=http://localhost:3000

# Backend server.js'da CORS sozlamalarini tekshiring
# cors({ origin: FRONTEND_URL })
```

---

### 10. Xabar Yuborilmaydi

**Sabab**: Socket.io ulanish muammosi yoki API xatosi.

**Yechim**:
```bash
# Browser console'da tekshiring
# Socket.io connected bo'lganmi?

# Network tab'da POST /api/chat/:chatId/messages
# 200 status code bo'lganmi?

# Backend logs'ni tekshiring
# Xatolar ko'ringanmi?
```

---

## 🔍 Debug Mode

### Backend Debug Qilish

```bash
# Verbose logging bilan ishga tushirish
DEBUG=* npm start

# Yoki NODE_ENV'ni o'zgartirish
NODE_ENV=development npm start
```

### Frontend Debug Qilish

```bash
# Browser DevTools (F12)
# Console tab'da xatolar tekshiring
# Network tab'da API so'rovlarni tekshiring
# Application tab'da localStorage'ni tekshiring
```

---

## 📊 Tekshirish Checklist

Muammoni hal qilishdan oldin quyidagilarni tekshiring:

- [ ] Node.js va npm o'rnatilganmi? (`node -v`, `npm -v`)
- [ ] MongoDB ishlab turganmi?
- [ ] Port 3000 va 5000 bo'sh mi?
- [ ] `.env` fayllar to'g'ri sozlanganmi?
- [ ] `npm install` muvaffaqiyatli bo'ldimi?
- [ ] Frontend build qilinganmi? (`frontend/build` papkasi mavjudmi?)
- [ ] Backend logs'da xatolar bormi?
- [ ] Browser console'da xatolar bormi?
- [ ] Network tab'da API so'rovlar muvaffaqiyatli bo'lganmi?

---

## 🆘 Hali Ham Muammoni Hal Qila Olmadim

1. **GitHub Issues'da qidiruv qiling**: Shunga o'xshash muammolar bo'lganmi?
2. **Stack Overflow'da qidiruv qiling**: Texnik muammolar uchun
3. **Dokumentatsiyani o'qing**: README.md va SETUP.md
4. **Logs'ni to'liq ko'rib chiqing**: Backend va frontend logs'ni tekshiring
5. **Minimal reproduction yarating**: Muammoni qayta yaratish uchun minimal kod

---

## 📝 Xatoni Report Qilish

GitHub Issues'da xatoni report qilganda quyidagilarni qo'shing:

```markdown
## Muammo Tavsifi
[Muammoni batafsil tavsiflang]

## Qadam-Qadam Qayta Yaratish
1. [Qadam 1]
2. [Qadam 2]
3. [Qadam 3]

## Kutilgan Natija
[Nima bo'lishi kerak edi]

## Haqiqiy Natija
[Nima bo'ldi]

## Environment
- OS: [Windows/macOS/Linux]
- Node.js: [versiya]
- npm: [versiya]
- Browser: [brauzer va versiya]

## Logs
[Backend va frontend logs'ni qo'shing]
```

---

**Eslatma**: Muammoni hal qilishda sabr qiling. Ko'p vaqt logs'ni diqqat bilan o'qish muammoni hal qiladi!
