const Meow = require('../models/meow');

exports.createMeow = async (req, res) => {
  try {
    console.log("Meow Data:", req.body);
    console.log("File Details:", req.file);

    const meowData = {
      ...req.body,
      meowMedia: req.file ? req.file.location : ''
    };

    const newMeow = new Meow(meowData);
    const savedMeow = await newMeow.save();
    res.status(201).json(savedMeow);
  } catch (error) {
    res.status(400).json({ message: 'Error creating Meow', error });
  }
};

// exports.createMeow = async (req, res) => {
//   try {
//     const newMeow = new Meow(req.body);
//     const savedMeow = await newMeow.save();
//     res.status(201).json(savedMeow);
//   } catch (error) {
//     res.status(400).json({ message: 'Error creating Meow', error });
//   }
// };

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
  try {
    await Meow.findByIdAndDelete(req.params.meowId);
    res.status(200).json({ message: 'Meow deleted' });
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
  