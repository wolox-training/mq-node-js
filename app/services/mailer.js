'use strict';

const nodemailer = require('nodemailer'),
  logger = require('../logger');

exports.welcomeUser = user =>
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'youremail@address.com',
      pass: 'yourpassword'
    }
  }); */

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: account.user, // generated ethereal user
        pass: account.pass // generated ethereal password
      }
    });

    // setup email data with unicode symbols
    const mailOptions = {
      from: '"Training Wolox" <training@wolox.com.ar>', // sender address
      to: user.email, // list of receivers
      subject: `Welcome ${user.firstName}!`, // Subject line
      text: `Welcome ${user.lastName}, ${user.firstName}!` // plain text body
    };

    // send mail with defined transport object
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) return logger.error(error);

      logger.info('Welcomed user by email: %s', nodemailer.getTestMessageUrl(info));
    });
  });
