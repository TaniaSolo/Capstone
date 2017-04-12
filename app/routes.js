var User       = require('../app/model/user');
module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // HOME SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
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
            user : req.user
        });
    });

    app.post('/edit_profile', isLoggedIn, function(req, res) {
        user            = req.user;
       
        console.log(req.body.firstName);
        console.log(req.body.lastName);
        console.log(req.body.address);
        console.log(req.body.password);

        User.findById(req.session.passport.user, function(err, user) {
        if (!user)
            return next(new Error('Could not load Document'));
        else {

            user.first = req.body.firstName;
            user.last = req.body.lastName;
            user.address = req.body.address;
            user.password = user.generateHash(req.body.password);
            user.preferences.faith = req.body.faith ? true: false;
            user.preferences.politics = req.body.politics? true: false;
            user.preferences.opinion = req.body.opinion ? true: false;
            user.preferences.health = req.body.health ? true: false;
            user.preferences.entertainment = req.body.entertainment ? true: false;
            user.preferences.travel = req.body.travel ? true: false;
            }
            user.save(function(err) {
            if (err)
                console.log('error');
            else {
                console.log('success');
                res.redirect('/profile');
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


// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
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
            res.redirect('/profile');
        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}