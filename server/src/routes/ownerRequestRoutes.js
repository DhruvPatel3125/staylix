const express = require('express');

const router = express.Router();
const {
    createRequest,
    getAllRequests,
    approveRequest,
    rejectRequest,
} = require("../controllers/ownerRequestController");

const {protect,admin} = require('../middlewares/authMiddleWare');

router.post("/",protect,createRequest);
router.get("/",protect,admin,getAllRequests);
router.put("/approve/:id",protect,admin,approveRequest);
router.put("/reject/:id",protect,admin,rejectRequest);

module.exports = router;