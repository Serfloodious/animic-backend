const Comic = require('../models/Comic');

//@desc     Get all comics
//@route    GET /api/v1/comics
//@access   Public
exports.getComics = async (req, res, next) => {
    try {
        const comics = await Comic.find();
        res.status(200).json({
            success: true,
            count: comics.length,
            data: comics
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

//@desc     Get one comic
//@route    GET /api/v1/comics/:id
//@access   Public
exports.getComic = async (req, res, next) => {
    try {
        const comic = await Comic.findById(req.params.id);

        if (!comic) {
            return res.status(404).json({
                success: false,
                error: 'Comic not found'
            });
        }

        res.status(200).json({
            success: true,
            data: comic
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

//@desc     Create new comic
//@route    POST /api/v1/comics
//@access   Public
exports.createComic = async (req, res, next) => {
    const comic = await Comic.create(req.body);
    res.status(201).json({
        success: true,
        data: comic
    });
}

//@desc     Update comic
//@route    PUT /api/v1/comics/:id
//@access   Public
exports.updateComic = async (req, res, next) => {
    try {
        const comic = await Comic.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!comic) {
            return res.status(404).json({
                success: false,
                error: 'Comic not found'
            });
        }

        res.status(200).json({
            success: true,
            data: comic
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

//@desc     Delete comic
//@route    DELETE /api/v1/comics/:id
//@access   Public
exports.deleteComic = async (req, res, next) => {
    try {
        const comic = await Comic.findByIdAndDelete(req.params.id);

        if (!comic) {
            return res.status(404).json({
                success: false,
                error: 'Comic not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}
