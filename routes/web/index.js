var express = require("express");
var passport = require("passport");
var router = express.Router();

router.get("/", function (req, res) {
	res.render("index");
});

router.get("/register", function (req, res) {
	res.render("customer/register");
});

router.get("/login", function (req, res) {
	res.render("customer/login");
});

router.get("/terms", function (req, res) {
	res.render("customer/terms");
});

router.use("/customer", require("./customer"));
router.use("/plumber", require("./plumber"));
router.use("/admin", require("./admin"));
router.use("/staff", require("./staff"));
module.exports = router;
