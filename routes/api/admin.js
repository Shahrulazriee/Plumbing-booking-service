var express = require("express");
var bcrypt = require("bcryptjs");
// var popups = require("popups");
let alert = require("alert");

const { default: mongoose } = require("mongoose");
var { AdminInfo } = require("../../models/admin_info");
var { StaffInfo } = require("../../models/staff_info");
const { append } = require("express/lib/response");
let { session } = require("passport");

var router = express.Router();

//TODO:: add in error and info

router.post("/register", function (req, res, next) {
	if (
		!req.body.email ||
		!req.body.name ||
		!req.body.phone ||
		!req.body.password ||
		!req.body.password2
	) {
		alert("Fill in all detail required");
	} else {
		AdminInfo.findOne({ email: req.body.email }).then((customer) => {
			if (customer) {
				alert("Email already registered");
			} else {
				if (req.body.password != req.body.password2) {
					alert("Wrong password input");
				} else {
					const data = new AdminInfo({
						email: req.body.email,
						name: req.body.name,
						phone_no: req.body.phone,
						password: req.body.password,
					});
					data.save()
						.then(() => {
							alert("Registration success");
							res.render("admin/login");
						})
						.catch((err) => console.log(err));
				}
			}
		});
	}
});

router.post("/login", function (req, res, next) {
	AdminInfo.findOne({ email: req.body.email }, function (err, data) {
		if (data) {
			bcrypt
				.compare(req.body.password, data.password)
				.then((doMatch) => {
					if (doMatch) {
						req.session.email = data.email;
						// session = req.session.email;
						res.render("admin/home");
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

router.post("/addstaff", function (req, res, next) {
	StaffInfo.findOne({ email: req.body.email }).then((staff) => {
		if (staff) {
			alert("Staff already registered");
		} else {
			if (req.body.password != req.body.password2) {
				alert("Password incorrect");
			} else {
				const data = new StaffInfo({
					name: req.body.name,
					password: req.body.password,
					email: req.body.email,
				});
				data.save()
					.then(() => {
						alert("Staff added successfully");
						res.redirect("/admin/addstaff");
					})
					.catch((err) => console.log(err));
			}
		}
	});
});

router.post("/updateprofile", function (req, res, next) {
	const update = {
		name: req.body.name,
		email: req.body.email,
	};
	AdminInfo.findOneAndUpdate({ email: req.session.email }, update)
		.then(() => {
			AdminInfo.find({}, function (err, data) {
				if (data) {
					alert("Update success");
					res.render("admin/profile", { "name": update.name, "email": update.email });
				}
			});
		})
		.catch((err) => console.log(err));
});

module.exports = router;
