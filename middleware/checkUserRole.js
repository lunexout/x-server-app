const checkRole = (roles) => (req, res, next) => {
  !roles.includes(req.user.role)
    ? res.json({ success: false, msg: "გაიარეთ ავტორიზაცია" })
    : next();
};
const checkAdminPermissions = (permissions) => (req, res, next) => {
  !req.user.permissions.includes(permissions)
    ? res.json({ success: false, msg: "თქვენ არ გაქვთ წვდომა" })
    : next();
};

module.exports = {
  checkRole,
  checkAdminPermissions,
};
