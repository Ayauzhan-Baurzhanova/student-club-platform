const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // false для порта 587
            auth: {
                user: 'stacy.metz15@ethereal.email', // Твой email
                pass: '6dy31HjpvD69R42tZr' // Твой пароль
            }
        });

        const mailOptions = {
            from: 'stacy.metz15@ethereal.email', // Отправитель — твой ethereal email
            to, // Получатель
            subject, // Тема письма
            text, // Текст письма
        };

        console.log("Sending email...");
        await transporter.sendMail(mailOptions); // Отправка письма
        console.log("Email sent successfully");
    } catch (err) {
        console.error("Error sending email:", err); // Логирование ошибок
    }
};

module.exports = sendEmail;
