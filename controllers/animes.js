const Anime = require('../models/Anime');

//@desc     Get all animes
//@route    GET /api/v1/animes
//@access   Public
exports.getAnimes = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = {...req.query};

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);
        console.log(reqQuery);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Anime.find(JSON.parse(queryStr))

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
        const total = await Anime.countDocuments();

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

//@desc     Get one anime
//@route    GET /api/v1/animes/:id
//@access   Public
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

//@desc     Add one anime
//@route    POST /api/v1/animes
//@access   Private
exports.addAnime = async (req, res, next) => {
    try {
        // add user Id to req.body
        req.body.user = req.user.id;

        const anime = await Anime.create(req.body);

        res.status(201).json({
            success: true,
            data: anime
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Cannot create Anime'
        });
    }
}

//@desc     Update one anime
//@route    PUT /api/v1/animes/:id
//@access   Private
exports.updateAnime = async (req, res, next) => {
    try {
        let anime = await Anime.findById(req.params.id);

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: `No anime with the id of ${req.params.id}`
            });
        }

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
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Cannot update Anime'
        });
    }
}

//@desc     Delete one anime
//@route    DELETE /api/v1/animes/:id
//@access   Private
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
