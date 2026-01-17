# 🚀 Tez Boshlash (Quick Start)

## 1️⃣ Loyihani Klonlash
```bash
git clone <repository-url>
cd telegram-clone
```

## 2️⃣ Paketlarni O'rnatish
```bash
npm run install-all
```

## 3️⃣ Development Mode'da Ishga Tushirish

### Windows:
```bash
start_dev.bat
```

### macOS/Linux:
```bash
npm run dev
```

## 4️⃣ Brauzerda Ochish
```
http://localhost:3000
```

## 5️⃣ Test Qilish

### Ro'yxatdan O'tish:
- **Username**: testuser
- **Email**: test@example.com
- **Phone**: +998901234567
- **Password**: password123

### Ikkinchi Foydalanuvchi:
- **Username**: testuser2
- **Email**: test2@example.com
- **Phone**: +998901234568
- **Password**: password123

## ✅ Tekshirish Checklist

- [ ] Frontend port 3000'da ishlab turganmi?
- [ ] Backend port 5000'da ishlab turganmi?
- [ ] MongoDB ulanganmi?
- [ ] Ro'yxatdan o'tish muvaffaqiyatli bo'ldimi?
- [ ] Login qila olganmi?
- [ ] Foydalanuvchi qidira olganmi?
- [ ] Chat boshlaya olganmi?
- [ ] Xabar yubora olganmi?

## 🔧 Muammolar

### Port Allaqachon Ishlatilgan
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Ulanish Muammosi
- MongoDB serveringiz ishlab turganiga ishonch hosil qiling
- Connection string'ni tekshiring

### npm install Xatosi
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 Qo'shimcha Dokumentatsiya

- [SETUP.md](SETUP.md) - Batafsil setup ko'rsatmalari
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Muammolarni hal qilish
- [README.md](README.md) - Loyiha haqida

## 🎯 Keyingi Qadamlar

1. Profil tahrirlash
2. Foydalanuvchilarni qidiruv
3. Xabar yuborish
4. Online status'ni tekshirish
5. Typing indicator'ni tekshirish

---

**Eslatma**: Birinchi marta ishga tushirganda frontend build qilish 2-3 daqiqa vaqt olishi mumkin.
