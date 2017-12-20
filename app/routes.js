var User       = require('../app/models/user');
var Friend       = require('../app/models/friend');
var sql = require("mssql");
var express = require ('express');
var app = express();
var bodyParser = require('body-parser')
app.use (bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));

var urlencodedParser = bodyParser.urlencoded ({ extended: true })

//configure database connection info:
    var config = {
        user: 'nodesubscriber',
        password: 'nodeliveproject*',
        server: 'mssql5.gear.host', 
        database: 'nodesubscriber',
        port: 1433
    };

async = require("async");
var path = require('path'),
    fs = require('fs');
module.exports = function(app, passport,server) {
    
    //input form data into database:
app.post('/subscribe', urlencodedParser, function (request, response) {  
            var firstname = request.body.firstname;
            console.log(firstname);
            var lastname = request.body.lastname;
            console.log(lastname);
            var email = request.body.email;
            console.log(email);

        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        
        conn.connect(function (err){
           
            if (err) {
                
                console.log(err);
                return;
            }
               
            req.query("INSERT INTO Subscriber (FirstName, LastName, Email) VALUES('"+ firstname +"', '"+ lastname +"', '"+ email +"')", function (err, recordset) { 
                 if (err) { 
                    console.log(err);
                 }
                else{
                   console.log(recordset); 
                }
                conn.close();
            });
        });    
    
    
response.redirect('/');
    
});

// run query to see all records from database and log to console
   app.get('/selectall', function (req, res) { 
    

        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        
        conn.connect(function (err){
           
            if (err) {
                
                console.log(err);
                return;
            }
               
            req.query("SELECT * FROM Subscriber", function (err, recordset) { 
                 if (err) { 
                    console.log(err);
                 }
                else{
                   console.log(recordset); 
                }
                conn.close();
            });
        });    
});
    
  /*  app.post('/login',
             passport.authenticate('local', {successRedirect: '/',
                                            failureRedirect: '/login',
                                            failureFlash: 'Invalid username or password',
                                            successFlash: 'Welcome!'})
             );
    
    var passport = require('passport');
    var localStrategy = require('passport-local').Strategy;
    
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordFiled: 'passwd',
        passReqToCallback: true,
        session: false},
        
        function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.verifyPassword(password)) {
                return done(null, false, {message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
                                   )); */
    
	app.get('/', function(request, response) {
		response.render('index.html');
	});
	app.get('/user', auth, function(request, response) {
		response.render('user.html', {
			user : request.user
		});
	});
	app.get('/index', function(request, response) {
		response.render('index.html');
	});
	app.get('/services', function(request, response) {
		response.render('services.html');
	});
	app.get('/about', function(request, response) {
		response.render('about.html');
	});
	app.get('/contact', function(request, response) {
		response.render('contact.html');
    });
    app.get('/admin', function(request, response) {
		response.render('admin.html');
	});
	app.get('/edit', auth, function(request, response) {
		response.render('edit.html', {
			user : request.user
		});
	});
	app.get('/about', auth, function(request, response) {
		response.render('about.html', {
			user : request.user
		});
	});
	app.get('/logout', function(request, response) {
		request.logout();
		response.redirect('/');
	});

		app.get('/login', function(request, response) {
			response.render('login.html', { message: request.flash('error') });
		});

		app.post('/login', passport.authenticate('login', {
			successRedirect : '/about', 
			failureRedirect : '/login', 
			failureFlash : true
		}));

		app.get('/signup', function(request, response) {
			response.render('signup.html', { message: request.flash('signuperror') });
		});


		app.post('/signup', passport.authenticate('signup', {
			successRedirect : '/about',
			failureRedirect : '/signup', 
			failureFlash : true 
		}));
		app.get('/edit', function(request, response) {
			response.render('edit.html', { message: request.flash('updateerror') });
		});


		app.post('/edit',  function (req, res){
				 var tempPath = req.files.file.path,
        			targetPath = path.resolve('./uploads/'+req.files.file.originalFilename);
    				if (path.extname(req.files.file.name).toLowerCase() === '.png') {
        				fs.rename(tempPath, './uploads/image_'+req.user._id, function(err) {
            					if (err) throw err;
            				console.log("Upload completed!");
        				});
    				}
 			 User.findOne({ 'user.email' :  req.body.email }, function(err, user) {
                		if (err){ return done(err);}
                		if (user)
                    			user.updateUser(req, res)

                         });
  		});
		
		app.get('/profile', auth, function(request, response) {
			var query = Friend.find({'friend.mainfriendid': request.user._id}, { 'friend.anotherfriendid': 1 });
			query.exec(function(err, friends) {

      		if (!err) {
		var frdDetails = []

		async.each(friends,
    			function(friend, callback){
				if(friend.friend.anotherfriendid == ''){
			console.log('No Friend')
				}else{
    					User.findById(friend.friend.anotherfriendid, function(err, user) {
						frdDetails.push(user.user.name+', '+user.user.address);
 						callback();
					});
   				}
  			},
  			function(err){
         			response.render('profile.html', {
					user : request.user,
					friends: frdDetails
				});
  			}
		);
       		} else {
         		res.send(JSON.stringify(err), {
            			'Content-Type': 'application/json'
         		}, 404);
      		}
   		});

	});

	app.get('/search_member', function(req, res) {
   		var regex = new RegExp(req.query["term"], 'i');

   		var query = User.find({ $and: [ {'user.name': regex}, { _id: { $ne: req.user._id } } ] } ).limit(20);
        
      // Execute query in a callback and return users list
  		query.exec(function(err, users) {
      		if (!err) {
         		// Method to construct the json result set

         		res.send(users, {
            			'Content-Type': 'application/json'
         		}, 200);
      		} else {
         		res.send(JSON.stringify(err), {
            			'Content-Type': 'application/json'
         		}, 404);
      		}
   		});
	});

		app.post('/friend',  function (request, response){
				Friend.findOne({ $and: [ {'friend.mainfriendid': request.param('mainfriendid')}, { 'friend.anotherfriendid': request.param('anotherfriendid') } ] }, function(err, friend) {
            	    		if (err){ return done(err);}
                    		if (friend) {
				response.redirect('/profile');

                    		} else {
				if(request.param('anotherfriendid') != ''){
				var newFriend            = new Friend();
 			 	newFriend.friend.mainfriendid = request.param('mainfriendid');
				newFriend.friend.anotherfriendid = request.param('anotherfriendid');
	 			newFriend.save();
				}
				response.redirect('/profile');
				}
 				});
  		});



// GET /auth/facebook
// Use passport.authenticate() as route middleware to authenticate the
// request. The first step in Facebook authentication will involve
// redirecting the user to facebook.com. After authorization, Facebook will
// redirect the user back to this application at /auth/facebook/callback
		app.get('/auth/facebook',
  			passport.authenticate('facebook',{ scope : 'email' }));

// GET /auth/facebook/callback
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
		app.get('/auth/facebook/callback',
  			passport.authenticate('facebook', { 
				successRedirect : '/about', 	
				failureRedirect: '/login' }));





// GET /auth/twitter
// Use passport.authenticate() as route middleware to authenticate the
// request. The first step in Twitter authentication will involve redirecting
// the user to twitter.com. After authorization, the Twitter will redirect
// the user back to this application at /auth/twitter/callback
app.get('/auth/twitter',
  passport.authenticate('twitter'));

// GET /auth/twitter/callback
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { 
				successRedirect : '/about', 	
				failureRedirect: '/login' }));


// GET /auth/google
// Use passport.authenticate() as route middleware to authenticate the
// request. The first step in Google authentication will involve
// redirecting the user to google.com. After authorization, Google
// will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope : ['profile', 'email'] }));

// GET /auth/google/callback
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback',
  passport.authenticate('google', { 
				successRedirect : '/about', 	
				failureRedirect: '/login' }));


var io = require('socket.io').listen(server);

var usernames = {};

io.sockets.on('connection', function (socket) {

  socket.on('adduser', function(username){
    socket.username = username;
    usernames[username] = username;
    io.sockets.emit('updateusers', usernames);
  });

  socket.on('disconnect', function(){
    delete usernames[socket.username];
    io.sockets.emit('updateusers', usernames);
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });
});

};
function auth(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
