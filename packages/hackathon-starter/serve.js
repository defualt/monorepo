/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
// const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
// const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const fs = require('fs-extra');

import makeUserModel from './models/makeUserModel';
import makePassportConfig from './config/passport';

const apolloIntegration = require('./apolloIntegration').default;

let pwdTxt;
if (fs.existsSync('/app/pwd.txt')) {
  pwdTxt = fs.readFileSync('/app/pwd.txt', 'utf8').trim();
}


function getDirname() {
  if (pwdTxt && __dirnameBeforeCompiled) {
    const toReturn = __dirnameBeforeCompiled.replace(pwdTxt, process.cwd());
    // console.log('__dirnameBeforeCompiled', __dirnameBeforeCompiled);
    // console.log('pwdTxt', pwdTxt);
    // console.log('process.cwd', process.cwd())
    // console.log('indexof', __dirnameBeforeCompiled.indexOf(pwdTxt));
    // console.log(__dirnameBeforeCompiled.replace(pwdTxt,'xxxxxxx'))
    // console.log('toReturn',toReturn)
    return toReturn;
  }
  return typeof __dirnameBeforeCompiled !== "undefined"
    ? __dirnameBeforeCompiled
    : __dirname;
}

// const upload = multer({ dest: path.join(getDirname(), 'uploads') });

