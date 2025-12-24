const express = require('express');

const router = express.Router();
const {
    createRequest,
    getAllRequests,
    approveRequest,
    rejectRequest,
} = require("../controllers/ownerRequestController");

const {protect,admin} = require('../middlewares/authMiddleWare');
const upload = require('../middlewares/uploadMiddleware');

router.post("/",protect,upload.single('document'),createRequest);
router.get("/",protect,getAllRequests);
router.put("/approve/:id",protect,admin,approveRequest);
router.put("/reject/:id",protect,admin,rejectRequest);

module.exports = router;