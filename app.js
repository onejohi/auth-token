var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fs = require('fs');
var User = require('./models/user');
var app = express();

mongoose.connect('mongodb://localhost:27017/auth-token')

//allow express to use url encoded data and json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', ensureToken, (req, res, next) => {
    res.send("This route is protected, redirect to login if authentication is not verified");
});

app.post('/login', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({ username: username, password: password}, (err, result) => {
        if(err) {
            console.log(err);
        } else if(!result){
            res.json({
                ok: false,
                message: 'wrong username and password combination'
            });
        } else {
            var token = jwt.sign({ username: username }, 'secretkey' ,(err, token) => {
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
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({ username: username }, (err, result) => {
        if(err) {
            console.log(err);
        } else if(!result){
            var user = new User({
                username: username,
                password: password
            });
            user.save((err) => {
                var token = jwt.sign({username: username}, 'secretkey', (err, token) => {
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
    var bearerHeader = req.headers["authorization"];

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
    console.log('Server runnin on PORT: 3000 or the default port.')
})