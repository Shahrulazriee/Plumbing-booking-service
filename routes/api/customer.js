var express = require("express");
var bcrypt = require("bcryptjs");
// var popups = require("popups");
let alert = require("alert");
const url = require("url");
var transporter = require("../../utils/nodemailer");

var router = express.Router();

const { default: mongoose } = require("mongoose");
var { CustomerInfo } = require("../../models/customer_info");
var { BookInfo } = require("../../models/book_info");
const { append } = require("express/lib/response");
let { session } = require("passport");
const { reset } = require("nodemon");
const { PlumberInfo } = require("../../models/plumber_info");
const { RatingInfo } = require("../../models/rating_info");

//TODO:: add in error and info

router.post("/register", async function (req, res, next) {
	if (
		!req.body.email ||
		!req.body.name ||
		!req.body.phone ||
		!req.body.password ||
		!req.body.password2
	) {
		alert("Fill in all detail required");
	} else {
		CustomerInfo.findOne({ email: req.body.email }).then((customer) => {
			if (customer) {
				req.flash("message", "Email already registered");
			} else {
				if (req.body.password != req.body.password2) {
					req.flash("message", "Wrong password input");
				} else {
					const data = new CustomerInfo({
						email: req.body.email,
						name: req.body.name,
						phone_no: req.body.phone,
						password: req.body.password,
						ssm: req.body.ssm,
						adr1: req.body.adr1,
						adr2: req.body.adr2,
						poskod: req.body.poskod,
						city: req.body.city,
						state: req.body.state,
					});
					data.save()
						.then(() => {
							req.flash("message", "Registration successful");
							res.redirect("/login");
						})
						.catch((err) => {
							req.flash("message", "Something went wrong");
							console.log(err);
							res.redirect("/register");
						});
				}
			}
		});
	}
});

router.post("/login", function (req, res, next) {
	console.log(req.body.email);
	console.log(req.body.password);
	CustomerInfo.findOne({ email: req.body.email }, function (err, data) {
		if (data) {
			bcrypt
				.compare(req.body.password, data.password)
				.then((doMatch) => {
					if (doMatch) {
						req.session.email = data.email;
						var id1 = JSON.stringify(data._id);
						var id2 = id1.replace("ObjectId()", "");
						var id3 = id2.replaceAll('"', "");
						session = req.session;
						console.log(session);
						res.redirect("/customer/home");
					} else {
						req.flash("message", "Wrong password input");
						res.redirect("/login");
					}
				})
				.catch((err) => {
					req.flash("message", "Something went wrong");
					res.redirect("/login");
					console.log(err);
				});
		} else {
			req.flash("message", "Email and password not match");
			res.redirect("/login");
		}
	});
});

router.post("/updateprofile/:id", function (req, res, next) {
	var id = req.params.id;
	var update = {
		name: req.body.name,
		email: req.body.email,
		phone_no: req.body.phone_no,
		adr1: req.body.adr1,
		adr2: req.body.adr2,
		poskod: req.body.poskod,
		city: req.body.city,
		state: req.body.state,
	};
	CustomerInfo.findOneAndUpdate({ _id: id }, update)
		.then(() => {
			CustomerInfo.find({}, function (err, data) {
				if (data) {
					req.flash("message", "Update successful");
					res.redirect(
						url.format({
							pathname: "/customer/profile",
							query: {
								name: update.name,
								email: update.email,
								phone_no: update.phone_no,
								adr1: update.adr1,
								adr2: update.adr2,
								poskod: update.poskod,
								city: update.city,
								state: update.state,
							},
						})
					);
				}
			});
		})
		.catch((err) => console.log(err));
});

