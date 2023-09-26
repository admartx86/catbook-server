const crypto = require('crypto');

function generatePassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const passwordHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return {
        salt: salt,
        hash: passwordHash
    };
}

function validatePassword(password, hash, salt) {
    const verifiedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifiedHash;
}

module.exports.validatePassword = validatePassword;
module.exports.generatePassword = generatePassword;