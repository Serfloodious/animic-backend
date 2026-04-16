const e = require('express');
const mongoose = require('mongoose');

const AnimeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Completed', 'Watching', 'Stalled', 'Dropped', 'Want to Watch'],
        required: [true, 'Please add a status']
    },
    releaseDays: {
        type: [String],
        // ไม่ใส่ required: true เพื่อรองรับกรณีที่อนิเมะจบแล้ว หรือคนจำวันไม่ได้
        default: []
    },
    platform: {
        type: String,
        trim: true
    },
    episode: {
        type: Number,
        default: 0,
        min: [0, 'Episode must not be negative number']
    },
    resumeDate: { // วันที่จะกลับมาดู (สำหรับสถานะ Stalled)
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
    isWatched: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: '#ef4444' // ค่าเริ่มต้นเป็นสีแดง
    },
    dayOrder: { 
        type: Number, 
        default: 99 
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

module.exports = mongoose.model('Anime', AnimeSchema);