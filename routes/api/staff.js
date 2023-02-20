var express = require("express");
var bcrypt = require("bcryptjs");
let alert = require("alert");

const { default: mongoose } = require("mongoose");
var { StaffInfo } = require("../../models/staff_info");
const { append } = require("express/lib/response");
let { session } = require("passport");

var router = express.Router();

//TODO:: add in error and info

router.post("/login", function (req, res, next) {
	StaffInfo.findOne({ email: req.body.email }, function (err, data) {
		if (data) {
			bcrypt
				.compare(req.body.password, data.password)
				.then((doMatch) => {
					if (doMatch) {
						req.session.email = data.email;
						session = req.session;
						console.log(session);
						res.render("staff/home");
					} else {
						alert("Wrong password input");
					}
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			alert("Email and Password does not matched");
		}
	});
});

module.exports = router;
