const Meow = require('../models/meow');

const performSearch = async (query) => {
  return Meow.find({
    $text: { $search: query }
  });
};

exports.searchMeows = async (req, res) => {
  try {
    const query = req.query.q;
    const results = await performSearch(query);

    if (results.length === 0) {
      return res.status(200).json({ message: 'No Meows matching search found', data: [] });
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};
