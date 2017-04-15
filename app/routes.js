var User       = require('../app/model/user');
var async       = require('async');
var crypto       = require('crypto');
var nodemailer = require("nodemailer");
var smtpTransportLib = require('nodemailer-smtp-transport');
var helper = require('sendgrid').mail;
 
from_email = new helper.Email("");

var sg   = require('sendgrid')('');


module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {

        if (req.session.id && req.user) {
                res.redirect('/profile');
            } else {
                res.render('index.ejs');
        } 
    });

    // HOME SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {

        if(req.user && req.user.preferences) {
            var userPreferences = req.user.preferences;
            
            if(userPreferences.politics) {
                res.redirect('/politics');
            } else if(userPreferences.travel) {
                 res.redirect('/travel');
            } else if(userPreferences.opinion) {
                res.redirect('/opinion');
            }  else if(userPreferences.health) {
                res.redirect('/health');
            } else if(userPreferences.faith) {
                res.redirect('/faith');
            } else if(userPreferences.entertainment) {
                res.redirect('/entertainment');
            } else if(userPreferences.sport) {
                res.redirect('/sport');
            } else if(userPreferences.tech) {
                res.redirect('/tech');
            } else {
                res.render('edit_profile.ejs', {
                    user : req.user
                });
        }
        } else {
            res.render('edit_profile.ejs', {
                user : req.user
            });
        }
    });
	
	// POLITICS SECTION =========================
	   app.get('/politics', isLoggedIn, function(req, res) {
        res.render('politics.ejs', {
            user : req.user
        });
    });

    // TRAVEL SECTION =========================
	   app.get('/travel', isLoggedIn, function(req, res) {
        res.render('travel.ejs', {
            user : req.user
        });
    });
	
		// FAITH SECTION =========================
	   app.get('/faith', isLoggedIn, function(req, res) {
        res.render('faith.ejs', {
            user : req.user
        });
    });
	
			// Entertainment SECTION =========================
	   app.get('/entertainment', isLoggedIn, function(req, res) {
        res.render('entertainment.ejs', {
            user : req.user
        });
    });
	
			// HEALTH SECTION =========================
	   app.get('/health', isLoggedIn, function(req, res) {
        res.render('health.ejs', {
            user : req.user
        });
    });
	
				// OPINION SECTION =========================
	   app.get('/opinion', isLoggedIn, function(req, res) {
        res.render('opinion.ejs', {
            user : req.user
        });
    });
	
			// SPORTS SECTION =========================
	   app.get('/sport', isLoggedIn, function(req, res) {
        res.render('sport.ejs', {
            user : req.user
        });
    });
	
				// TECH SECTION =========================
	   app.get('/tech', isLoggedIn, function(req, res) {
        res.render('tech.ejs', {
            user : req.user
        });
    });


	
    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // profile SECTION =========================
    app.get('/edit_profile', isLoggedIn, function(req, res) {
        res.render('edit_profile.ejs', {
            user : req.user, message: req.flash('editMessage')
        });
    });


