const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const Meow = require('../models/meow');

const deleteFileFromS3 = async (bucket, key) => {
  console.log("deleteFileFromS3 is being called"); 
  console.log("Key:", key);
  const s3 = new S3Client({ 
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const deleteParams = {
    Bucket: bucket,
    Key: key,
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
    console.log("Meow Data:", req.body); //debug
    console.log("File Details:", req.file); //debug
    console.log("File Location:", req.file.location); //debug
    console.log("USING CREATEMEOW FUNCTION"); //debug

    const meowData = {
      ...req.body,
      meowMedia: req.file ? req.file.location : ''
    };

    const newMeow = new Meow(meowData);
    const savedMeow = await newMeow.save();
    res.status(201).json(savedMeow);
  } catch (error) {
    res.status(400).json({ message: 'Error creating Meow. Check that the file size does not exceed limit of 50 MB. Also check that the file format is supported. Supported formats: .mp4, .webm, .ogg, .mov, .avi, .wmv, .m4v, .jpg, .jpeg, .png, .gif, .bmp', error });
  }
};

exports.getMeow = async (req, res) => {
    console.log("ID:", req.params.meowId);
    try {
    const meow = await Meow.findById(req.params.meowId);
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
  console.log('deleteMeow function called');
  try {
    console.log('deleteMeow function called???');
    // Find the Meow to be deleted
    const meowToDelete = await Meow.findById(req.params.meowId);

    // Delete the media file from S3
    if (meowToDelete && meowToDelete.meowMedia) {
      const s3FilePath = meowToDelete.meowMedia; // Assuming meowMedia contains the S3 file path
      const s3FileKey = s3FilePath.split('/').pop(); // Extracting file key from the URL
      await deleteFileFromS3(process.env.S3_BUCKET, s3FileKey);
    }

    // Delete the Meow from the database
    await Meow.findByIdAndDelete(req.params.meowId);
    res.status(200).json({ message: 'Meow and associated media deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting Meow', error });
  }
};


exports.getAllMeows = async (req, res) => {
    try {
      const meows = await Meow.find({});
      res.status(200).json(meows);
    } catch (error) {
      res.status(400).json({ message: 'Error fetching Meows', error });
    }
  };
  