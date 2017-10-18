config = require('./config');

var express = require('express');
var app = express();
var server = require('http').Server(app);

app.use(express.static('public'));

var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
    secret: 'fjKUJnj0123ja78kYUal',
    resave: true,
    saveUninitialized: true
}));

var router = express.Router();
app.use(router);

require('./routes/route.main')(router);

server.listen(8080);