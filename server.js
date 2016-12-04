'use strict';

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const mysql = require('mysql');
const session = require('express-session');
const async = require('async');
const multer = require('multer');
const upload = multer({dest: 'public/img/'});
const fs = require('fs');

//setup heroku database
const pool = mysql.createPool({
    host: 'vergil.u.washington.edu',
    port: '8865',
    user: 'root',
    password: 'ou8inxs2ic',
    database: 'NutritionTracker'
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

app.use(session({
	secret: 'keyboard cat',
    cookie: { maxAge: 86400000 }, //24hrs
    resave: false,
    saveUninitialized: false
}));

server.listen(app.get('port'), function() {
    console.log('listening on port:', app.get('port'));
});

app.get('/', (req, res) => {
    res.render('login.ejs');
});

const trainerUsername = 'trainer';
const trainerPassword = 'password';

app.post('/login', (req, res) => {
	var username = req.body.username;
	var password = req.body.password;

	//check if trainer is logging in
	if (username == trainerUsername && password == trainerPassword) {

		req.session.isTrainer = true;
		
		req.session.user = {
			id: 0,
			firstName: 'Trainer',
			lastName: '',
			profileImgPath: 'img/ash.png'
		};

		res.redirect('/coverflow');

	} else {
		req.session.isTrainer = false;

		pool.getConnection((err, connection) => {
			if (err) {
				console.log(err);
				res.send(err);
			}

			var queryObj = connection.query("SELECT * FROM Client WHERE username = ? AND password = ?", 
			[username, password], (err, rows) => {
				
				if (err) {
					console.log(err);
					res.send(err);
				}

				if (rows.length) {
					//set session
					console.log('setting session for user: ' + rows[0].id);
					
					req.session.user = {
						id: rows[0].id,
						firstName: rows[0].firstName,
						lastName: rows[0].lastName,
						profileImgPath: rows[0].profileImgPath
					}

					console.log(req.session.user);
					
					res.redirect('/dashboard');
				} else {
					res.send('cant find user');
				}
				connection.release();
			});
			console.log(queryObj.sql);
		});	
    } 
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', (req, res) => {
	var first = req.body.firstname;
	var last = req.body.lastname;
	var username = req.body.username;
	var password = req.body.password;

	var registerQuery = "INSERT INTO Client (username, password, firstName, lastName, dateJoined) " +
						"VALUES (?, ?, ?, ?, ?)";

	pool.getConnection((err, connection) => {
		if (err) {
			console.log(err);
			res.send(err);
		}

		var registerQueryObj = connection.query(registerQuery, [username, password, first, last, "NOW()"], (err, rows) => {
			if (err) {
				console.log(err);
				res.send(err);
			}

			var userId = rows.insertId;

			//set session
			req.session.user = {
				id: userId,
				firstName: first,
				lastName: last,
				profileImgPath: 'img/avatar5.png'
			};

			var nutritionQuery = "INSERT INTO ClientNutrition (clientId, maxCalories, minWater, " +
																"maxProtein, maxFats, maxCarbs) " +
									"VALUES (?, 2000, 64, 56, 78, 325)";

			var nutritionQueryObj = connection.query(nutritionQuery, [userId], (err, rows) => {
				if (err) {
					console.log(err);
					res.send(err);
				}

				res.redirect('/dashboard');
				connection.release();
			});
			console.log(nutritionQueryObj.sql);
		});
		console.log(registerQueryObj.sql);
	}); 
});

app.get('/dashboard', (req, res) => {
	console.log(req.session.user);
	var data = {
		user: req.session.user
	};
	
	res.render('dashboard.ejs', data);
});

app.get('/food', (req, res) => {
    var food = "SELECT * FROM Food";
    
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        
        connection.query(food, (err, rows) => {
            if (err) {
                console.log(err);
            } else {

                var data = {
                    'food': rows
                }
                res.render('food.ejs', data);

            }
        });
    });
});

app.get('/addFood', (req, res) => {
    res.render("food.ejs");

});

