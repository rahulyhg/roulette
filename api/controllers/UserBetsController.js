module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    saveUserBets: function (req, res) {
        if (req.body) {
            UserBets.saveUserBets(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    saveGameResults: function (req, res) {
        if (req.body) {
            UserBets.saveGameResults(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
};
module.exports = _.assign(module.exports, controller);