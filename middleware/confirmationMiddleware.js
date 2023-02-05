const jwt = require("jsonwebtoken");
const env = require("./../env.json");
module.exports = async function (req, res, next) {
  console.log(req.headers.authorization);
  const token = JSON.parse(req.headers.authorization.split(" ")[1]);
  try {
    if (!token) {
      res.json({ msg: "ტოკენი არ არსებობს", success: false });
      next();
    } else {
      const decodedData = jwt.verify(token, env.ACCESS_TOKEN);
      req.user = decodedData;
      console.log(decodedData);
      next();
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "მითითებული მომხმარებელი არ არსებობს", success: false });
  }
};
