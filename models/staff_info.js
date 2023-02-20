var bycrypt = require("bcryptjs");
var mongoose = require("mongoose");

const SALT_FACTOR = 10;

var staff_infoSchema = new mongoose.Schema({
	password: { type: String, required: true },
	name: { type: String, required: true },
	email: { type: String, required: true },
});

staff_infoSchema.pre("save", function (done) {
	var staff = this;
	if (!staff.isModified("password")) {
		return done();
	}
	bycrypt.genSalt(SALT_FACTOR, function (err, salt) {
		if (err) {
			return done(err);
		}
		bycrypt.hash(staff.password, salt, function (err, hashedPassword) {
			if (err) {
				return done(err);
			}
			staff.password = hashedPassword;
			done();
		});
	});
});

staff_infoSchema.methods.checkPassword = function (guess, done) {
	if (this.password != null) {
		bycrypt.compare(guess, this.password, function (err, isMatch) {
			done(err, isMatch);
		});
	}
};

const StaffInfo = mongoose.model("staff", staff_infoSchema);
module.exports = { StaffInfo };
