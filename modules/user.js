const UserModel = require('../models/user');

class User {
    async get(id) {
        return new Promise((resolve, reject) => {
            UserModel.findById(id, (err, user) => {
                if (err) reject(err);

                resolve(user);
            });
        });
    }

    async update(filter, update) {
        return new Promise((resolve, reject) => {
            UserModel.findOneAndUpdate(
                    filter,
                    update, {
                        new: true,
                        upsert: true,
                        useFindAndModify: false
                    }
                )
                .then((err, user) => {
                    if (err) reject(err);

                    resolve(user);
                })
        });
    }
}

module.exports = User;