const express = require('express');
const {getComics, getComic, createComic, updateComic, deleteComic} = require('../controllers/comics');

const router = express.Router({mergeParams: true});

const {protect} = require('../middleware/auth');

router.route('/')
    .get(protect, getComics)
    .post(protect, createComic);
router.route('/:id')
    .get(protect, getComic)
    .put(protect, updateComic)
    .delete(protect, deleteComic);

module.exports = router;