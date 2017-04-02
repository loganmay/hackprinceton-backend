// Get packages
var express = require('express');
var app = express();
var exphbs  = require('express-handlebars');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var bodyParser = require('body-parser');
var JSONStream = require('JSONStream');

// Configure server
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// Enable bodyParser
app.use(bodyParser.urlencoded({ extended: true }));

// Set up handlebars as view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// GET Routes
app.get('/', function(req, res) {
	console.log("Still here");
	var users = [];
	fs.readdir('users', function(err, files){
		if(err) throw err;
		files.forEach(function(file) {
    	 fs.readFile(path.join(__dirname, 'users', file), {encoding: 'utf8'}, function (err, data) {
    	 	if(err) throw err;
       	var user = JSON.parse(data);
       	users.push(user);
       	if (users.length === files.length) res.send(users);
			});
		});
	});
});

app.get('/test', function (req, res) {
    res.render('home');
});

app.get('/:username', function(req, res) {
	// var username = req.params.username;
	// res.send(username);
	res.render('home')
});

// POST Routes
app.post('/:username', function(req,res) {
	var busID = "1";
	var busFP = path.join(__dirname, 'db/buses', busID) + '.json';
	var bus = JSON.parse(busFP);
	var userID = "123";
	var userFP = path.join(__dirname, 'db/users', userID) + '.json';
	var user = JSON.parse(userFP);
	//  TODO sync ^ with Andrew's request

	// Boarding
	if (!user.riding && !bus.full) {

		user.riding = true
		bus.riders.push(userID);

		fs.unlink(userFP);
		fs.writeFileSync(userFP, JSON.stringify(user, null, 2), {encoding: 'utf8'})

		fs.unlink(busFP);
		fs.writeFileSync(busFP, JSON.stringify(bus, null, 2), {encoding: 'utf8'})

		// TODO function welcomeUser (open door, etc.)
		// TODO async always running loop function to handleUser/treatUser
	}

	// Exiting
	if (user.riding) {
		user.riding = false;
		var userIndex = bus.riders.indexOf(userID);
		if (userIndex > -1) {
    	array.splice(userIndex, 1);
		}
		// TODO update db
		// TODO say goodbye
	}
});

// Listen 
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// TODO for gyroscope, define a reply that activates a
// bluetooth stream from the android phone

