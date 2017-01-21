var Account = require('../@models/account');

var getUserById = function(id) {
    return new Promise((resolve, reject) => {
        Account.findOne({ _id: id }, function(err, user) {
            if(err) {
                reject(err);
            }
            else {
                resolve(user);
            }
       });
    });
}

module.exports = {
    getUserById
}