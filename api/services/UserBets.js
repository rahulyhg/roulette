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
var model = {};
module.exports = _.assign(module.exports, exports, model);