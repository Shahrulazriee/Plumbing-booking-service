var bycrypt = require("bcryptjs");
var mongoose = require("mongoose");

const SALT_FACTOR = 10;

var admin_infoSchema = new mongoose.Schema({
	password: { type: String, required: true },
	name: { type: String, required: true },
	email: { type: String, required: true },
});

admin_infoSchema.pre("save", function (done) {
	var admin = this;
	if (!admin.isModified("password")) {
		return done();
	}
	bycrypt.genSalt(SALT_FACTOR, function (err, salt) {
		if (err) {
			return done(err);
		}
		bycrypt.hash(admin.password, salt, function (err, hashedPassword) {
			if (err) {
				return done(err);
			}
			admin.password = hashedPassword;
			done();
		});
	});
});

admin_infoSchema.methods.checkPassword = function (guess, done) {
	if (this.password != null) {
		bycrypt.compare(guess, this.password, function (err, isMatch) {
			done(err, isMatch);
		});
	}
};

const AdminInfo = mongoose.model("admin", admin_infoSchema);
module.exports = { AdminInfo };
