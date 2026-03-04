const express = require('express');
const {getComics, getComic, createComic, updateComic, deleteComic} = require('../controllers/comics');

const router = express.Router();

router.route('/')
    .get(getComics)
    .post(createComic);
router.route('/:id')
    .get(getComic)
    .put(updateComic)
    .delete(deleteComic);

module.exports = router;