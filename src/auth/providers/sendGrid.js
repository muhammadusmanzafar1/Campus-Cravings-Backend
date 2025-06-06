
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendMail = (toEmail, message) => {
    if (!toEmail) {
        return Promise.reject("to email is required");
    }
    if (!message) {
        return Promise.reject("message is required");
    }
    if (!message.body) {
        return Promise.reject("message.body is required");
    }
    try {
        const msg = {
            to: toEmail,
            from: 'muhammadusmanzafar111@gmail.com',
            subject: message.subject || "",
            html: message.body,
        }
        sgMail
            .send(msg)
            .then(() => {
                console.log("Email sent");
            })
            .catch((error) => {
                console.error(error);
            });
    } catch (error) {
        throw error;
    }
};
