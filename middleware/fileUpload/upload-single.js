const multer = require("multer");

module.exports = function (fieldName, storage, fileFilter, limits) {
  //   console.log(fieldName);
  const upload = multer({ storage, fileFilter, limits }).array(fieldName);
  //   const uploadArray = multer({})

  return function (req, res, next) {
    upload(req, res, (err) => {
      console.log(err);
      if (err) return res.status(400).send(err.message);
      next();
    });
  };
};
