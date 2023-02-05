const authNodemailer = require("./../config/mail.json");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const env = require("./../env.json");
module.exports = (response) => {
  const userID = response._id;
  const role = response.role;
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: authNodemailer.login,
      pass: authNodemailer.password,
    },
  });
  const access_token = jwt.sign(
    {
      _id: userID,
      role,
    },
    env.ACCESS_TOKEN,
    {
      expiresIn: "1h",
    }
  );
  let email = `${response.mail}`; // authNodemailer.mailTO
  let mailOptions = {
    from: ``,
    to: `${email}`,
    subject: ``,
    html: `
          <h1>ვერიფიკაცია</h1>
          <p>პაროლის აღსადგენად დააჭირეთ ღილაკ აღდგენა</p>
          <button><a href="http://192.168.0.106:3000/forgot/${access_token}">აღდგენა</a></button>
          `,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("error occurs: ", err);
    } else {
      console.log("email sent");
    }
  });
};
