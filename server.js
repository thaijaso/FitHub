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

        var query = "SELECT * FROM Client";

        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err);
                res.send(err);
            }

            connection.query(query, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                }

                var clientsObj = {
                    'clients': rows
                }

                res.render('coverflow.ejs', clientsObj);
                connection.release();
            });
        });
    } else {

        var query = "SELECT * FROM Client " +
            "WHERE username = " + "'" + username + "'" + " AND " + "password = " + "'" + password + "'";

        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err);
                res.send(err);
            }

            connection.query(query, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                }

                if (rows.length) {
                    res.redirect('/dashboard');
                } else {
                    res.send('cant find user');
                }
            });
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
        "VALUES (" + "'" + username + "'" + ", " + "'" + password + "'" + ", " +
        "'" + first + "'" + ", " + "'" + last + "'" + ", " + "NOW()" + ")";

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.send(err);
        }

        connection.query(registerQuery, (err, rows) => {
            if (err) {
                console.log(err);
                res.send(err);
            }

            var userId = rows.insertId;

            var nutritionQuery = "INSERT INTO ClientNutrition (clientId, maxCalories, minWater, " +
                "maxProtein, maxFats, maxCarbs) " +
                "VALUES (" + userId + ", 2000, 64, 56, 78, 325)";

            connection.query(nutritionQuery, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                }

                console.log(rows);
                res.redirect('/dashboard');
            });
        });
    });
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs');
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



    var query = 'UPDATE Food SET foodName=' + "'" + name + "'" + ", description = " + "'" + description + "'" + ", category=" + "'" + category + "'" + ",calories=" + cals + ", fat=" + fat + ", protein=" + protein + ",carbs=" + carbs + ",foodType=" + "'" + type + "'" +
        ", servingSize=" + "'" + servingSize + "'" + " WHERE id=" + id;

    console.log(query);


    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err);
            res.send(err);
        }

        connection.query(query, (err, rows) => {

            if (err) {
                console.log(err);
            } else {
                console.log("Food was edited!");
                res.redirect('/food');
            }

        });


    });

});

app.get('/deleteFood', (req, res) => {
    res.render('food.ejs');
});

app.post('/deleteFood', (req, res) => {
    console.dir("delete this id: " + req.body.gradId);

    var foodId = req.body.foodId;

    pool.getConnection(function(error, connection) {
        connection.query("DELETE FROM Food WHERE id =" + "'" + foodId + "'" + ";", function(err, rows) {

            if (err) {
                console.log(err);
            } else {
                console.log(foodId + " was deleted");
                connection.release();

                res.redirect('/food');

            }

        });

    });


});
app.get('/diary', (req, res) => {
    res.render('diary.ejs');
});


app.post('/addToDiary', (req,res) => {
    pool.getConnection(function(error, connection) {
        connection.query("DELETE FROM Food WHERE id =" + "'" + foodId + "'" + ";", function(err, rows) {

            if (err) {
                console.log(err);
            } else {
                console.log(foodId + " was deleted");
                connection.release();

                res.redirect('/food');

            }

        });

    });



    console.dir(req.body);

});

app.get('/coverflow', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err);
            res.send(err);
        }

        var query = "SELECT * FROM Client";

        connection.query(query, (err, rows) => {

            var clientsObj = {
                'clients': rows
            }

            res.render('coverflow.ejs', clientsObj);
            connection.release();
        });
    });
});

app.get('/clients/:id', (req, res) => {
    console.log(req.params);
    res.render('client.ejs');
});
