const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json({
  limit: '20mb',
}));
app.use(express.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, "public")));

if (!process.env.DB_CONNECTION_STRING) {
  throw new Error("DB_CONNECTION_STRING environment variable is not set.");
} else if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set.");
} else if (!process.env.ENVIRONMENT) {
  process.env.ENVIRONMENT = "production";
} else if (!process.env.ENABLE_SIGNUP) {
  process.env.ENABLE_SIGNUP = "false";
} else if (!process.env.MASTER_PASSWORD) {
  process.env.MASTER_PASSWORD = "";
  if (process.env.ENABLE_SIGNUP === "true") {
    throw new Error("MASTER_PASSWORD is not set.");
  }
}

require("./api/models/db");

app.use("/api", (req, res, next) => {
  if (process.env.ENVIRONMENT !== "production") {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  next();
});

const api = require("./api/routes/index");
app.use("/api", api);

app.get("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res.status(401).json({
      message: "You are not signed in.",
    });
  }
  else if (err.status === 404) {
    return res.status(404).json({
      message: "This resource doesn't exist.",
    });
  }
  else if (err) {
    return res.status(500).json({
      message: "The action could not be completed.",
    });
  }
});

let server = app.listen(process.env.PORT || 3000, () => {
  const port = server.address().port;
  console.log(`Listening on port ${port}`);
});
