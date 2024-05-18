import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import logger from "morgan";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/user";
import errorHandler from "./middleware/errorHandler";
import notFoundHandler from "./middleware/notFoundHandler";
import routes from "./routes/index";

config();

const app = express();

const mongoDb = process.env.DB_STRING;
if (!mongoDb) {
  throw new Error("DB_STRING value is not defined in .env file");
}

mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const secret = process.env.SECRET;
if (!secret) {
  throw new Error("SECRET value is not defined in .env file");
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: true,
  })
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    return User.findOne({ username })
      .exec()
      .then((user) => {
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        bcrypt
          .compare(password, user.password)
          .then((result) => {
            if (result) {
              // passwords match! log user in
              return done(null, user);
            }
            // passwords do not match!
            return done(null, false, { message: "Incorrect password" });
          })
          .catch(done);
      })
      .catch(done);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// routes
app.use("/api", routes);

// catch 404 and forward to error handler
app.use(notFoundHandler);

// error handler
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server running..."));
