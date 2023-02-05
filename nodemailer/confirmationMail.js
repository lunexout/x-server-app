const authNodemailer = require("./../config/mail.json");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const env = require("./../env.json");
module.exports = (response) => {
  const userID = response._id;
  const access_token = jwt.sign(
    {
      _id: userID,
    },
    env.ACCESS_TOKEN,
    {
      expiresIn: "1h",
    }
  );
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: authNodemailer.login,
      pass: authNodemailer.password,
    },
  });
  let email = `${response.mail}`; // authNodemailer.mailTO
  console.log(response.mail, "Confirmation with mail!");
  let mailOptions = {
    from: ``,
    to: `${email}`,
    subject: ``,
    html: `
          <h1>ვერიფიკაცია</h1>
          <p>>ვერიფიკაციისთვის დააკლიკეთ ღილაკს ვერიფიკაცია</p>
          <button><a href="http://192.168.100.44:3000/confirmation/${access_token}">ვერიფიკაცია</a></button>
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
