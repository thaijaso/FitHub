'use strict';

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const mysql = require('mysql');
const session = require('express-session');
const async = require('async');

//setup heroku database
const pool = mysql.createPool({
  	host     : 'thaijaso.vergil.u.washington.edu:',
  	port     : '8865',
  	user     : 'root',
  	password : 'ou8inxs2ic',
  	database : 'NutritionTracker'
});

//setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8888);

//serve static css, image, and js files in the public folder
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/js/pages', express.static(__dirname + '/js/pages'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/public', express.static(__dirname + '/public'));

//serve static css, image, and js files from admin template 
app.use('/plugins/iCheck/flat/', express.static(__dirname + '/plugins/iCheck/flat/'));
app.use('/plugins/morris', express.static(__dirname + '/plugins/morris'));
app.use('/plugins/jvectormap', express.static(__dirname + '/plugins/jvectormap'));
app.use('/plugins/datepicker', express.static(__dirname + '/plugins/datepicker'));
app.use('/plugins/daterangepicker', express.static(__dirname + '/plugins/daterangepicker'));
app.use('/plugins/bootstrap-wysihtml5', express.static(__dirname + '/plugins/bootstrap-wysihtml5'));
app.use('/plugins/sparkline', express.static(__dirname + '/plugins/sparkline'));
app.use('/plugins/knob', express.static(__dirname + '/plugins/knob'));
app.use('/plugins/slimScroll', express.static(__dirname + '/plugins/slimScroll'));
app.use('/plugins/fastclick', express.static(__dirname + '/plugins/fastclick'));
app.use('/plugins/chartjs', express.static(__dirname + '/plugins/chartjs'));
app.use('/plugins/datatables', express.static(__dirname + '/plugins/datatables'));
app.use('/plugins/iCheck', express.static(__dirname + '/plugins/iCheck'));


// serve bootstrap css/javascript and jquery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));

//middleware for passing data bewteen routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


server.listen(app.get('port'), function() {
	console.log('listening on port:', app.get('port'));
});

app.get('/', (req, res) => {
	res.render('login.ejs');
});

app.get('/dashboard', (req, res) => {
	res.render('dashboard.ejs');
});

app.get('/food', (req, res) => {
	res.render('food.ejs');
});

app.get('/diary', (req, res) => {
	res.render('diary.ejs');
});

app.get('/coverflow', (req, res) => {
	res.render('coverflow.ejs');
});

app.get('/clients/:id', (req, res) => {
	console.log(req.params);
	res.render('client.ejs');
})
