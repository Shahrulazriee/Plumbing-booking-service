const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "ea51f7fe538873",
		pass: "1c610a23bf38ca",
	},
});

message = {
	from: "from-example@email.com",
	to: "to-example@email.com",
	subject: "Subject",
	text: "Hello SMTP Email,",
};

transporter.sendMail(message, function (err, info) {
	if (err) {
		console.log(err);
	} else {
		console.log(info);
	}
});