module.exports = function (settings){
  const nameSpace = settings.nameSpace;
  const isFreshApp = !settings.app;
  const app = settings.app || express();

  const User = makeUserModel();


  function ns(str) {
    if (!nameSpace) {
      return str;
    }
    // return str;
    if (str === '/') {
      return `/${nameSpace}`;
    }
    return `/${nameSpace}${str}`;
  }


  /**
   * Load environment variables from .env file, where API keys and passwords are configured.
   */
  dotenv.load({ path: path.resolve(getDirname(), './envexample') });

  /**
   * Controllers (route handlers).
   */
  const homeController = require('./controllers/home')(ns);
  const userController = require('./controllers/user')(ns,User);
  const apiController = require('./controllers/api')(ns);
  const contactController = require('./controllers/contact')(ns);

  /**
   * API keys and Passport configuration.
   */
  
  const passportConfig = makePassportConfig(ns,User);

  /**
   * Create Express server.
   */

  /**
   * Connect to MongoDB.
   */
  // mongoose.Promise = global.Promise;
  // mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
  // mongoose.connection.on('error', (err) => {
  //   console.error(err);
  //   console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  //   process.exit();
  // });

  /**
   * Express configuration.
   */
  // app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
  // app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
  // app.engine('pug', require('pug').__express)
  app.set('views', path.join(getDirname(), 'views'));
  app.set('view engine', 'pug');
  app.locals.asdf111 = 'zxcv';
  app.locals.pugNs = ns;

  app.use(expressStatusMonitor({
    path: ns('/status'),
  }));
  app.use(compression());
  app.use(sass({
    src: path.join(getDirname(), 'public'),
    dest: path.join(getDirname(), 'public')
  }));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(expressValidator());
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
      url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
      autoReconnect: true,
      clear_interval: 3600
    })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use((req, res, next) => {
    if (/*req.path === ns('/api/upload') ||*/ req.url.indexOf(nameSpace) === -1) {
      next();
    } else {
      lusca.csrf()(req, res, next);
    }
  });
  app.use(lusca.xframe('SAMEORIGIN'));
  app.use(lusca.xssProtection(true));
  app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });
  app.use((req, res, next) => {
    // After successful login, redirect back to the intended page

    if (!req.user &&
        req.path !== ns('/login') &&
        req.path !== ns('/signup') &&
        !req.path.match(new RegExp(`^${ns('/social')}`)) &&
        !req.path.match(/\./)) {
      req.session.returnTo = req.path;
    } else if (req.user &&
        req.path === ns('/account')) {
      req.session.returnTo = req.path;
    }
    next();
  });
  app.use(express.static(path.join(getDirname(), 'public'), { maxAge: 31557600000 }));

  /**
   * Primary app routes.
   */
  app.get(ns('/'), homeController.index);
  app.get(ns('/login'), userController.getLogin);
  app.post(ns('/login'), userController.postLogin);
  app.get(ns('/logout'), userController.logout);
  app.get(ns('/forgot'), userController.getForgot);
  app.post(ns('/forgot'), userController.postForgot);
  app.get(ns('/reset/:token'), userController.getReset);
  app.post(ns('/reset/:token'), userController.postReset);
  app.get(ns('/signup'), userController.getSignup);
  app.post(ns('/signup'), userController.postSignup);
  app.get(ns('/contact'), contactController.getContact);
  app.post(ns('/contact'), contactController.postContact);
  app.get(ns('/account'), passportConfig.isAuthenticated, userController.getAccount);
  app.get(ns('/account.json'), passportConfig.isAuthenticated, userController.getAccountJson);
  apolloIntegration({ app,User });
  app.post(ns('/account/profile'), passportConfig.isAuthenticated, userController.postUpdateProfile);
  app.post(ns('/account/password'), passportConfig.isAuthenticated, userController.postUpdatePassword);
  app.post(ns('/account/delete'), passportConfig.isAuthenticated, userController.postDeleteAccount);
  app.get(ns('/account/unlink/:provider'), passportConfig.isAuthenticated, userController.getOauthUnlink);

  /**
   * API examples routes.
   */
  app.get(ns('/api'), apiController.getApi);
  app.get(ns('/api/lastfm'), apiController.getLastfm);
  app.get(ns('/api/nyt'), apiController.getNewYorkTimes);
  app.get(ns('/api/aviary'), apiController.getAviary);
  app.get(ns('/api/steam'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getSteam);
  app.get(ns('/api/stripe'), apiController.getStripe);
  app.post(ns('/api/stripe'), apiController.postStripe);
  app.get(ns('/api/scraping'), apiController.getScraping);
  app.get(ns('/api/twilio'), apiController.getTwilio);
  app.post(ns('/api/twilio'), apiController.postTwilio);
  app.get(ns('/api/clockwork'), apiController.getClockwork);
  app.post(ns('/api/clockwork'), apiController.postClockwork);
  app.get(ns('/api/foursquare'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFoursquare);
  app.get(ns('/api/tumblr'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTumblr);
  app.get(ns('/api/facebook'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
  app.get(ns('/api/github'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
  app.get(ns('/api/twitter'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
  app.post(ns('/api/twitter'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
  app.get(ns('/api/linkedin'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getLinkedin);
  app.get(ns('/api/instagram'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getInstagram);
  app.get(ns('/api/paypal'), apiController.getPayPal);
  app.get(ns('/api/paypal/success'), apiController.getPayPalSuccess);
  app.get(ns('/api/paypal/cancel'), apiController.getPayPalCancel);
  app.get(ns('/api/lob'), apiController.getLob);
  // app.get(ns('/api/upload'), apiController.getFileUpload);
  // app.post(ns('/api/upload'), upload.single('myFile'), apiController.postFileUpload);
  app.get(ns('/api/pinterest'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getPinterest);
  app.post(ns('/api/pinterest'), passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postPinterest);
  app.get(ns('/api/google-maps'), apiController.getGoogleMaps);

  /**
   * OAuth authentication routes. (Sign in)
   */
  app.get(ns('/social/instagram'), passport.authenticate('instagram'));
  app.get(ns('/social/instagram/callback'), passport.authenticate('instagram', { failureRedirect: ns('/login') }), (req, res) => {
    res.redirect(req.session.returnTo || ns('/'));
  });
  app.get(ns('/social/facebook'), passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
  app.get(ns('/social/facebook/callback'), passport.authenticate('facebook', { failureRedirect: ns('/login') }), (req, res) => {
    res.redirect(req.session.returnTo || ns('/'));
  });
  app.get(ns('/social/github'), passport.authenticate('github'));
  app.get(ns('/social/github/callback'), passport.authenticate('github', { failureRedirect: ns('/login') }), (req, res) => {
    res.redirect(req.session.returnTo || ns('/'));
  });
  app.get(ns('/social/google'), passport.authenticate('google', { scope: 'profile email' }));
  app.get(ns('/social/google/callback'), passport.authenticate('google', { failureRedirect: ns('/login') }), (req, res) => {
    res.redirect(req.session.returnTo || ns('/'));
  });
  app.get(ns('/social/twitter'), passport.authenticate('twitter'));
  app.get(ns('/social/twitter/callback'), passport.authenticate('twitter', { failureRedirect: ns('/login') }), (req, res) => {
    res.redirect(req.session.returnTo || ns('/'));
  });
  app.get(ns('/social/linkedin'), passport.authenticate('linkedin', { state: 'SOME STATE' }));
  app.get(ns('/social/linkedin/callback'), passport.authenticate('linkedin', { failureRedirect: ns('/login') }), (req, res) => {
    res.redirect(req.session.returnTo || ns('/'));
  });

  /**
   * OAuth authorization routes. (API examples)
   */
  app.get(ns('/social/foursquare'), passport.authorize('foursquare'));
  app.get(ns('/social/foursquare/callback'), passport.authorize('foursquare', { failureRedirect: ns('/api') }), (req, res) => {
    res.redirect(ns('/api/foursquare'));
  });
  app.get(ns('/social/tumblr'), passport.authorize('tumblr'));
  app.get(ns('/social/tumblr/callback'), passport.authorize('tumblr', { failureRedirect: ns('/api') }), (req, res) => {
    res.redirect(ns('/api/tumblr'));
  });
  app.get(ns('/social/steam'), passport.authorize('openid', { state: 'SOME STATE' }));
  app.get(ns('/social/steam/callback'), passport.authorize('openid', { failureRedirect: ns('/login') }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
  });
  app.get(ns('/social/pinterest'), passport.authorize('pinterest', { scope: 'read_public write_public' }));
  app.get(ns('/social/pinterest/callback'), passport.authorize('pinterest', { failureRedirect: ns('/login') }), (req, res) => {
    res.redirect(ns('/api/pinterest'));
  });

  /**
   * Error Handler.
   */
  // app.use(errorHandler());

  /**
   * Start Express server.
   */
  if (isFreshApp){
    app.listen(app.get('port'), () => {
      console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
      console.log('  Press CTRL-C to stop\n');
    });
  }

  return app;
};
