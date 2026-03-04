//@desc     Get all comics
//@route    GET /api/v1/comics
//@access   Public
exports.getComics = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: 'Show all comics'
    });
}

//@desc     Get one comic
//@route    GET /api/v1/comics/:id
//@access   Public
exports.getComic = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `Show comic with id ${req.params.id}`
    });
}

//@desc     Create new comic
//@route    POST /api/v1/comics
//@access   Public
exports.createComic = (req, res, next) => {
    res.status(201).json({
        success: true,
        msg: 'Create new comic'
    });
}

//@desc     Update comic
//@route    PUT /api/v1/comics/:id
//@access   Public
exports.updateComic = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `Update comic with id ${req.params.id}`
    });
}

//@desc     Delete comic
//@route    DELETE /api/v1/comics/:id
//@access   Public
exports.deleteComic = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `Delete comic with id ${req.params.id}`
    });
}