//RESET PASWORD  ====================
 app.get('/reset', isLoggedIn, function(req, res) {
        res.render('reset.ejs', {
            user : req.user
        });
    });

    app.post('/edit_profile', isLoggedIn, function(req, res) {
        user            = req.user;
       
        console.log(req.body.firstName);
        console.log(req.body.lastName);
        console.log(req.body.address);
        console.log(req.body.password);
		 console.log(user.password);

        User.findById(req.session.passport.user, function(err, user) {
        if (!user)
            return next(new Error('Could not load Document'));
			 else if(req.body.firstName.length == 0){
                       
						req.flash('editMessage', 'First Name can not be blank! No change has been made to your profile');
                return res.redirect('/edit_profile');
                    } else if(req.body.lastName.length == 0){
                       
						req.flash('editMessage', 'Last Name can not be blank! No changes have been made to your profile');
                return res.redirect('/edit_profile');
                     } else if(!req.param('faith') && !req.param('politics') 
                     && !req.param('opinion') && !req.param('health') 
                     && !req.param('entertainment') && !req.param('travel')
					 && !req.param('sport') && !req.param('tech')){
					 req.flash('editMessage', 'At least one preference should be added! No changes have been made to your profile');
                return res.redirect('/edit_profile');
                       
                    }else if(req.body.password.trim() != req.body.conpassword.trim()){
                       
						req.flash('editMessage', 'Password and confirm password dont match! No changes have been made to your profile');
                return res.redirect('/edit_profile');
                     }else if(req.body.password.trim().length<6){
                       
						req.flash('editMessage', 'Password must contain atleast 6 characters. A strong password is advisable (combination of letters , numbers and special characters)');
                return res.redirect('/edit_profile');
                     }
			
        else {

            user.first = req.body.firstName;
            user.last = req.body.lastName;
            user.address = req.body.address;
			
			if(req.body.password!="P@ssw0rd123"){
            user.password = user.generateHash(req.body.password);
			}
			
            user.preferences.faith = req.body.faith ? true: false;
            user.preferences.politics = req.body.politics? true: false;
            user.preferences.opinion = req.body.opinion ? true: false;
            user.preferences.health = req.body.health ? true: false;
            user.preferences.entertainment = req.body.entertainment ? true: false;
            user.preferences.travel = req.body.travel ? true: false;
			user.preferences.sport = req.body.sport ? true: false;
            user.preferences.tech = req.body.tech ? true: false;
			
			
			
            }
            user.save(function(err) {
            if (err)
                console.log('error');
            else {
                console.log('success');
				req.flash('editMessage', 'Profile Updated Successfully!');
                res.redirect('/edit_profile');
            }
            });
        }); 
});

    

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        //Forgot password
        app.get('/forgotPassword', function(req, res) {
            res.render('forgotPassword', {
             user: req.user
            });
        });
        
        app.post('/forgotPassword', function(req, res, next) {
        async.waterfall([
            function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
            },
            function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                req.flash('error', 'No account with that email address exists.');
                return res.redirect('/forgotPassword');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                done(err, token, user);
                });
            });
            },
            function(token, user, done) {

                var to_email = new helper.Email(user.email);
                var subject = "News Agregation System Password Reset";
                var content = new helper.Content("text/plain", "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
                 "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                 "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                 "If you did not request this, please ignore this email and your password will remain unchanged.\n");
                mail = new helper.Mail(from_email, subject, to_email, content);

            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON()
                });

                sg.API(request, function(error, response) {
                    if(error) {
                        console.log(error.message);
                    } else if (response) {
                        console.log(response.statusCode);
                        console.log(response.body);
                        console.log(response.headers);
                        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                        done(error, 'done');
                    }
                });
            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/forgotPassword');
        });
    });

    app.get('/reset/:token', function(req, res) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgotPassword');
            }
            res.render('reset.ejs', {
            user: req.user
            });
        });
    });

    app.post('/reset/:token', function(req, res) {
        async.waterfall([
            function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('back');
                }

                user.password = user.generateHash(req.body.password);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                req.logIn(user, function(err) {
                    done(err, user);
                });
                });
            });
            },
            function(user, done) {

                 req.flash('success', 'Success! Your password has been changed.');
                 res.redirect('/login');

                //  var to_email = new helper.Email(user.email);
                //  var subject = "News Agregation System Your password has been changed";
                //  var content = new helper.Content("Hello,\n\n" +
                //  "This is a confirmation that the password for your account " + user.email + 
                //  " has just been changed.\n");
                // var mail = new helper.Mail(from_email, subject, to_email, content);

            // var request1 = sg.emptyRequest({
            //     method: 'POST',
            //     path: '/v3/mail/send',
            //     body: mail.toJSON()
            //     });

            //     sg.API(request1, function(error, response) {
            //         if(error) {
            //             console.log(error.message);
            //         } else if (response) {
            //             console.log(response.statusCode);
            //             console.log(response.body);
            //             console.log(response.headers);

            //             req.flash('success', 'Success! Your password has been changed.');
            //             done(error);
            //         }
            //     });
            }
        ], function(err) {
            res.redirect('/');
        });
    });

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/edit_profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.email    = undefined;
        user.password = undefined;
        user.save(function(err) {
            res.redirect('/edit_profile');
        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    } 
}