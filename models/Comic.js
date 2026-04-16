const mongoose = require('mongoose');

const ComicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Completed', 'Reading', 'Stalled', 'Dropped', 'Want to Read'],
        required: [true, 'Please add a status']
    },
    releaseDays: {
        type: [String], 
        // ไม่ใส่ required: true เพื่อรองรับกรณีที่การ์ตูนจบแล้ว หรือคนจำวันไม่ได้
        default: [] 
    },
    platform: {
        type: String,
        trim: true
    },
    volume: {
        type: Number,
        default: 0,
        min: [0, 'Volume must not be negative number']
    },
    chapter: {
        type: Number,
        default: 0,
        min: [0, 'Chapter must not be negative number']
    },
    resumeDate: { // วันที่จะกลับมาอ่าน (สำหรับสถานะ Stalled)
        type: Date,
        default: null // null แปลว่ายังไม่มีกำหนดการ
    },
    rating: {
        type: Number,
        min: 0,
        max: 10
    },
    note: {
        type: String,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: '#ef4444' // ค่าเริ่มต้นเป็นสีแดง
    },
    dayOrder: {
        type: Number,
        default: 99 // 99 คือค่าเริ่มต้นสำหรับเรื่องที่ไม่มีวันอัปเดต จะได้ไปอยู่ท้ายสุด
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    // จะได้ทั้ง createdAt และ updatedAt เอาไว้ sort ข้อมูลใน Dashboard ได้ง่ายๆ
    timestamps: true
});

module.exports = mongoose.model('Comic', ComicSchema);