router.post("/book", function (req, res, next) {
	var date1 = JSON.stringify(req.body.date);
	var i = 0,
		j = 0;
	const data1 = [],
		hitDate = [];
	BookInfo.findOne({ plumbEmail: req.body.emailP }, function (err, data) {
		if (data) {
			var date2 = data.bookDate;
			if (date2 == date1) {
				req.flash(
					"message",
					"Plumber already booked for the day, choose another day"
				);
				// alert("Plumber already booked for the day, choose another day");
				res.redirect("/customer/book");
			}
			if (date2 != date1) {
				CustomerInfo.findOne(
					{ email: req.body.emailC },
					function (err, data2) {
						console.log(req.body.email);
						if (data2) {
							message = {
								from: req.body.emailC,
								to: data.plumbEmail,
								subject: "Plumberized Job Incoming",
								text: req.body.problem + " " + req.body.emailC,
								html: `<h1>New Job</h1>
								<br>
								<p>Email: ${req.body.emailC}</p>
								<br>
								<p>Name: ${data2.name}</p>
								<br>
								<p>Problem: ${req.body.problem}</p>
								<br>
								<p>Address: ${data2.adr1}, ${data2.adr2}, ${data2.poskod}, ${data2.city}, ${data2.state}</p>
								<br>
								<p>Please go to the website to accept or reject the job</p>`,
							};
							const book = new BookInfo({
								custEmail: req.body.emailC,
								bookDate: req.body.date,
								bookTime: req.body.time,
								problem: req.body.problem,
								plumbEmail: req.body.emailP,
								status: "Pending",
							});
							book.save()
								.then(() => {
									transporter.sendMail(
										message,
										function (err, info) {
											if (err) {
												console.log(err);
											} else {
												console.log(info);
											}
										}
									);
									req.flash(
										"message",
										"Successfully booked session"
									);
									// alert("Successfully booked session 1");
									res.redirect("/customer/history");
								})
								.catch((err) => {
									console.log(err);
									req.flash(
										"message",
										"Booking session unsuccessful"
									);
									// alert("Booking session unsuccessful 1");
									res.redirect("/customer/book");
								});
						}
					}
				);
			}
		} else if (!data) {
			CustomerInfo.findOne(
				{ email: req.body.emailC },
				function (err, data3) {
					if (data3) {
						message = {
							from: req.body.emailC,
							to: req.body.emailP,
							subject: "Plumberized Job Incoming",
							text: req.body.problem + " " + req.body.emailC,
							html: `<h1>New Job</h1>
								<br>
								<p>Email: ${req.body.emailC}</p>
								<br>
								<p>Name: ${data3.name}</p>
								<br>
								<p>Problem: ${req.body.problem}</p>
								<br>
								<p>Address: ${data3.adr1}, ${data3.adr2}, ${data3.poskod}, ${data3.city}, ${data3.state}</p>
								<br>
								<p>Please go to the website to accept or reject the job</p>`,
						};
						const book = new BookInfo({
							custEmail: req.body.emailC,
							bookDate: req.body.date,
							bookTime: req.body.time,
							problem: req.body.problem,
							plumbEmail: req.body.emailP,
							status: "Pending",
						});
						book.save()
							.then(() => {
								transporter.sendMail(
									message,
									function (err, info) {
										if (err) {
											console.log(err);
										} else {
											console.log(info);
										}
									}
								);
								req.flash(
									"message",
									"Successfully booked session"
								);
								// alert("Successfully booked session 2");
								res.redirect("/customer/history");
							})
							.catch((err) => {
								console.log(err);
								req.flash(
									"message",
									"Booking session unsuccessful"
								);
								// alert("Booking session unsuccessful 2");
								res.redirect("/customer/book");
							});
					}
				}
			);
		} else {
			console.log(err);
			req.flash("message", "Something went wrong");
			// alert("Something problem");
			res.redirect("/customer/book");
		}
	});
});

