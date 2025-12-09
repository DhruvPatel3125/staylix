const express = require('express');

const router = express.Router();
const {getDashbordStats} = require('../controllers/adminController');
const {protect,admin} = require('../middlewares/authMiddleWare');

router.get("/stats", protect , admin,getDashbordStats);

module.exports = router;