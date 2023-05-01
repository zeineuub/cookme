const path = require('path');
const util = require('util');
const Email = require('email-templates');
const nodemailer = require('nodemailer');
const i18n = require('../../core/services/i18n');


module.exports.sendMail = async (mailOptions) => {
    if (
      !process.env.SMTP_HOST
      || !process.env.SMTP_PORT
      || !process.env.SMTP_SECURE
      || !process.env.SMTP_AUTH_USER
      || !process.env.SMTP_AUTH_PASS
    ) {
      return;
    }
  
    // Create a SMTP transporter object
    const transporter = nodemailer.createTransport(
      {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        auth: {
          user: process.env.SMTP_AUTH_USER,
          pass: process.env.SMTP_AUTH_PASS,
        },
        // logger: true,
        // debug: false // include SMTP traffic in the logs
      },
      {
        from: process.env.EMAIL_SENDER,
      },
    );
  
    // eslint-disable-next-line no-unused-vars
    const result = await transporter.sendMail(mailOptions);
  
    // console.log(result);
    // only needed when using pooled connections
    transporter.close();
};

module.exports.sendResetCode = async (to, { firstName, lastName, code }) => {
    const templateDir = path.join(__dirname, '../../../', 'emails');
    const config = {
      views: {
        root: templateDir,
        options: {
          extension: 'ejs',
        },
      },
    };
    const mailTemplate = new Email(config);
  
    const locals = {
      name: firstName,
      code,
    };
  
    await mailTemplate.render(`reset/html_${process.env.APP_NAME}`, locals)
      .then((html) => {
        // Message object
        const mailOptions = {
          // Comma separated list of recipients
          to,
          // Subject of the message
          subject: 'Réinitialisation de mot de passe',
          // plaintext body
          text: `Hi ${firstName} ${lastName}! You have asked for a password reinitialisation: `,
          // HTML body
          html,
        };
        this.sendMail(mailOptions);
      })
      // eslint-disable-next-line no-console
      .catch(console.error);
  };