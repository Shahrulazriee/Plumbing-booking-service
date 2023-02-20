var bycrypt = require("bcryptjs");
var mongoose = require("mongoose");

const SALT_FACTOR = 10;

var rating_infoSchema = new mongoose.Schema({
	plumbID: { type: String, required: true },
	oneStar: { type: Number, required: true },
	twoStar: { type: Number, required: true },
	threeStar: { type: Number, required: true },
	fourStar: { type: Number, required: true },
	fiveStar: { type: Number, required: true },
	rating: { type: Number, required: true },
});

const RatingInfo = mongoose.model("rating", rating_infoSchema);
module.exports = { RatingInfo };
