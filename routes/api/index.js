var express = require("express");
var { CustomerInfo } = require("../../models/customer_info");
// import { ObjectId } from "mongodb";
const { default: mongoose } = require("mongoose");
var router = express.Router();

//TODO:: add in error and info

router.use("/customer", require("./customer"));
router.use("/plumber", require("./plumber"));
router.use("/staff", require("./staff"));
router.use("/admin", require("./admin"));

/* Logging out the user. */
router.get("/logout", function (req, res, next) {
	console.log("logout");
	if (req.session) {
		req.session.destroy(function (err) {
			if (err) {
				return next(err);
			} else {
				return res.redirect("/");
			}
		});
	}
});

module.exports = router;
