var bycrypt = require("bcryptjs");
var mongoose = require("mongoose");
// const { FLOAT } = require("ol/webgl");

const SALT_FACTOR = 10;

var plumber_infoSchema = new mongoose.Schema({
	password: { type: String, required: true },
	name: { type: String, required: true },
	email: { type: String, required: true },
	phone_no: { type: String, required: true },
	statusP: { type: Boolean, required: true },
	ssm: { type: String, required: true },
	adr1: { type: String, required: true },
	adr2: { type: String, required: false },
	state: { type: String, required: true },
	poskod: { type: Number, required: true },
	city: { type: String, required: true },
	long: { type: String, required: true },
	lat: { type: String, required: true },
});

plumber_infoSchema.pre("save", function (done) {
	var plumber = this;
	if (!plumber.isModified("password")) {
		return done();
	}
	bycrypt.genSalt(SALT_FACTOR, function (err, salt) {
		if (err) {
			return done(err);
		}
		bycrypt.hash(plumber.password, salt, function (err, hashedPassword) {
			if (err) {
				return done(err);
			}
			plumber.password = hashedPassword;
			done();
		});
	});
});

plumber_infoSchema.methods.checkPassword = function (guess, done) {
	if (this.password != null) {
		bycrypt.compare(guess, this.password, function (err, isMatch) {
			done(err, isMatch);
		});
	}
};

const PlumberInfo = mongoose.model("plumber", plumber_infoSchema);
module.exports = { PlumberInfo };
