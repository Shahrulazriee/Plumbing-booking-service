var express = require("express");
var bcrypt = require("bcryptjs");
var flash = require("connect-flash");
let { session } = require("passport");
// const ejsLint = require("ejs-lint");
const {
	getRouteRegex,
} = require("next/dist/shared/lib/router/utils/route-regex");
const { AdminInfo } = require("../../models/admin_info");
var router = express.Router();

router.get("/register", function (req, res) {
	res.render("admin/register");
});
router.get("/login", function (req, res) {
	res.render("admin/login");
});

router.get("/addstaff", function (req, res) {
	res.render("admin/addstaff");
});

router.get("/profile", function (req, res, next) {
	AdminInfo.findOne({ email: req.session.email }, function (err, data) {
		if (data) {
			res.render("admin/profile", { name: data.name, email: data.email });
		} else {
			res.render("admin/home");
		}
	});
});

module.exports = router;
