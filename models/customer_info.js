var bycrypt = require("bcryptjs");
var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SALT_FACTOR = 10;

var customer_infoSchema = new mongoose.Schema({
	customerID: { type: Schema.Types.ObjectId, required: false },
	password: { type: String, required: true },
	name: { type: String, required: true },
	email: { type: String, required: true },
	phone_no: { type: String, required: true },
	adr1: { type: String, required: true },
	adr2: { type: String, required: false },
	poskod: { type: Number, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
});

customer_infoSchema.pre("save", function (done) {
	var customer = this;
	if (!customer.isModified("password")) {
		return done();
	}
	bycrypt.genSalt(SALT_FACTOR, function (err, salt) {
		if (err) {
			return done(err);
		}
		bycrypt.hash(customer.password, salt, function (err, hashedPassword) {
			if (err) {
				return done(err);
			}
			customer.password = hashedPassword;
			done();
		});
	});
});

customer_infoSchema.methods.checkPassword = function (guess, done) {
	if (this.password != null) {
		bycrypt.compare(guess, this.password, function (err, isMatch) {
			done(err, isMatch);
		});
	}
};

const CustomerInfo = mongoose.model("customer", customer_infoSchema);
module.exports = { CustomerInfo };
