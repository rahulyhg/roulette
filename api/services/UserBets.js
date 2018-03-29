var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    game: {
        type: Schema.Types.ObjectId,
        ref: "Game"
    },
    amountplaces: Number,
    bet: {
        type: Schema.Types.ObjectId,
        ref: "Bets"
    },
    winningAmount: {
        type: Number,
        default: 0
    }

});

schema.plugin(deepPopulate, {
    populate: {
        'user': {
            select: ""
        },
        'game': {
            select: ""
        },
        'bet': {
            select: ""
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('UserBets', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "user bet game", "user bet game"));
var model = {

    /**
     * this function to call another server api
     * @param {userBets} input body
     * @param {model} input modelname/serviceName
     * @param {callback} callback function with err and response
     */
    callApiToSave: function (userBets, model, callback) {
        console.log("data requestSend", userBets)
        var url = Config.backendUrl;

        var options = {
            method: 'post',
            json: true,
            // url: url + "/api/Member/getAccessLevel",
            url: url + model,
            body: userBets
        };

        request(
            options,
            function (err, httpResponse, body) {

                if (body) {
                    callback(err, body.data);
                } else {
                    callback("Some Error");
                }

            });
    },
    /**
     * this function to save userBets
     * @param {userBets.user} input userID
     * @param {userBets.bet} input betId
     * @param {userBets.amountPlaces} input amountPlace
     * @param {callback} callback function with err and response
     */
    saveUserBets: function (userBets, callback) {
        console.log("in saveUserBets", userBets);
        Game.findOne({
            "results": {
                $exists: false
            },
            "betsAvailable": true
        }).lean().exec(function (err, game) {
            if (!_.isEmpty(game)) {
                userBets.game = game._id;
                UserBets.saveData(userBets, function (err, savedData) {
                    if (err) {
                        console.log("err in saving userbets", err);
                        callback(err, null);
                    } else if (_.isEmpty(savedData)) {
                        console.log("no match found");
                        callback(null, false);
                    } else {
                        var model = "Member/deductMoney";
                        var userBets = {
                            user: savedData.user,
                            amountplaces: savedData.amountplaces
                        }
                        UserBets.callApiToSave(userBets, model, function (data) {
                            console.log("@@@", data);
                            callback(null, data);
                        });
                    }
                });
            } else {
                callback(null, "can not place bet");
            }
        });
    },

    /**
     * this function to save game result and upadte the winning 
     * amount in win users
     * @param {gameResult.result} input game results
     * @param {callback} callback function with err and response
     */
    saveGameResults: function (gameResult, callback) {
        Game.findOneAndUpdate({
            "results": {
                $exists: false
            }
        }, {
            $set: {
                results: gameResult.results
            }
        }, {
            new: true
        }).lean().exec(function (err, game) {
            if (err) {
                console.log("err in save game results", err);
            } else if (!_.isEmpty(game)) {
                UserBets.find({
                    "game": game._id
                }).lean().deepPopulate("bet").exec(function (err, usersbets) {
                    if (err) {
                        console.log("error in finding userBets", usersbets);
                    } else if (!_.isEmpty(usersbets)) {
                        var betUsers = {};
                        var winUser = [];
                        var loseUser = [];
                        async.each(usersbets, function (user, cb1) {
                            var number = user.bet.numbers;
                            if (number.indexOf(game.results) != -1) {
                                console.log("in if", user.bet);
                                var user1 = {
                                    user: user.user,
                                    amountplaces: user.amountplaces,
                                    multiplier: user.bet.multiplier,
                                    winningAmount: user.amountplaces * user.bet.multiplier
                                }
                                winUser.push(user1);
                                UserBets.findOneAndUpdate({
                                    user: user.user,
                                    bet: user.bet._id,
                                    game: game._id
                                }, {
                                    $set: {
                                        winningAmount: user.amountplaces * user.bet.multiplier
                                    }
                                }, {
                                    new: true
                                }).lean().exec(function (err, updatedUserBets) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (!_.isEmpty(updatedUserBets)) {
                                        cb1();
                                    }
                                });
                            } else {
                                console.log("in else");
                                var user2 = {
                                    user: user.user,
                                    amountplaces: user.amountplaces,
                                    multiplier: user.bet.multiplier,
                                    winningAmount: 0
                                }
                                loseUser.push(user2);
                                cb1();
                            }
                        }, function (err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                // UserBets.callApiToSave(winUser, "Member/deductMoney", function (data) {
                                //     console.log("@@@", data);
                                //     callback(null, data);
                                // });

                                betUsers.loseUser = loseUser;
                                betUsers.winUser = winUser;
                                callback(null, betUsers);
                            }
                        });
                    } else {
                        callback(null, false);
                    }
                });
            }
        })
    }
};
module.exports = _.assign(module.exports, exports, model);