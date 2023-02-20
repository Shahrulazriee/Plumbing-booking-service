var express = require("express");
var bcrypt = require("bcryptjs");
// var popups = require("popups");
let alert = require("alert");
var transporter = require("../../utils/nodemailer");
const url = require("url");

var router = express.Router();

const { default: mongoose } = require("mongoose");
var { PlumberInfo } = require("../../models/plumber_info");
const { append } = require("express/lib/response");
let { session } = require("passport");
const { BookInfo } = require("../../models/book_info");
const { RatingInfo } = require("../../models/rating_info");

//TODO:: add in error and info

router.post("/register", async function (req, res, next) {
	console.log(req.body);
	if (
		!req.body.email ||
		!req.body.name ||
		!req.body.phone ||
		!req.body.ssm ||
		!req.body.password ||
		!req.body.password2
	) {
		alert("Fill in all detail required");
	} else {
		PlumberInfo.findOne({ email: req.body.email }).then((plumber) => {
			if (plumber) {
				req.flash("message", "Email already registered");
				res.redirect("/plumber/register");
			} else {
				if (req.body.password != req.body.password2) {
					// alert("Wrong password input");
					req.flash("message", "Wrong password input");
					res.redirect("/plumber/register");
				} else {
					/* This is the code for the plumber to register. */
					const data = new PlumberInfo({
						email: req.body.email,
						name: req.body.name,
						phone_no: req.body.phone,
						password: req.body.password,
						ssm: req.body.ssm,
						statusP: true,
						adr1: req.body.adr1,
						adr2: req.body.adr2,
						poskod: req.body.poskod,
						city: req.body.city,
						state: req.body.state,
						lat: req.body.lat,
						long: req.body.long,
					});
					data.save()
						.then(() => {
							const newRating = new RatingInfo({
								plumbID: data._id,
								oneStar: 0,
								twoStar: 0,
								threeStar: 0,
								fourStar: 0,
								fiveStar: 0,
								rating: 0,
							});
							newRating
								.save()
								.then(() => {
									req.flash(
										"message",
										"Registration success"
									);
									res.redirect("/plumber/login");
								})
								.catch((err) => {
									console.log(err);
									req.flash(
										"message",
										"There is some prroblem registering, Please try again"
									);
									res.redirect("/plumber/register");
								});
						})
						.catch((err) => {
							console.log(err);
							req.flash(
								"message",
								"There is some prroblem registering, Please try again"
							);
							res.redirect("/plumber/register");
						});
				}
			}
		});
	}
});

/* This is the login function for plumber. */
router.post("/login", function (req, res, next) {
	PlumberInfo.findOne({ email: req.body.email }, function (err, data) {
		if (data) {
			bcrypt
				.compare(req.body.password, data.password)
				.then((doMatch) => {
					if (doMatch) {
						if (data.statusP === false) {
							/* Setting the session to the email of the user. */
							req.session.email = data.email;
							session = req.session;
							res.redirect("/plumber/submission");
						} else {
							req.session.email = data.email;
							session = req.session;
							res.redirect("/plumber/home");
						}
					} else {
						req.flash("message", "Wrong password input");
						res.redirect("/plumber/login");
					}
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			req.flash("message", "Email and Password does not matched");
			res.redirect("/plumber/login");
		}
	});
});

router.post("/updateprofile/:id", function (req, res, next) {
	var id = req.params.id;
	var update = {
		name: req.body.name,
		email: req.body.email,
		phone_no: req.body.phone_no,
		ssm: req.body.ssm,
		adr1: req.body.adr1,
		adr2: req.body.adr2,
		poskod: req.body.poskod,
		city: req.body.city,
		state: req.body.state,
		lat: req.body.lat,
		long: req.body.long,
	};
	PlumberInfo.findOneAndUpdate({ _id: id }, update)
		.then(() => {
			PlumberInfo.find({}, function (err, data) {
				if (data) {
					req.flash("message", "Update successful");
					res.redirect(
						url.format({
							pathname: "/plumber/profile",
							query: {
								name: update.name,
								email: update.email,
								phone_no: update.phone_no,
								ssm: update.ssm,
								adr1: update.adr1,
								adr2: update.adr2,
								poskod: update.poskod,
								city: update.city,
								state: update.state,
								lat: update.lat,
								long: update.long,
							},
						})
					);
				}
			});
		})
		.catch((err) => console.log(err));
});

router.post("/price/:id", function (req, res) {
	var id = req.params.id;
	var update = {
		startPrice: req.body.startPrice,
		endPrice: req.body.endPrice,
		status: "Accepted",
	};
	BookInfo.findOneAndUpdate({ _id: id }, update).then(() => {
		BookInfo.findOne({ _id: id }, function (err, data) {
			message = {
				from: data.plumbEmail,
				to: data.custEmail,
				subject: "Plumberized Job Accepted",
				text: data.problem + " " + data.plumbEmail,
				html: `<h1>Accepted Job</h1>
				<br>
				<p>Name: ${data.plumbEmail}</p>
				<br>
				<p>Problem: ${data.problem}</p>
				<br>
				<p>Price range: RM${req.body.startPrice} - RM${req.body.endPrice}</p>`,
			};
			if (data) {
				transporter.sendMail(message, function (err, info) {
					if (err) {
						console.log(err);
					} else {
						console.log(info);
					}
				});
				res.redirect("/plumber/booking");
			}
		});
	});
});

module.exports = router;
