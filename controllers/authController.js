const passport = require('passport');
const { generatePassword } = require('../lib/passwordUtils');
const User = require('../models/user');

const filterFollowing = (user) => {
  return {
    username: user.username,
    realName: user.realName,
    profilePhoto: user.profilePhoto,
    bio: user.bio,
    location: user.location,
    dateJoined: user.dateJoined
  };
};

const filterUser = (user) => {
  const { hash, salt, ...filteredUser } = user._doc ? user._doc : user;
  return filteredUser;
};

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

      const filteredUser = filterUser(user);
      return res.status(200).json({ message: 'Authentication successful', user: filteredUser });
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
      const { hash, salt, ...filteredUser } = user._doc;
      res.json({ message: 'Registration successful', user: filteredUser });
    })
    .catch((error) => {
      res.status(500).json({ message: 'An error occurred' });
    });
};

exports.profilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ profilePhoto: user.profilePhoto });
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

exports.bio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ bio: user.bio });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.dateJoined = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ dateJoined: user.dateJoined });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.editProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.profilePhoto = req.file ? req.file.location : '';
    await user.save();
    res
      .status(200)
      .json({ message: 'Profile photo updated successfully', profilePhoto: user.profilePhoto });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while updating profile photo', error });
  }
};

exports.editRealName = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.realName = req.body.realName;
    await user.save();
    res.status(200).json({ message: 'Real name updated', realName: user.realName });
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

exports.user = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    // .populate ('following', 'username realName profilePhoto bio location dateJoined')
    // .populate ('followers', 'username realName profilePhoto bio location dateJoined');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      username: user.username,
      realName: user.realName,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      location: user.location,
      dateJoined: user.dateJoined,
      following: user.following,
      followers: user.followers
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.followers = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      console.log(error.message);
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ followers: user.followers });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.following = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      console.log(error.message);
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ following: user.following });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.followersDetailed = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate(
      'followers',
      'username realName profilePhoto bio location dateJoined'
    );
    if (!user) {
      console.log(error.message);
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ followers: user.followers });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.followingDetailed = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate(
      'following',
      'username realName profilePhoto bio location dateJoined'
    );
    if (!user) {
      console.log(error.message);
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ following: user.following });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.follow = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userToFollow = await User.findOne({ username: req.body.profileUsername });
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userIsFollowing = user.following.some((userId) => userId.equals(userToFollow._id));
    if (userIsFollowing) {
      return res.status(400).json({ message: 'You are already following this user' });
    }
    
    userToFollow.followers.push(user);
    await userToFollow.save();
    
    user.following.push(userToFollow);
    await user.save();
    
    const filteredFollowing = user.following.map(filterFollowing);
    res.status(200).json({ message: 'Followed successfully', following: filteredFollowing });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.unfollow = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User (user) not found' });
    }

    const userToUnfollow = await User.findOne({ username: req.body.profileUsername });
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User (userToUnfollow) not found' });
    }

    const index = user.following
      .map((f) => f._id.toString())
      .indexOf(userToUnfollow._id.toString());

    if (index === -1) {
      return res.status(400).json({ message: 'You are not following this user (A)' });
    }

    user.following.splice(index, 1);
    await user.save();

    const index2 = userToUnfollow.followers
      .map((f) => f._id.toString())
      .indexOf(user._id.toString());

    if (index2 === -1) {
      return res.status(400).json({ message: 'You are not following this user (B)' });
    }

    userToUnfollow.followers.splice(index2, 1);
    await userToUnfollow.save();

    const filteredFollowing = user.following.map(filterFollowing);
    res.status(200).json({ message: 'Unfollowed successfully', following: filteredFollowing });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};