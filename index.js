import "dotenv/config";
import express from "express";
import path from "path";
import sessions from "express-session";
import { connect } from "./db.js";
import cors from "cors";

// connect to MongoDB
connect();

const __dirname = import.meta.dirname;

// create express app
const app = express();
const port = process.env.PORT || "8888";

app.use(cors());

// set up Pug template engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// static files
app.use(express.static(path.join(__dirname, "public")));

// session setup
app.use(
  sessions({
    secret: process.env.SESSIONSECRET,
    name: "RealEstateSession",
    saveUninitialized: false,
    resave: false,
    cookie: {}
  })
);

// middleware example for protected routes
app.use("/admin", (req, res, next) => {
  if (req.session.loggedIn) {
    app.locals.user = req.session.user;
    next();
  } else {
    res.redirect("/login");
  }
});

// logout middleware
app.use("/logout", (req, res, next) => {
  app.locals.user = null;
  next();
});

// import new routers
import agentRouter from "./components/Agents/routes.js";
import propertyRouter from "./components/Properties/routes.js";
import userRouter from "./components/User/routes.js";

import agentModel from "./components/Agents/model.js";
import propertyModel from "./components/Properties/model.js";

// use component routers
app.use("/", userRouter); // login
app.use("/admin/agents", agentRouter);
app.use("/admin/properties", propertyRouter);

// admin dashboard
app.get("/admin", (req, res) => {
    res.render("admin/dashboard", { user: req.session.user });
  });

// home page
app.get("/", (request, response) => {
    response.render("index", { title: "Real Estate Dashboard" });
  });

// API endpoint for all properties
app.get("/api/properties", async (req, res) => {
  const properties = await propertyModel.getAllProperties();
  res.json(properties);
});

// API endpoint for all agents
app.get("/api/agents", async (req, res) => {
  const agents = await agentModel.getAllAgents();
  res.json(agents);
});

// start server
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});