require('dotenv').config();
const crypto = require('crypto');


exports.defined = variable => {
    return typeof variable !== typeof void(0);
}


const algorithm = `${process.env.CRYPTO_ALGO}`;
const secretKey = `${process.env.CRYPTO_KEY}`;
const iv = crypto.randomBytes(16);

exports.encrypt = (text) => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

exports.decrypt = (hash) => {

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};