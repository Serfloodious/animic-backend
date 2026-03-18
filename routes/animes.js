const express = require('express');
const {getAnimes, getAnime, addAnime, updateAnime, deleteAnime} = require('../controllers/animes');

const router = express.Router({mergeParams: true});

const {protect} = require('../middleware/auth');

router.route('/')
    .get(protect, getAnimes)
    .post(protect, addAnime);
router.route('/:id')
    .get(protect, getAnime)
    .put(protect, updateAnime)
    .delete(protect, deleteAnime);

module.exports = router;