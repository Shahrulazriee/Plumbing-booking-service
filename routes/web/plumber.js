var express = require("express");
var bcrypt = require("bcryptjs");
var flash = require("connect-flash");
var alert = require("alert");
var router = express.Router();
var transporter = require("../../utils/nodemailer");
const { PlumberInfo } = require("../../models/plumber_info");
const { BookInfo } = require("../../models/book_info");
const { CustomerInfo } = require("../../models/customer_info");
const { RatingInfo } = require("../../models/rating_info");

router.get("/register", function (req, res) {
	res.render("plumber/register");
});

router.get("/login", function (req, res) {
	res.render("plumber/login");
});

router.get("/home", function (req, res) {
	res.render("plumber/home");
});

router.get("/profile", function (req, res) {
	PlumberInfo.findOne({ email: req.session.email }, function (err, data) {
		if (data) {
			RatingInfo.findOne({ plumbID: data._id }, function (err, data1) {
				res.render("plumber/profile", {
					name: data.name,
					email: data.email,
					phone_no: data.phone_no,
					adr1: data.adr1,
					adr2: data.adr2,
					poskod: data.poskod,
					city: data.city,
					state: data.state,
					lat: data.lat,
					long: data.long,
					rating: data1.rating,
					fiveStar: data1.fiveStar,
					fourStar: data1.fourStar,
					threeStar: data1.threeStar,
					twoStar: data1.twoStar,
					oneStar: data1.oneStar,
				});
			});
		} else {
			throw err;
		}
	});
});
router.get("/update", function (req, res) {
	PlumberInfo.findOne({ email: req.session.email }, function (err, data) {
		if (data) {
			res.render("plumber/update", { data });
		}
	});
});

router.get("/booking", function (req, res) {
	var bookings = [];
	BookInfo.find({ plumbEmail: req.session.email }, function (err, data) {
		if (!data) {
			console.log("not found");
			res.render("/plumber/booking");
		} else {
			CustomerInfo.find({}, function (err, data1) {
				for (let bookinfo of data) {
					for (let dataCustomer of data1) {
						if (dataCustomer.email === bookinfo.custEmail) {
							let booking = bookinfo;
							booking.adr1 = dataCustomer.adr1;
							booking.adr2 = dataCustomer.adr2;
							booking.poskod = dataCustomer.poskod;
							booking.city = dataCustomer.city;
							booking.state = dataCustomer.state;
							booking.custName = dataCustomer.name;
							booking.email = dataCustomer.email;
							bookings.push(booking);
						}
					}
				}
				res.render("plumber/booking", { bookings });
			});
		}
	});
});

router.get("/accept/:id", function (req, res) {
	var id = req.params.id;
	BookInfo.findOne({ _id: id }, function (err, data) {
		if (data) {
			res.render("plumber/price", { data });
		} else {
			res.redirect("/plumber/booking");
		}
	});
});
router.get("/reject/:id", function (req, res) {
	var id = req.params.id;
	BookInfo.findOneAndRemove({ _id: id }, function (err, data) {
		message = {
			from: data.plumbEmail,
			to: data.custEmail,
			subject: "Plumberized Job Rejected",
			// text: data.problem + " " + data.plumbEmail,
			html: `<h1>Rejected Job</h1>
			<br>
			<p>Email: ${data.plumbEmail}</p>
			<br>
			<p>Problem: ${data.problem}</p>`,
		};
		if (data) {
			transporter.sendMail(message, function (err, info) {
				if (err) {
					console.log(err);
				} else {
					console.log(info);
				}
			});
			req.flash("message", "Job Rejected");
			// alert("Removed successfully");
			res.redirect("/plumber/booking");
		}
	});
});
module.exports = router;
