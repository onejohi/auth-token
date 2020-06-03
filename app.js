const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./models/user');
const app = express();

mongoose.connect('mongodb://localhost:27017/auth-token', { useMongoClient: true });

//allow express to use url encoded data and json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', ensureToken, (req, res) => {
  res.send("This route is protected, redirect to login if authentication is not verified");
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username: username, password: password}, (err, result) => {
    if(err) {
      console.log(err);
    } else if(!result){
      res.json({
        ok: false,
        message: 'wrong username and password combination'
      });
    } else {
      const token = jwt.sign({ username: username }, 'secretkey' ,(err, token) => {
        res.json({
          ok: true,
          username: result.username,
          id: result._id,
          token: token
        });
      })
    }
  })

});

app.post('/signup', (req, res, next) => {
  const { username, password } = req.body;

  User.findOne({ username: username }, (err, result) => {
    if(err) {
      console.log(err);
    } else if(!result){
      const user = new User({
        username: username,
        password: password
      });
      user.save((err) => {
        const token = jwt.sign({username: username}, 'secretkey', (err, token) => {
          res.json({
            ok: true,
            token: token 
          })
        });
      })
    } else {
      res.json({
        ok: false,
        message: 'User exists please select a different username or login'
      });
    }
  })

});

function ensureToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if(typeof bearerHeader !== 'undefined' ) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

app.listen(process.env.PORT || 3000, () => {
  console.log('Server runnin on PORT: 3000 or the default port.');
});
