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
     * @param {data} input 
     * @param {model} input modelname/serviceName
     * @param {callback} callback function with err and response
     */
    callApiToSave: function (data, model, callback) {
        console.log("data requestSend", data)
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
     * @param {userBets.bet} input userID
     * @param {userBets.amountPlaces} input userID
     * @param {callback} callback function with err and response
     */
    saveUserBets: function (userBets, callback) {
        console.log("in saveUserBets", userBets);
        UserBets.saveData(userBets, function (err, savedData) {
            if (err) {
                console.log("err in saving userbets", err);
                callback(err, null);
            } else if (_.isEmpty(savedData)) {
                callback(null, false);
            } else {
                model = "Member/deductMoney";
                console.log("$$$$$$$$$$$$$$$$$$", savedData);
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
    },

};
module.exports = _.assign(module.exports, exports, model);