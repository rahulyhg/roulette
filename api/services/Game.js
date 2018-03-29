var cron = require('node-cron');
var schema = new Schema({
    timestamp: {
        type: Date,
        required: true
    },
    results: Number,
    betsAvailable: {
        type: Boolean,
        default: true
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Game', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    /**
     * this function to create new game
     * @param {gameResult.result} input game results
     * @param {callback} callback function with err and response
     */
    test: function (data, callback) {
        var game = {};
        var currentDate = new Date();
        game.timestamp = currentDate;
        console.log("@@@@@@@@@@@@@", game);
        Game.saveData(game, function (err, savedGame) {
            if (err) {
                callback(err, null);
            } else if (!_.isEmpty(savedGame)) {
                // callback(null, savedGame);
                console.log("in saved Game", savedGame);
                setTimeout(function () {
                    savedGame.betsAvailable = false;
                    Game.saveData(savedGame, function (err, savedStatus) {
                        console.log("##########", savedStatus);
                    });
                }, 120000);
            } else {
                callback(null, false);
            }
        });
    }
};
/**
 * this function to create new game after every 2.30 mins
 */
setInterval(function () {
    var game = {};
    var currentDate = new Date();
    game.timestamp = currentDate;
    Game.saveData(game, function (err, savedGame) {
        console.log("save game in via cron");
        if (err) {
            callback(err, null);
        } else if (!_.isEmpty(savedGame)) {
            // callback(null, savedGame);
            setTimeout(function () {
                savedGame.betsAvailable = false;
                Game.saveData(savedGame, function (err, savedStatus) {});
            }, 120000);
        } else {
            callback(null, false);
        }
    });

}, 138000);
module.exports = _.assign(module.exports, exports, model);