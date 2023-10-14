const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const Meow = require('../models/meow');
const User = require('../models/user');

const deleteFileFromS3 = async (bucket, key) => {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const deleteParams = {
    Bucket: bucket,
    Key: key
  };

  try {
    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`Successfully deleted ${key} from ${bucket}`);
  } catch (err) {
    console.log('Error deleting file from S3:', err);
  }
};

exports.createMeow = async (req, res) => {
  try {
    const { author, isAReply, isARemeow, replyToMeowId, remeowToMeowId } = req.body;
    const user = await User.findOne({ username: author });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const meowData = {
      ...req.body,
      author: user._id,
      meowMedia: req.file ? req.file.location : '',
      isAReply: false,
      isARemeow: false
    };

    if (isAReply && replyToMeowId) {
      console.log('replying!');
      const originalMeow = await Meow.findById(replyToMeowId).populate('author');
      if (!originalMeow) {
        return res.status(404).json({ message: 'Original Meow not found' });
      }

      meowData.isAReply = true;
      meowData.repliedToMeow = replyToMeowId;
      meowData.repliedToAuthor = originalMeow.author.username;

      originalMeow.repliedBy.push(user._id);
      await originalMeow.save();
    }

    if (isARemeow && remeowToMeowId) {
      console.log('remeowing!');
      const originalMeow = await Meow.findById(remeowToMeowId);
      if (!originalMeow) {
        return res.status(404).json({ message: 'Original Meow not found' });
      }
      if (!originalMeow.remeowedBy.includes(user._id)) {
        originalMeow.remeowedBy.push(user._id);
        await originalMeow.save();
      }

      meowData.isARemeow = true;
      meowData.remeowedBy = user._id;
      meowData.embeddedMeow = remeowToMeowId;
    }

    const newMeow = new Meow(meowData);
    const savedMeow = await newMeow.save();
    const populatedMeow = await Meow.findById(savedMeow._id).populate(
      'author',
      'username realName profilePhoto'
    );
    res.status(201).json(populatedMeow);
  } catch (error) {
    res.status(400).json({
      message:
        'Error creating Meow. Check that the file size does not exceed limit of 50 MB. Also check that the file format is supported. Supported formats: .mp4, .webm, .ogg, .mov, .avi, .wmv, .m4v, .jpg, .jpeg, .png, .gif, .bmp',
      error
    });
  }
};

exports.getMeow = async (req, res) => {
  console.log('ID:', req.params.meowId);
  try {
    const meow = await Meow.findById(req.params.meowId).populate(
      'author',
      'username realName profilePhoto'
    );
    console.log('Populated Meow:', meow);
    res.status(200).json(meow);
  } catch (error) {
    res.status(404).json({ message: 'Meow not found', error });
  }
};

exports.updateMeow = async (req, res) => {
  try {
    const updatedMeow = await Meow.findByIdAndUpdate(req.params.meowId, req.body, { new: true });
    res.status(200).json(updatedMeow);
  } catch (error) {
    res.status(400).json({ message: 'Error updating Meow', error });
  }
};

exports.deleteMeow = async (req, res) => {
  try {
    const meowToDelete = await Meow.findById(req.params.meowId);
    if (!meowToDelete) {
      return res.status(404).json({ message: 'Meow not found' });
    }

    if (meowToDelete.isARemeow && meowToDelete.embeddedMeow) {
      const originalMeow = await Meow.findById(meowToDelete.embeddedMeow);
      if (originalMeow) {
        const index = originalMeow.remeowedBy.indexOf(meowToDelete.author);
        if (index !== -1) {
          originalMeow.remeowedBy.splice(index, 1);
          await originalMeow.save();
        }
      }
    }

    if (meowToDelete.meowMedia) {
      const s3FilePath = meowToDelete.meowMedia;
      const s3FileKey = s3FilePath.split('/').pop();
      await deleteFileFromS3(process.env.S3_BUCKET, s3FileKey);
    }

    await Meow.findByIdAndDelete(req.params.meowId);

    const placeholderMeow = new Meow({
      _id: meowToDelete._id,
      author: meowToDelete.author,
      createdAt: meowToDelete.createdAt,
      isADirectRemeow: false,
      isAPlaceholder: true,
      isARemeow: meowToDelete.isARemeow,
      isAReply: meowToDelete.isAReply,
      isPinned: false,
      likedBy: meowToDelete.likedBy,
      meowMedia: '',
      meowText: 'This meow has been deleted.',
      remeowedBy: meowToDelete.remeowedBy,
      repliedBy: meowToDelete.repliedBy,
      repliedToMeow: meowToDelete.repliedToMeow
    });

    await placeholderMeow.save();

    res
      .status(200)
      .json({ message: 'Meow and any associated media deleted and replaced with placeholder' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting Meow', error });
    console.log('Error deleting Meow', error.message);
  }
};

exports.getAllMeows = async (req, res) => {
  try {
    const meows = await Meow.find({}).populate('author', 'username realName profilePhoto');
    res.status(200).json(meows);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching Meows', error });
  }
};

exports.likeMeow = async (req, res) => {
  try {
    const meow = await Meow.findById(req.params.meowId);
    if (!meow) {
      return res.status(404).json({ message: 'Meow not found' });
    }

    const userHasLiked = meow.likedBy.some((userId) => userId.equals(req.user._id));
    if (userHasLiked) {
      return res.status(400).json({ message: 'You have already liked this meow' });
    }

    meow.likedBy.push(req.user._id);
    await meow.save();
    const populatedMeow = await Meow.findById(meow._id).populate(
      'author',
      'username realName profilePhoto'
    );
    res.json(populatedMeow);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.unlikeMeow = async (req, res) => {
  try {
    const meow = await Meow.findById(req.params.meowId);
    if (!meow) {
      return res.status(404).json({ message: 'Meow not found' });
    }

    const index = meow.likedBy.indexOf(req.user._id);
    if (index === -1) {
      return res.status(400).json({ message: 'You have not liked this meow' });
    }

    meow.likedBy.splice(index, 1);
    await meow.save();
    const populatedMeow = await Meow.findById(meow._id).populate(
      'author',
      'username realName profilePhoto'
    );
    res.json(populatedMeow);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
