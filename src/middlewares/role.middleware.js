const roleMiddleware = (roles) => {
    return (req, res, next) => {
        // Логируем роль пользователя для отладки
        console.log("User role:", req.user.role);

        // Проверяем, есть ли роль пользователя в списке разрешённых ролей
        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error("Access forbidden: insufficient permissions");
        }

        next();
    };
};

module.exports = { roleMiddleware };
