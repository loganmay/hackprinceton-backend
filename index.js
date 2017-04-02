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

// ----- GET Routes
app.get('/olli', function(req,res){
  var users = [];
  fs.readdir('db/users', function(err,files) {
    files.forEach(function(file) {
      fs.readFile(path.join(__dirname, 'db/users', file), {encoding: 'utf8'}, function (err, data) {
        var user = JSON.parse(data);
        users.push(user);
        if (users.length === files.length) {
            res.render('olli', {
              user: users[0]
            });
        }
      })
    })
  })
})

// ----- POST Routes
app.post('/:userid', function(req,res) {

  var userID = req.params.userid;
  var name = req.query.name;
  var blind = req.query.blind;
  var deaf = req.query.deaf;
  var busID = "1";
  var user = null;

  // -- Update and act on user
  var userFP = path.join(__dirname, 'db/users', userID) + '.json';
  fs.readFile(userFP, {encoding: 'utf8'}, function (err, data) {
    user = JSON.parse(data);
    if (!user.riding) {
      user.riding = true;
      // TODO beginRide(user);
    } else {
      user.riding = false;
      // TODO endRide(user);
    }

    if (user.name !== name) {
    	user.name = name;
    }

    if (user.blind !== blind) {
    	user.blind = blind;
    }

    if (user.deaf !== deaf) {
    	user.deaf = deaf;
    }

    // Sockets
    io.sockets.emit('update-latest', user);

     // -- Update and act on bus
  	var busFP = path.join(__dirname, 'db/buses', busID) + '.json';
  	fs.readFile(busFP, {encoding: 'utf8'}, function (err, data) {

    var bus = JSON.parse(data);
    var userIndex = bus.riders.indexOf(userID)

    if(userIndex == -1) {
      bus.riders.push(userID);
    } else {
      bus.riders.splice(userIndex, 1);
    }

    bus.latest = user;

    // Update file
    fs.unlinkSync(busFP);
    fs.writeFileSync(busFP, JSON.stringify(bus, null, 2), {encoding: 'utf8'});
    res.send(bus);

  	});

    // Update file
    fs.unlinkSync(userFP);
    fs.writeFileSync(userFP, JSON.stringify(user, null, 2), {encoding: 'utf8'});
  });

});

// Listen
var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


// Socket.io stuff
var io = require('socket.io').listen(server);
io.on('connection', function(socket){
  console.log('a user connected');
});

// TODO for gyroscope, define a reply that activates a
// bluetooth stream from the android phone

