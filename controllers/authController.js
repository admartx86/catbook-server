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
    console.error('Error fetching dateJoined:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.bio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ bio: user.bio });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.location = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ location: user.location });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.editBio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.bio = req.body.bio;
    await user.save();

    res.status(200).json({ message: 'Bio updated successfully', bio: user.bio });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.editLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.location = req.body.location;
    await user.save();

    res.status(200).json({ message: 'Location updated successfully', location: user.location });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.profilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ profilePhoto: user.profilePhoto });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.editProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's profilePhoto with the new URL from S3
    user.profilePhoto = req.file ? req.file.location : '';

    await user.save();

    res
      .status(200)
      .json({ message: 'Profile photo updated successfully', profilePhoto: user.profilePhoto });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while updating profile photo', error });
  }
};

exports.user = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    res.status(200).json({
      username: user.username,
      realName: user.realName,
      email: user.email,
      dateJoined: user.dateJoined,
      bio: user.bio,
      location: user.location,
      profilePhoto: user.profilePhoto
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};