app.post('/addFood', (req, res) => {
    console.dir(req.body);

    var name = req.body.name;
    var description = req.body.description;
    var cals = req.body.calories;
    var fat = req.body.fat;
    var protein = req.body.protein;
    var carbs = req.body.carbs;
    var category = req.body.category;
    var type = req.body.type;
    var servingSize = req.body.servingSize;

    console.log(name);
    console.log(description);
    console.log(cals);
    console.log(fat);
    console.log(protein);
    console.log(carbs);
    console.log(category);
    console.log(type);

    var query = 'INSERT INTO Food (foodName, description, category, calories, fat, protein, carbs, foodType, servingSize) ' +
        'VALUES(' + "'" + name + "'" + "," + "'" + description + "'" + "," + "'" + category + "'" + "," + cals + "," + fat + "," + protein + "," + carbs + "," + "'" + type + "'" + "," +
        "'" + servingSize + "'" + ')';

    console.log(query);
    pool.getConnection((err, connection) => {

        connection.query(query, (err, rows) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Food was added!");

                res.redirect("/food");
            }

        });

    });



});

app.get('/editFood', (req, res) => {
    res.render('food.ejs');
});

app.post('/editFood', (req, res) => {

	console.dir(req.body);

	var id = req.body.id;
    var name = req.body.name;
    var description = req.body.description;
    var cals = req.body.calories;
    var fat = req.body.fat;
    var protein = req.body.protein;
    var carbs = req.body.carbs;
    var category = req.body.category;
    var type = req.body.type;
    var servingSize = req.body.servingSize;


    // console.log(id);



    var query = 'UPDATE Food SET foodName=' + "'" + name + "'" + ", description = " + "'" + description + "'" + ", category=" + "'" + category 
  					  + "'" + ",calories=" + cals + ", fat=" + fat + ", protein=" + protein + ",carbs=" + carbs + ",foodType=" + "'" + type + "'" +
    				 ", servingSize=" + "'" + servingSize + "'" 
    		    +" WHERE id=" + id;

    console.log(query);


    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err);
            res.send(err);
        }

        connection.query(query, (err,rows) => {

        	if(err) {
        		console.log(err);
        	} else {
        		console.log("Food was edited!");
        		res.redirect('/food');
        	}

        });


    });

});
app.get('/diary', (req, res) => {
    res.render('diary.ejs');
});

app.get('/coverflow', (req, res) => {

	pool.getConnection((err, connection) => {

		if (err) {
			console.log(err);
			res.send(err);
		}

		var query = "SELECT * FROM Client";
		
		connection.query(query, (err, rows) => {
			
			
			var data = {
				user: req.session.user,
				clients: rows
			}

			res.render('coverflow.ejs', data);
			connection.release();
		});
	});
});

app.get('/client/:id', (req, res) => {
	console.log(req.params);
	res.render('client.ejs');
});

app.post('/upload-photo', upload.single('avatar'), function(req, res)  {
	console.log(req.file);
	var tempPath = req.file.path;
	var targetPath = 'public/img/' + req.file.originalname;

	var src = fs.createReadStream(tempPath);
	var dest = fs.createWriteStream(targetPath);
	src.pipe(dest);
	
	src.on('end', function() {
		pool.getConnection(function(err, connection) {
			if (err) {
				console.log(err);
				res.send(err);
			}

			var filePath = 'img/' + req.file.originalname;
			var clientId = req.body.clientId;

			var query = connection.query("UPDATE Client SET profileImgPath = ? WHERE id = ?", [filePath, clientId], function(err, rows) {
				if (err) {
					console.log(err);
					res.send(err);
				}

				req.session.user.profileImgPath = filePath;

				if (req.session.isTrainer) {
					res.redirect('/coverflow');
				} else {
					res.redirect('/dashboard');
				}
				connection.release();
			});
			console.log(query.sql);	
		});
	});

	src.on('error', function(err) {
		res.send('error');
	});
});

app.get('/logout', function(req, res) {
	req.session.destroy();
	res.redirect('/');
});


app.get('/clients/:id', (req, res) => {
    console.log(req.params);
    res.render('client.ejs');
});

