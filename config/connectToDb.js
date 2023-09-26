require('dotenv').config();
const mongoose = require('mongoose');

async function connectToDb() {
    try {
        await mongoose.connect(process.env.DB_URL); 
            // {useNewUrlParser: true, useUnifiedTopology: true}
        console.log('Connected to catbookDB.');
        return mongoose.connection;
    } catch (error) {
        console.log('Failed to connect to catbookDB.', error);
        throw error;
    }
}

module.exports = connectToDb;