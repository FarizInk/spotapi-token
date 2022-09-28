const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
require('dotenv').config();
const port = process.env.PORT || 3000;
const axios = require('axios');
const qs = require('qs')
var db = require("./database.js")

//add the router
app.use('/', router);
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/index.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/scopes', function (req, res) {
  const scopes = process.env.SCOPES;
  let data = [];
  if (scopes !== undefined && scopes !== null && scopes !== '') {
    data = scopes.split(',');
  }
  res.send({ data });
});

router.post('/generate', function (req, res) {
  if (req.body.username === process.env.USERNAME && req.body.password === process.env.PASSWORD) {
    // console.log(req.body, process.env.CLIENT_ID);
    let state = (Math.random() + 1).toString(36).substring(7);

    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&scope=${encodeURI(req.body.scopes.join(" "))}&state=${encodeURI(state)}&redirect_uri=${encodeURI(process.env.APP_BASE_URL + "/callback")}`);
  } else {
    res.redirect('/');
  }
});

router.get('/callback', function (req, res) {
  if (req.query.error === undefined) {
    // console.log(req.query.code, req.query.state);

    axios
      .post("https://accounts.spotify.com/api/token", qs.stringify({
        code: req.query.code,
        redirect_uri: process.env.APP_BASE_URL + "/callback",
        grant_type: 'authorization_code',
      }), {
        headers: {
          'Authorization': 'Basic ' + (new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      })
      .then(function (response) {
        const data = response.data;
        console.log(data);
        db.run(
          `UPDATE tokens set 
          access_token = COALESCE(?,access_token), 
          token_type = COALESCE(?,token_type), 
          expires_in = COALESCE(?,expires_in), 
          refresh_token = COALESCE(?,refresh_token), 
          scope = COALESCE(?,scope) 
          WHERE id = ?`,
          [data.access_token, data.token_type, data.expires_in, data.refresh_token, data.scope, 1],
          function (err, result) {
            if (err) {
              res.status(400).json({
                "status": "error",
                "message": err.message,
                "data": null,
              });
              return;
            }
            res.json({
              status: "success",
              message: "Success generate data access_token.",
              data: data,
            })
          });
      })
      .catch(function (error) {
        // handle error
        console.log(error.response.data);
      });
  } else {
    res.redirect('/')
  }
})

router.get('/token', function (req, res, next) {
  var sql = "select * from tokens where id = 1"
  var params = []
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({
        "status": "error",
        "message": err.message,
        "data": null,
      });
      return;
    }
    res.send({
      "status": "success",
      "message": "Success retrieve data access_token.",
      "data": rows[0] ?? null
    })
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});