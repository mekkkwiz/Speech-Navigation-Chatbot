const express = require("express");
const cors = require('cors')
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

// const config = require("./server/config/keys");
// const mongoose = require("mongoose");
// mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB Connected...'))
//   .catch(err => console.log(err));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const corsOption = {
  origin: ['http://localhost:3000'],
};
app.use(cors(corsOption));
//if you want in every domain then
app.use(cors())

app.use('/api/dialogflow', require('./server/routes/dialogflow'));

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {

  // Set static folder
  app.use(express.static("client/build"));

  // index.html for all page routes
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server Running at ${port}`)
});
