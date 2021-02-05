/**
 * CREDIT: https://morioh.com/p/8d907b1b9ee0
 */
/**
 * We need to include the packages in our Node.js application, create the 
 * following variables and require the modules:
 */
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

/**
 * connect to mysql
 * Remember to change the connection details to your own.
 */
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'member_db'
});

/**
 * Express is what we'll use for our web applications, this includes packages 
 * useful in web development, such as sessions and handling HTTP requests, to
 *  initialize it we can do:
 */
var app = express();
/**
 * We now need to let Express know we'll be using some of its packages:
 * Make sure to change the secret code for the sessions, the sessions package 
 * is what we'll use to determine if the user is logged-in, the bodyParser
 *  package will extract the form data from our login.html file.
 */
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

/**
 * We now need to display our login.html file to the client:
 * When the client connects to the server the login page will be displayed, the 
 * server will send the login.html file.
 */
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

/**
 * We need to now handle the POST request, basically what happens here is when 
 * the client enters their details in the login form and clicks the submit 
 * button, the form data will be sent to the server, and with that data our 
 * login script will check in our MySQL -member- table to see if the details    are correct.
 */
app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM member WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home');
            } else {
                response.send('Incorrect Username and/or Password!');
            }            
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

/**
 * What happens here is we first create the POST request in our script, our 
 * login form action is to: auth so we need to use that here, after, we create 
 * two variables, one for the username and one for the password, we then check 
 * to see if the username and password exist, if they are we query our MySQL 
 * table: member and check to see if the details exist in the table.

If the result returned from the table exists we create two session variables,
one to determine if the client is logged in and the other will be their username.

If no results are returned we send to the client an error message, this message 
will let the client know they've entered the wrong details.

If everything went as expected and the client logs in they will be redirected to the home page.

The home page we can handle with another GET request:
 */
app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        response.send('Welcome back, ' + request.session.username + '!');
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});

//Our web application needs to listen on a port, for testing purposes we'll use port 3000:
app.listen(3000);