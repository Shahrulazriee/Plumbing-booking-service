var mongoose = require("mongoose");

var book_infoSchema = new mongoose.Schema({
	custEmail: { type: String, required: true },
	plumbEmail: { type: String, required: true },
	bookDate: { type: String, required: true },
	bookTime: { type: String, required: true },
	problem: { type: String, required: true },
	status:{ type: String, required: true},
	startPrice: { type: Number, required: false },
	endPrice: { type: Number, required: false },
});

const BookInfo = mongoose.model("booking", book_infoSchema);
module.exports = { BookInfo };
