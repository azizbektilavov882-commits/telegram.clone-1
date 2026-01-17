# 🚀 Telegram Clone - Yangi Funksiyalar Yo'l Xaritasi

## ✅ HOZIRGI HOLAT
- User authentication (login/register)
- Real-time messaging
- User search
- Chat creation
- Online/offline status
- Typing indicator
- User profile
- Chat list

---

## 🎯 QO'SHILISHI KERAK BO'LGAN FUNKSIYALAR

### 1️⃣ XABAR TAHRIRLASH VA O'CHIRISH

**Backend Changes:**
```javascript
// backend/models/Chat.js - messageSchema'ga qo'shish
isEdited: { type: Boolean, default: false },
editedAt: Date,
deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

// backend/routes/chat.js - yangi route'lar
PUT /api/chat/:chatId/messages/:messageId - xabarni tahrirlash
DELETE /api/chat/:chatId/messages/:messageId - xabarni o'chirish
```

**Frontend Changes:**
```javascript
// Message.js - edit/delete tugmalari
- Right-click menu yoki hover'da tugmalar
- Edit modal/inline editing
- Delete confirmation

// Socket events
socket.emit('editMessage', { chatId, messageId, newText })
socket.emit('deleteMessage', { chatId, messageId })
```

---

### 2️⃣ RASM YUBORISH

**Backend:**
```javascript
// Multer setup for file upload
npm install multer

// backend/routes/chat.js
POST /api/chat/:chatId/upload - rasm yuklash
- Multer middleware
- File validation (size, type)
- Save to /uploads/images/
- Return file URL

// messageType: 'image'
```

**Frontend:**
```javascript
// MessageInput.js
- File input button
- Image preview before send
- Upload progress
- Thumbnail generation

// Message.js
- Image display
- Lightbox/modal for full view
- Download button
```

---

### 3️⃣ EMOJI PICKER

**Installation:**
```bash
npm install emoji-picker-react
```

**Frontend:**
```javascript
// MessageInput.js
import EmojiPicker from 'emoji-picker-react';

- Emoji button
- Popup picker
- Insert emoji to text
- Recent emojis
```

---

### 4️⃣ XABARGA REPLY

**Backend:**
```javascript
// messageSchema
replyTo: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Message'
}
```

**Frontend:**
```javascript
// Message.js
- Reply button
- Show replied message

// MessageInput.js
- Reply preview
- Cancel reply button
- Send with replyTo field
```

---

### 5️⃣ READ RECEIPTS

**Backend:**
```javascript
// messageSchema
readBy: [{
  user: { type: ObjectId, ref: 'User' },
  readAt: Date
}]

// Socket event
socket.on('markAsRead', { chatId, messageId })
```

**Frontend:**
```javascript
// Message.js
- Single check (sent)
- Double check (delivered)
- Blue double check (read)

// Auto mark as read when visible
- Intersection Observer API
```

---

### 6️⃣ GURUH CHATLARI

**Backend:**
```javascript
// chatSchema - already exists
isGroup: Boolean,
groupName: String,
groupAvatar: String,
groupAdmin: ObjectId,
groupMembers: [{ user, role, joinedAt }]

// New routes
POST /api/chat/group - create group
PUT /api/chat/:chatId/group - update group
POST /api/chat/:chatId/members - add member
DELETE /api/chat/:chatId/members/:userId - remove member
```

**Frontend:**
```javascript
// CreateGroup.js - yangi komponent
- Group name input
- Select members
- Set group avatar

// GroupInfo.js
- Member list
- Admin controls
- Leave group
```

---

### 7️⃣ FAYL YUBORISH

**Backend:**
```javascript
// Multer for all file types
POST /api/chat/:chatId/upload-file

// File types: PDF, DOC, DOCX, XLS, XLSX, ZIP, etc.
// Max size: 50MB
```

**Frontend:**
```javascript
// MessageInput.js
- File attach button
- File type icons
- Upload progress
- File size display

// Message.js
- File download button
- File info (name, size, type)
```

---

### 8️⃣ XABAR QIDIRUV

**Backend:**
```javascript
// routes/chat.js
GET /api/chat/search?q=query&chatId=xxx

// MongoDB text search
messages: { $elemMatch: { text: { $regex: query, $options: 'i' } } }
```

**Frontend:**
```javascript
// ChatHeader.js
- Search icon
- Search input
- Search results list
- Jump to message
- Highlight matched text
```

---

### 9️⃣ DARK/LIGHT THEME

**Frontend:**
```javascript
// Create ThemeContext
- localStorage for persistence
- CSS variables for colors
- Toggle button in settings

// index.css
:root[data-theme="light"] { ... }
:root[data-theme="dark"] { ... }
```

---

### 🔟 PINNED MESSAGES

**Backend:**
```javascript
// chatSchema
pinnedMessages: [{
  message: { type: ObjectId },
  pinnedBy: { type: ObjectId, ref: 'User' },
  pinnedAt: Date
}]

// routes
POST /api/chat/:chatId/pin/:messageId
DELETE /api/chat/:chatId/unpin/:messageId
```

**Frontend:**
```javascript
// ChatHeader.js
- Pinned message banner
- Click to scroll to message

// Message.js
- Pin button (admin only for groups)
- Unpin button
```

---

## 📦 KERAKLI NPM PACKAGES

```bash
# Backend
npm install multer sharp  # File upload va image processing

# Frontend
npm install emoji-picker-react  # Emoji picker
npm install react-dropzone  # Drag & drop file upload
npm install react-image-lightbox  # Image viewer
npm install react-intersection-observer  # Read receipts
```

---

## 🔄 IMPLEMENTATION ORDER

1. **Xabar tahrirlash/o'chirish** (2-3 soat)
2. **Rasm yuborish** (3-4 soat)
3. **Emoji picker** (1-2 soat)
4. **Reply funksiyasi** (2-3 soat)
5. **Read receipts** (2-3 soat)
6. **Guruh chatlari** (5-6 soat)
7. **Fayl yuborish** (2-3 soat)
8. **Xabar qidiruv** (2-3 soat)
9. **Dark/Light theme** (2-3 soat)
10. **Pinned messages** (2-3 soat)

**Jami:** ~25-35 soat

---

## 🚀 QAYSI BIRINI BIRINCHI QILISHNI XOHLAYSIZ?

Men tavsiya qilaman ketma-ketlikda qilishni:
1. Emoji picker (eng oson)
2. Xabar tahrirlash/o'chirish
3. Rasm yuborish
4. Reply
5. Read receipts
6. Qolganlar...

**Qaysi birini boshlaymiz?** 🎯
