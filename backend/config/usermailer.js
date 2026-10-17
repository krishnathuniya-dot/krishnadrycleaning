  const nodemailer = require("nodemailer");

// =====================================================
// CREATE TRANSPORTER
// =====================================================
  
const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

// =====================================================
// VERIFY MAIL CONNECTION
// =====================================================

transporter.verify((error, success) => {
  if (error) {
    console.log(
      "Mailer Connection Error:",
      error.message
    );
  } else {
    console.log(
      "Mailer is ready to send emails."
    );
  }
});

// =====================================================
// SEND WELCOME EMAIL
// =====================================================

const sendWelcomeEmail = async ({
  email,
  name,
}) => {
  const mailOptions = {
    from: `"Krishna Dry Cleaning" <${process.env.MAIL_USER}>`,

    to: email,

    subject:
      "Welcome to Krishna Dry Cleaning",

    html: `
      <div style="
        margin:0;
        padding:30px 15px;
        background:#f5f7fb;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <div style="
          max-width:600px;
          margin:auto;
          background:#ffffff;
          border-radius:14px;
          overflow:hidden;
          box-shadow:0 5px 20px rgba(0,0,0,0.08);
        ">

          <div style="
            background:#111827;
            padding:28px 20px;
            text-align:center;
          ">

            <h1 style="
              margin:0;
              color:#ffffff;
              font-size:26px;
            ">
              KRISHNA DRY CLEANING
            </h1>

            <p style="
              margin:8px 0 0;
              color:#d1d5db;
              font-size:14px;
            ">
              Premium care for your clothes.
            </p>

          </div>

          <div style="
            padding:35px 30px;
            color:#1f2937;
          ">

            <h2 style="
              margin-top:0;
              color:#111827;
            ">
              Welcome, ${name}!
            </h2>

            <p style="
              font-size:16px;
              line-height:1.7;
            ">
              Thank you for creating your account
              with <strong>Krishna Dry Cleaning</strong>.
            </p>

            <p style="
              font-size:16px;
              line-height:1.7;
            ">
              Your account has been successfully
              created and you can now enjoy our
              services.
            </p>

            <div style="
              margin:25px 0;
              padding:18px;
              background:#f3f4f6;
              border-radius:10px;
              text-align:center;
            ">

              <strong style="
                font-size:18px;
                color:#111827;
              ">
                Your account is ready!
              </strong>

              <p style="
                margin:8px 0 0;
                color:#6b7280;
                font-size:14px;
              ">
                Thank you for choosing Krishna Dry Cleaning.
              </p>

            </div>

            <p style="
              font-size:15px;
              line-height:1.7;
              color:#4b5563;
            ">
              We look forward to providing you
              with premium care for your clothes.
            </p>

          </div>

          <div style="
            padding:20px;
            background:#f9fafb;
            text-align:center;
            border-top:1px solid #e5e7eb;
          ">

            <p style="
              margin:0;
              color:#6b7280;
              font-size:13px;
            ">
              © ${new Date().getFullYear()}
              Krishna Dry Cleaning.
              All rights reserved.
            </p>

          </div>

        </div>

      </div>
    `,
  };

  return await transporter.sendMail(
    mailOptions
  );
};

// =====================================================
// SEND PASSWORD CHANGED EMAIL
// =====================================================

const sendPasswordChangedEmail = async ({
  email,
  name,
}) => {
  const mailOptions = {
    from: `"Krishna Dry Cleaning" <${process.env.MAIL_USER}>`,

    to: email,

    subject:
      "Your Password Has Been Changed",

    html: `
      <div style="
        margin:0;
        padding:30px 15px;
        background:#f5f7fb;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <div style="
          max-width:600px;
          margin:auto;
          background:#ffffff;
          border-radius:14px;
          overflow:hidden;
          box-shadow:0 5px 20px rgba(0,0,0,0.08);
        ">

          <div style="
            background:#111827;
            padding:25px;
            text-align:center;
          ">

            <h1 style="
              margin:0;
              color:#ffffff;
              font-size:24px;
            ">
              KRISHNA DRY CLEANING
            </h1>

          </div>

          <div style="
            padding:35px 30px;
            color:#1f2937;
          ">

            <h2 style="
              margin-top:0;
              color:#111827;
            ">
              Hello ${name},
            </h2>

            <p style="
              font-size:16px;
              line-height:1.7;
            ">
              Your password has been
              <strong>changed successfully.</strong>
            </p>

            <div style="
              margin:25px 0;
              padding:18px;
              background:#f3f4f6;
              border-radius:10px;
              text-align:center;
            ">

              <strong style="
                color:#111827;
                font-size:17px;
              ">
                Password Changed Successfully
              </strong>

            </div>

            <p style="
              font-size:14px;
              color:#6b7280;
              line-height:1.6;
            ">
              This is a confirmation that your
              Krishna Dry Cleaning account password
              has been updated.
            </p>

          </div>

          <div style="
            padding:20px;
            background:#f9fafb;
            text-align:center;
            border-top:1px solid #e5e7eb;
          ">

            <p style="
              margin:0;
              color:#6b7280;
              font-size:13px;
            ">
              © ${new Date().getFullYear()}
              Krishna Dry Cleaning.
              All rights reserved.
            </p>

          </div>

        </div>

      </div>
    `,
  };

  return await transporter.sendMail(
    mailOptions
  );
};

// =====================================================
// SEND RESET PASSWORD EMAIL
// =====================================================

const sendResetPasswordEmail = async ({
  email,
  name,
  resetUrl,
}) => {
  const mailOptions = {
    from: `"Krishna Dry Cleaning" <${process.env.MAIL_USER}>`,

    to: email,

    subject:
      "Reset Your Krishna Dry Cleaning Password",

    html: `
      <div style="
        margin:0;
        padding:30px 15px;
        background:#f5f7fb;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <div style="
          max-width:600px;
          margin:auto;
          background:#ffffff;
          border-radius:14px;
          overflow:hidden;
          box-shadow:0 5px 20px rgba(0,0,0,0.08);
        ">

          <div style="
            background:#111827;
            padding:25px;
            text-align:center;
          ">

            <h1 style="
              margin:0;
              color:#ffffff;
              font-size:24px;
            ">
              KRISHNA DRY CLEANING
            </h1>

          </div>

          <div style="
            padding:35px 30px;
            color:#1f2937;
          ">

            <h2 style="
              margin-top:0;
            ">
              Hello ${name || "User"},
            </h2>

            <p style="
              font-size:16px;
              line-height:1.7;
            ">
              We received a request to reset
              your account password.
            </p>

            <div style="
              text-align:center;
              margin:30px 0;
            ">

              <a
                href="${resetUrl}"
                style="
                  display:inline-block;
                  padding:14px 25px;
                  background:#111827;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:bold;
                "
              >
                Reset Password
              </a>

            </div>

            <p style="
              font-size:14px;
              color:#6b7280;
              line-height:1.6;
            ">
              This password reset link will expire
              in 15 minutes.
            </p>

          </div>

          <div style="
            padding:20px;
            background:#f9fafb;
            text-align:center;
            border-top:1px solid #e5e7eb;
          ">

            <p style="
              margin:0;
              color:#6b7280;
              font-size:13px;
            ">
              © ${new Date().getFullYear()}
              Krishna Dry Cleaning.
              All rights reserved.
            </p>

          </div>

        </div>

      </div>
    `,
  };

  return await transporter.sendMail(
    mailOptions
  );
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendResetPasswordEmail,
};