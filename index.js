var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");
var bodyParser = require("body-parser");
var dbconn = require("./utils/dbconn");
var session = require("express-session");
const passport = require("passport");
var multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const { response } = require("express");

var app = express();

/* Connecting to the database. */
mongoose.connect(
	dbconn.DATABASECONNECTION,
	{
		useUnifiedTopology: true,
	},
	(err) => {
		if (err) throw err;
		console.log("Connected to MongoDB");
	}
);

const mongoURI = dbconn.DATABASECONNECTION;
const conn = mongoose.createConnection(mongoURI);
let gfs;

conn.once("one", () => {
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection("uploads");
});

const storage = new GridFsStorage({
	url: mongoURI,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			const filename = file.originalname;
			const fileInfo = {
				filename: filename,
				bucketName: "uploads",
			};
			resolve(fileInfo);
		});
	},
});
const upload = multer({ storage });

/* Setting the port to 3000. */
app.set("port", process.env.PORT || 3000);

/* Setting the views directory to the views folder. */
app.set("views", path.join(__dirname, "views"));



/* Loading the environment variables from the .env file. */
require("dotenv").config();

let bucket;
mongoose.connection.on("connected", () => {
	var db = mongoose.connections[0].db;
	bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "newBucket" });
	// console.log(bucket);
});

app.use(express.json());

/* Setting the view engine to ejs. */
app.set("view engine", "ejs");

/* Parsing the body of the request. */
app.use(
	bodyParser.urlencoded({
		extended: false,
	})
);

// app.use('asset/img', express.static(path.resolve(__dirname, "asset/img")))


/* Used to display the flash messages. */
app.use(flash());

/* Parsing the cookies. */
app.use(cookieParser());

/* Creating a session. */
app.use(session({ secret: "qwerty", resave: true, saveUnintialized: true }));

/* Initializing the passport. */
app.use(passport.initialize());

/* Creating a session for the user. */
app.use(passport.session());
// require("./setuppassport")(passport);

app.use(function (req, res, next) {
	res.locals.message = req.flash();
	next();
});

// creating routing
app.use("/", require("./routes/web"));
app.use("/api", require("./routes/api"));

/* Listening to the port 3000. */
app.listen(app.get("port"), function () {
	console.log("Server started at port " + app.get("port"));
});
