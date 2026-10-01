const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendResetPasswordEmail = async ({
  email,
  name,
  resetUrl,
}) => {
  const mailOptions = {
    from: `"Krishna Dry Cleaning" <${process.env.SMTP_USER}>`,
    to: email,

    subject: "Reset Your Krishna Dry Cleaning Password",

    text: `
Hello ${name || "Customer"},

We received a request to reset your Krishna Dry Cleaning account password.

Use the following link to create a new password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
Krishna Dry Cleaning
`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Password Reset</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f2eb;
    font-family:Arial,Helvetica,sans-serif;
  "
>

  <div
    style="
      max-width:600px;
      margin:40px auto;
      padding:20px;
    "
  >

    <div
      style="
        background:#ffffff;
        border:1px solid #e6dfd2;
        border-radius:18px;
        overflow:hidden;
      "
    >

      <!-- HEADER -->

      <div
        style="
          background:#202020;
          padding:30px 25px;
          text-align:center;
        "
      >

        <div
          style="
            color:#f2b400;
            font-size:13px;
            font-weight:bold;
            letter-spacing:3px;
            margin-bottom:8px;
          "
        >
          KRISHNA
        </div>

        <div
          style="
            color:#ffffff;
            font-size:24px;
            font-weight:bold;
          "
        >
          DRY CLEANING
        </div>

      </div>


      <!-- CONTENT -->

      <div
        style="
          padding:35px 30px;
          color:#333333;
        "
      >

        <h2
          style="
            margin:0 0 15px;
            font-size:25px;
            color:#222222;
          "
        >
          Reset Your Password
        </h2>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#666666;
          "
        >
          Hello <strong>${name || "Customer"}</strong>,
        </p>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#666666;
          "
        >
          We received a request to reset the password
          for your Krishna Dry Cleaning account.
        </p>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#666666;
          "
        >
          Click the button below to create a new password.
        </p>


        <div
          style="
            text-align:center;
            margin:30px 0;
          "
        >

          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:14px 28px;
              background:#f2b400;
              color:#202020;
              text-decoration:none;
              border-radius:8px;
              font-size:14px;
              font-weight:bold;
            "
          >
            Reset Password →
          </a>

        </div>


        <div
          style="
            padding:15px;
            background:#fff8e5;
            border:1px solid #eed693;
            border-radius:10px;
            color:#765a17;
            font-size:13px;
            line-height:1.6;
          "
        >
          <strong>Important:</strong>
          This password reset link will expire in
          <strong>15 minutes</strong>.
        </div>


        <p
          style="
            margin-top:25px;
            font-size:13px;
            line-height:1.6;
            color:#888888;
          "
        >
          If you did not request a password reset,
          please ignore this email. Your password
          will remain unchanged.
        </p>

      </div>


      <!-- FOOTER -->

      <div
        style="
          padding:20px;
          background:#faf8f3;
          border-top:1px solid #eee8dd;
          text-align:center;
          color:#999999;
          font-size:11px;
        "
      >
        © ${new Date().getFullYear()}
        Krishna Dry Cleaning. All rights reserved.
      </div>

    </div>

  </div>

</body>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  transporter,
  sendResetPasswordEmail,
};