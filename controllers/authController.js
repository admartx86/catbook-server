const passport = require('passport');
const { generatePassword } = require('../lib/passwordUtils');
const User = require('../models/user');

exports.login = (req, res, next) => {
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
};

exports.logout = (req, res) => {
  try {
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
};

exports.register = (req, res, next) => {
  const saltHash = generatePassword(req.body.password);
  const salt = saltHash.salt;
  const hash = saltHash.hash;
  const newUser = new User({
    realName: req.body.realName,
    username: req.body.username,
    hash: hash,
    salt: salt
  });
  newUser
    .save()
    .then((user) => {
      res.json({ message: 'Registration successful', user });
    })
    .catch((error) => {
      res.status(500).json({ message: 'An error occurred' });
    });
};

exports.editRealName = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.realName = req.body.realName;
    await user.save();
    res.status(200).json({ message: 'Real name updated', user });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.dateJoined = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const dateJoined = user.dateJoined;

    res.status(200).json({ message: 'Date joined retrieved', dateJoined });
  } catch (error) {
    console.error("Error fetching dateJoined:", error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

