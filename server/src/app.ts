import bcrypt from "bcryptjs";
import connectPgSimple, { PGStore } from "connect-pg-simple";
import cors from "cors";
import express, { Express } from "express";
import session from "express-session";
import logger from "morgan";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import path from "path";

import { variables } from "./config/variables";
import { pool } from "./db/pool";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes/index";

export const app: Express = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const pgSession: typeof PGStore = connectPgSimple(session);

const sessionStore: PGStore = new pgSession({
  pool,
  tableName: "session",
});

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: variables.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms/1 sec )
    },
  })
);

app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const { rows } = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );
        const user = rows[0];
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          // passwords match! log user in
          delete user.password;
          return done(null, user);
        }
        // passwords do not match!
        return done(null, false, { message: "Incorrect password." });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const user = rows[0];
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use("/api", routes);

app.use(errorHandler);
