import Agenda, { Job } from "agenda";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import logger from "morgan";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import errorHandler from "./middleware/errorHandler";
import notFoundHandler from "./middleware/notFoundHandler";
import User from "./models/user";
import WordsByDuration from "./models/wordsByDuration";
import routes from "./routes/index";
import createWordsByDuration from "./utils/createRandomWordsByDuration";

const app = express();

const mongoDb = process.env.DB_STRING;

if (!mongoDb) {
  throw new Error("DB_STRING value is not defined in .env file");
}

mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const agenda = new Agenda({
  db: { address: mongoDb, collection: "agendaJobs" },
});

agenda.define("create_agenda", async (job: Job) => {
  const {
    duplicateWords,
    userId,
    wordsByDurationLength,
    from,
    to,
    active,
    recurring,
  } = job.attrs.data;
  await createWordsByDuration(
    from,
    to,
    userId,
    wordsByDurationLength,
    active,
    duplicateWords,
    recurring,
    () => {},
    () => {},
    () => {}
  );
});

agenda.define("activate_words_by_duration", async (job: Job) => {
  const { wordsByDurationId } = job.attrs.data;
  await WordsByDuration.findByIdAndUpdate(
    wordsByDurationId,
    { active: true },
    { new: true }
  ).exec();
});

(async () => {
  await agenda.start();
})();

async function graceful() {
  await agenda.stop();
  process.exit(0);
}

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);

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
          .compare(password, user.password as string)
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
  done(null, (user as { id: string }).id);
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

export default agenda;
