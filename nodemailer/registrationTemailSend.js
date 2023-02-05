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
  console.log(response.mail, "Mail Verification!");
  let email = `${"tarieladze99@gmail.com"}`; // authNodemailer.mailTO
  let mailOptions = {
    from: ``,
    to: `${response.mail}`,
    subject: ``,
    html: `
          <h1>თქვენს პლათფორმაზე დარეგისტრირდა რეპეტიოტრი</h1>
          <p>სახელი გვარი: ${response.firstName} ${response.lastName}</p>
          <p>ელექტრონული ფოსტა: ${response.mail}</p>
          <p>ტელ. ნომერი: ${response.phone}</p>
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
