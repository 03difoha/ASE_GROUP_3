const serverless = require("serverless-http");
const express = require("express");
const mysql = require("mysql");
const app = express();
const axios = require("axios");
app.use(express.json());

app.get("/dev", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

// app.get("/hello", (req, res, next) => {
//   return res.status(200).json({
//     message: "Hello from Valentin!",
//   });
// });

app.post("/hello", (req, res, next) => {
  axios
    .post("https://harshitpoddar.com/submit_info.php", req.body)
    .then((dbRes) => {
      console.log(`statusCode: ${dbRes.status}`);
      console.log(dbRes);
      return res.status(200).json({
        message: dbRes.data,
        data: req.body,
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(400).json({
        message: error,
      });
    });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
