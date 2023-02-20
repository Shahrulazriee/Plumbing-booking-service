const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "ea51f7fe538873",
		pass: "1c610a23bf38ca",
	},
});
module.exports = transporter;