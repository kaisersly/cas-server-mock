'use strict';

const crypto = require('crypto');
const iv = Buffer.from(crypto.randomBytes(16));

function encrypt(text, secretKey) {
    const cipher = crypto.createCipheriv('aes128', Buffer.from(secretKey).slice(0, 16), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(encryptedText, secretKey) {
    const decipher = crypto.createDecipheriv('aes128', Buffer.from(secretKey).slice(0, 16), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
