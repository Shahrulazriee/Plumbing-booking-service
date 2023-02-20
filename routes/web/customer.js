var express = require("express");
var bcrypt = require("bcryptjs");
var flash = require("connect-flash");
let { session } = require("passport");
const { CustomerInfo } = require("../../models/customer_info");
const { PlumberInfo } = require("../../models/plumber_info");
const { BookInfo } = require("../../models/book_info");
const { RatingInfo } = require("../../models/rating_info");

var router = express.Router();

/* This is a function that will be called when the user access the url `/home`. */
router.get("/home", function (req, res, next) {
	res.render("customer/home");
});

/* This is the code that will be executed when the user access the url `/book`. */
router.get("/book", function (req, res) {
	var infos = [];
	PlumberInfo.find({}, function (err, data) {
		if (data) {
			RatingInfo.find({}, function (err, datarating) {
				for (let dataPlumb of data) {
					for (let dataRating of datarating) {
						if (dataPlumb._id == dataRating.plumbID) {
							/* To combine the data from two collections into one array. */
							let info = dataRating;
							info.name = dataPlumb.name;
							info.email = dataPlumb.email;
							info.phone_no = dataPlumb.phone_no;
							info.ssm = dataPlumb.ssm;
							info.adr1 = dataPlumb.adr1;
							info.adr2 = dataPlumb.adr2;
							info.poskod = dataPlumb.poskod;
							info.city = dataPlumb.city;
							info.state = dataPlumb.state;
							info.lat = dataPlumb.lat;
							info.long = dataPlumb.long;
							info.rating = dataRating.rating;
							infos.push(info);
						}
					}
				}
				console.log("success retrieval");
				res.render("customer/book", { infos });
			});
		} else if (!data) {
			console.log("unsuccess retrieval");
			res.render("customer/home");
		}
	});
});

/* A function that will be called when the user access the url `/profile` */
router.get("/profile", function (req, res, next) {
	CustomerInfo.findOne({ email: req.session.email }, function (err, data) {
		if (data) {
			/* Rendering the profile page with the data from the database. */
			res.render("customer/profile", {
				name: data.name,
				email: data.email,
				phone_no: data.phone_no,
				adr1: data.adr1,
				adr2: data.adr2,
				poskod: data.poskod,
				city: data.city,
				state: data.state,
			});
		} else {
			console.log(err);
			res.render("customer/home");
		}
	});
});

router.get("/booking/:email", function (req, res) {
	CustomerInfo.findOne({ email: req.session.email }, function (err, data) {
		if (data) {
			PlumberInfo.findOne(
				{ email: req.params.email },
				function (err, data1) {
					if (data1) {
						RatingInfo.findOne(
							{ plumbID: data1._id },
							function (err, data2) {
								res.render("customer/book2", {
									data,
									data1,
									data2,
								});
							}
						);
					} else {
						res.redirect("/customer/book");
					}
				}
			);
		} else {
			console.log(err);
			res.redirect("/customer/home");
		}
	});
});

router.get("/history", function (req, res) {
	BookInfo.find({ custEmail: req.session.email }, function (err, data) {
		if (data) {
			res.render("customer/history", { data });
		} else {
			alert("There is no history to be display");
			res.render("customer/history");
		}
	});
});

router.get("/rate/:id", function (req, res) {
	var id = req.params.id;
	BookInfo.findOne({ _id: id }, function (err, data) {
		res.render("customer/rate", { data });
	});
});

router.get("/update", function (req, res) {
	CustomerInfo.findOne({ email: req.session.email }, function (err, data) {
		if (data) {
			res.render("customer/update", { data });
		}
	});
});
module.exports = router;
