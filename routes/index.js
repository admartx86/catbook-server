const router = require('express').Router();
const passport = require('passport');
const { generatePassword } = require('../lib/passwordUtils');
const User = require('../models/user');

router.post('/login', (req, res, next) => {
    passport.authenticate('local', { keepSessionInfo: true }, async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: 'Authentication failed', info });
      }
      req.login(user, async (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.status(200).json({ message: 'Authentication successful', user });
      });
    })(req, res, next);
  });
  
  router.post('/logout', (req, res) => {
    try {
      console.log("Session before logout:", req.session);
  
      req.logout(() => {
        console.log("Logged out.");
        
        // Now destroy the session
        req.session.destroy((err) => {
          if (err) {
            console.error("Session destruction failed:", err);
            return res.status(500).json({ message: 'Logout failed' });
          }
          
          console.log("Session after destroy:", req.session);
          
          // Send success response
          res.status(200).json({ message: 'Logout successful' });
        });
      });
  
    }
    catch (err) {
      console.error("Logout failed:", err);
      res.status(500).json({ message: 'Logout failed' });
    }
  });
  
  router.post('/register', (req, res, next) => {
    const saltHash = generatePassword(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    const newUser = new User(
      {
        username: req.body.username,
        hash: hash,
        salt: salt
      }
    );
    newUser.save()
    .then((user) => {
      res.json({ message: 'Registration successful', user });  // Sending response back
    })
    .catch((error) => {
      res.status(500).json({ message: 'An error occurred' });
    });
  });

module.exports = router;