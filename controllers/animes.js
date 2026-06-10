const Anime = require('../models/Anime');

const calculateDayOrder = (daysArray) => {
    if (!daysArray || daysArray.length === 0) return 99; // ไม่มีวัน
    
    const dayMap = { 
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
        'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 
    };
    
    let minOrder = 99;
    daysArray.forEach(day => {
        if (dayMap[day]) {
            minOrder = Math.min(minOrder, dayMap[day]); // เอาวันที่น้อยที่สุด
        } else {
            minOrder = Math.min(minOrder, 8); // ถ้าเป็นคำอื่นๆ (Others) ให้ค่าเป็น 8
        }
    });
    return minOrder;
};

// @desc     Get all animes
// @route    GET /api/v1/animes
// @access   Public
exports.getAnimes = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = {...req.query};

        let isNoneFilter = false;

        // จัดการ Filter "Others"
        if (reqQuery.releaseDays === 'Others') {
            const standardDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            
            // สั่งให้ Mongo หา Array ที่ "มีอย่างน้อย 1 ค่าที่ไม่ใช่วันมาตรฐาน"
            reqQuery.releaseDays = { $elemMatch: { $nin: standardDays } };
        } else if (reqQuery.releaseDays === 'None') {
            delete reqQuery.releaseDays;
            isNoneFilter = true;
        }

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'title', 'platform', 'status'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);
        console.log(reqQuery);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        let finalQueryObject = JSON.parse(queryStr);

        if (isNoneFilter) {
            finalQueryObject.$or = [
                { releaseDays: { $exists: false } },
                { releaseDays: { $size: 0 } },
                { releaseDays: null }
            ];
        }

        // Handle title and platform search
        if (req.query.title && req.query.title.trim() !== '') {
            finalQueryObject.title = { $regex: req.query.title, $options: 'i' };
        }

        if (req.query.platform && req.query.platform.trim() !== '') {
            finalQueryObject.platform = { $regex: req.query.platform, $options: 'i' };
        }

        if (req.query.status && req.query.status.trim() !== '') {
            const statusArray = req.query.status.split(',');
            finalQueryObject.status = { $in: statusArray };
        }

        // Finding resource
        query = Anime.find(finalQueryObject);

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Anime.countDocuments(finalQueryObject);

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const animes = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: animes.length,
            pagination,
            data: animes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false, 
            message: 'Cannot find Animes'
        });
    }
}

// @desc     Get one anime
// @route    GET /api/v1/animes/:id
// @access   Public
exports.getAnime = async (req, res, next) => {
    try {
        const anime = await Anime.findById(req.params.id);

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: `No anime with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: anime
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Cannot find Anime'
        });
    }
}

// @desc     Add one anime
// @route    POST /api/v1/animes
// @access   Private
exports.addAnime = async (req, res, next) => {
    try {
        // add user Id to req.body
        req.body.user = req.user.id;

        req.body.dayOrder = calculateDayOrder(req.body.releaseDays);

        const anime = await Anime.create(req.body);

        res.status(201).json({
            success: true,
            data: anime
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This Title already exists'
            });
        }

        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Cannot create Anime'
        });
    }
}

// @desc     Update one anime
// @route    PUT /api/v1/animes/:id
// @access   Private
exports.updateAnime = async (req, res, next) => {
    try {
        let anime = await Anime.findById(req.params.id);

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: `No anime with the id of ${req.params.id}`
            });
        }

        req.body.dayOrder = calculateDayOrder(req.body.releaseDays);

        if ((req.body.status === 'Watching' || req.body.status === 'Completed') && anime.resumeDate) {
            req.body.resumeDate = null;
        }

        // Make sure user is anime owner
        if (anime.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this anime`
            });
        }

        anime = await Anime.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: anime
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This Title already exists'
            });
        }
        
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Cannot update Anime'
        });
    }
}

// @desc     Delete one anime
// @route    DELETE /api/v1/animes/:id
// @access   Private
exports.deleteAnime = async (req, res, next) => {
    try {
        const anime = await Anime.findById(req.params.id);

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: `No anime with the id of ${req.params.id}`
            });
        }

        // Make sure user is anime owner
        if (anime.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this anime`
            });
        }

        await anime.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Cannot delete Anime'
        });
    }
}
