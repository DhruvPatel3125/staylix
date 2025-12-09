const express = require("express");
const router = express.Router();
const {getAllUsers,blockUser} = require("../controllers/adminController")
const {protect,admin} = require("../middlewares/authMiddleWare")

router.get("/",protect,admin,getAllUsers);
router.put("/block/:id",protect,admin,blockUser);

module.exports = router;