router.post("/rate/:id", function (req, res) {
	var rating = req.body.rating;
	var id = req.params.id;
	BookInfo.findOne({ _id: id }, function (err, data2) {
		PlumberInfo.findOne({ email: data2.plumbEmail }, function (err, data1) {
			var statusupdate = {
				status: "Completed",
			};
			if (req.body.rating == 1) {
				RatingInfo.findOne(
					{ plumbID: data1._id },
					function (err, data2) {
						if (data2) {
							var oldValue = data2.oneStar;
							var newValue = oldValue + 1;
						}
						const newStar = {
							oneStar: newValue,
						};
						RatingInfo.updateOne(
							{ plumbID: data1._id },
							newStar
						).then(() => {
							RatingInfo.findOne(
								{ plumbID: data1._id },
								function (err, data3) {
									var average =
										(data3.oneStar +
											data3.twoStar +
											data3.threeStar +
											data3.fourStar +
											data3.fiveStar) /
										5;
									const newAverage = { rating: average };
									RatingInfo.updateOne(
										{ plumbID: data1._id },
										newAverage
									).then(() => {
										BookInfo.findOneAndUpdate(
											{ _id: id },
											statusupdate
										).then(() => {
											BookInfo.find(
												{
													custEmail:
														req.session.email,
												},
												function (err, data4) {
													res.redirect(
														url.format({
															pathname:
																"/customer/history",
															query: { data4 },
														})
													);
												}
											);
										});
									});
								}
							);
						});
					}
				);
			} else if (req.body.rating == 2) {
				RatingInfo.findOne(
					{ plumbID: data1._id },
					function (err, data2) {
						if (data2) {
							var oldValue = data2.twoStar;
							var newValue = oldValue + 1;
						}
						const newStar = {
							twoStar: newValue,
						};
						RatingInfo.updateOne(
							{ plumbID: data1._id },
							newStar
						).then(() => {
							RatingInfo.findOne(
								{ plumbID: data1._id },
								function (err, data3) {
									var average =
										(data3.oneStar +
											data3.twoStar +
											data3.threeStar +
											data3.fourStar +
											data3.fiveStar) /
										5;
									const newAverage = { rating: average };
									RatingInfo.updateOne(
										{ plumbID: data1._id },
										newAverage
									).then(() => {
										BookInfo.findOneAndUpdate(
											{ _id: id },
											statusupdate
										).then(() => {
											BookInfo.find(
												{
													custEmail:
														req.session.email,
												},
												function (err, data4) {
													res.redirect(
														url.format({
															pathname:
																"/customer/history",
															query: { data4 },
														})
													);
												}
											);
										});
									});
								}
							);
						});
					}
				);
			} else if (req.body.rating == 3) {
				RatingInfo.findOne(
					{ plumbID: data1._id },
					function (err, data2) {
						if (data2) {
							var oldValue = data2.threeStar;
							var newValue = oldValue + 1;
						}
						const newStar = {
							threeStar: newValue,
						};
						RatingInfo.updateOne(
							{ plumbID: data1._id },
							newStar
						).then(() => {
							RatingInfo.findOne(
								{ plumbID: data1._id },
								function (err, data3) {
									var average =
										(data3.oneStar +
											data3.twoStar +
											data3.threeStar +
											data3.fourStar +
											data3.fiveStar) /
										5;
									const newAverage = { rating: average };
									RatingInfo.updateOne(
										{ plumbID: data1._id },
										newAverage
									).then(() => {
										BookInfo.findOneAndUpdate(
											{ _id: id },
											statusupdate
										).then(() => {
											BookInfo.find(
												{
													custEmail:
														req.session.email,
												},
												function (err, data4) {
													res.redirect(
														url.format({
															pathname:
																"/customer/history",
															query: { data4 },
														})
													);
												}
											);
										});
									});
								}
							);
						});
					}
				);
			} else if (req.body.rating == 4) {
				RatingInfo.findOne(
					{ plumbID: data1._id },
					function (err, data2) {
						if (data2) {
							var oldValue = data2.fourStar;
							var newValue = oldValue + 1;
						}
						const newStar = {
							fourStar: newValue,
						};
						RatingInfo.updateOne(
							{ plumbID: data1._id },
							newStar
						).then(() => {
							RatingInfo.findOne(
								{ plumbID: data1._id },
								function (err, data3) {
									var average =
										(data3.oneStar +
											data3.twoStar +
											data3.threeStar +
											data3.fourStar +
											data3.fiveStar) /
										5;
									const newAverage = { rating: average };
									RatingInfo.updateOne(
										{ plumbID: data1._id },
										newAverage
									).then(() => {
										BookInfo.findOneAndUpdate(
											{ _id: id },
											statusupdate
										).then(() => {
											BookInfo.find(
												{
													custEmail:
														req.session.email,
												},
												function (err, data4) {
													res.redirect(
														url.format({
															pathname:
																"/customer/history",
															query: { data4 },
														})
													);
												}
											);
										});
									});
								}
							);
						});
					}
				);
			} else if (req.body.rating == 5) {
				RatingInfo.findOne(
					{ plumbID: data1._id },
					function (err, data2) {
						if (data2) {
							var oldValue = data2.fiveStar;
							var newValue = oldValue + 1;
						}
						const newStar = {
							fiveStar: newValue,
						};
						RatingInfo.updateOne(
							{ plumbID: data1._id },
							newStar
						).then(() => {
							RatingInfo.findOne(
								{ plumbID: data1._id },
								function (err, data3) {
									var average =
										(data3.oneStar +
											data3.twoStar +
											data3.threeStar +
											data3.fourStar +
											data3.fiveStar) /
										5;
									const newAverage = { rating: average };
									RatingInfo.updateOne(
										{ plumbID: data1._id },
										newAverage
									).then(() => {
										BookInfo.findOneAndUpdate(
											{ _id: id },
											statusupdate
										).then(() => {
											BookInfo.find(
												{
													custEmail:
														req.session.email,
												},
												function (err, data4) {
													res.redirect(
														url.format({
															pathname:
																"/customer/history",
															query: { data4 },
														})
													);
												}
											);
										});
									});
								}
							);
						});
					}
				);
			} else {
				console.log("Something went wrong");
				res.redirect("/customer/history");
			}
		});
	});
});

module.exports = router;
