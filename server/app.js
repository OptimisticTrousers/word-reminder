const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const notFoundHandler = require("./middleware/notFoundHandler");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes/index");
const User = require("./models/user");
require("dotenv").config();

const app = express();

const mongoDb = process.env.DB_STRING;

mongoose.connect(mongoDb, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));

passport.use(new LocalStrategy(async (username, password, done) => {
    User.findOne({ username }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return done(err);
            }
            if (result) {
                // passwords match! log user in
                return done(null, user);
            }
            // passwords do not match!
            return done(null, false);
        })
    })
}))

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
})

// routes
app.use("/api", routes);

// catch 404 and forward to error handler
app.use(notFoundHandler);

// error handler
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server running..."));