const nodemailer = require("nodemailer");

module.exports = function (RED) {
    function MailNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            emails = msg.emails;

            var transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            // var transport = nodemailer.createTransport({
            //     host: "live.smtp.mailtrap.io",
            //     port: 587,
            //     auth: {
            //       user: "api",
            //       pass: process.env.MAILTRAP_PASS
            //     }
            // });

            const mailOptions = {
                from: "info@demomailtrap.com",
                to: emails,
                subject: "Alert message",
                text: msg.messageForUser,
            };

            transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log("Error:", error);
                } else {
                    console.log("Email sent:", info.response);
                }
            });
        });
    }

    RED.nodes.registerType("mail", MailNode);
};
