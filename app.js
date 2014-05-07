var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nconf = require('nconf');

nconf.env().argv();
nconf.file('./config.json');

nconf.set('AUTOMATIC_SCOPES', 'scope:trip:summary scope:location scope:vehicle scope:notification:hard_accel scope:notification:hard_brake scope:notification:speeding');


var routes = require('./routes');
var oauth = require('./routes/oauth');
var api = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('rXrq6xCSJu'));
app.use(express.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

if (app.get('env') !== 'development') {
	app.all('*', routes.force_https);
} else {
	app.all('*', routes.check_dev_token);
}

app.get('/', routes.index);
app.get('/trips', oauth.authenticate, routes.trips);
app.get('/trips/:id', oauth.authenticate, routes.trip);

app.get('/authorize/', oauth.authorize);
app.get('/logout/', oauth.logout);
app.get('/redirect/', oauth.redirect);

app.get('/api/trips/', oauth.authenticate, api.trips);
app.get('/api/trips/:id', oauth.authenticate, api.trip);
app.get('/download/trips.json', oauth.authenticate, api.downloadTripsJSON);
app.get('/download/trips.csv', oauth.authenticate, api.downloadTripsCSV);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;