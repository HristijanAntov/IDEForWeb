var crypto = require('crypto') 

const hash = password => hashed = crypto.createHash("md5").update(password).digest('hex');
const rand = to => Math.floor(Math.random() * to + 1); // samo onaka
const requireAuthentication = (req, res, next) => {
    if (req.user) {
        next();
    }
    else {
        res.redirect('/login');
    }
}
module.exports = {
    hash,
    rand,
    requireAuthentication
}