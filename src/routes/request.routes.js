const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const {
    createRequest,
    getUserRequests,
    updateRequest,
    deleteRequest,
    getAllRequests
} = require("../controllers/request.controller");

// Защищённые роуты

router.get("/all", protect, roleMiddleware(["admin"]), getAllRequests); 

router.get("/", protect, getUserRequests); 



router.put("/:id", protect, updateRequest);

// Только администратор может удалять заявки
router.delete("/:id", protect, roleMiddleware(["admin"]), deleteRequest);

// Обычные пользователи могут создавать заявки
router.post("/", protect, createRequest);

module.exports = router;
