const express = require("express");
const router = express.Router();
const models = require("../models");

// DB Setting --------------------
const Slack = models.slackchat;

const queryFindAll = "SELECT `slackchat`.`id`, `slackchat`.`chat_userid`, `slackchat`.`text`, `slackchat`.`time`, `slackchat`.`state`, `slackchat`.`createdAt`, `slackchat`.`updatedAt`, `user`.`username` AS `username`, `user`.`state` AS `userstate`FROM `slackchats` AS `slackchat` LEFT OUTER JOIN `users` AS `user` ON `slackchat`.`chat_userid` = `user`.`userid` ORDER BY `slackchat`.`id` ASC;"
// ------------------------------------- DB CRUD -------------------------------------

// DB SelectAll --------------------
router.get("/all", async(req, res) => {
    try {
        const result = await models.sequelize.query(queryFindAll, {
            type : models.sequelize.QueryTypes.SELECT,
            raw : true
        });
        res.send(result);
    } catch(err){
        console.log("select chat all err : " + err);
    }
});

// DB SelectOne Time --------------------
router.get("/one", async(req, res) => {
    try {
        let result = await Slack.findOne({
            where: {
                time: req.query.time
            },
        });
        res.send(result);
    } catch (err){
        console.log("select chat one err : " + err);
    }
});

// DB SelectOne Id --------------------
router.get("/oneid", async(req, res) => {
    try {
        let result = await Slack.findOne({
            where: {
                id: req.query.id
            },
        });
        res.send(result);
    } catch (err){
        console.log("select chat one err : " + err);
    }
});

// DB Selecte MAX ID --------------------
router.get("/max", async(req, res) => {
    try {
        const result = await Slack.findAll({
            attributes : [[models.sequelize.fn('max', models.sequelize.col('id')), 'maxID']]
        })
        res.send(result);
    } catch(err){
        console.log("select chat all err : " + err);
    }
});

// DB FindOrCreate --------------------
router.post("/create", async(req, res) => {
    try {
        let result = await Slack.findOrCreate({
            where : {
                time : req.body.time,
                chat_userid : req.body.userid
            },
            defaults : {
                id : req.body.id,
                chat_userid: req.body.userid, 
                text : req.body.text,
                time : req.body.time,
                state : req.body.state,
            }
        });
        res.send(result);
    } catch(err) {
        console.error(err);
    }
});

// DB Update --------------------
router.put("/update", async(req, res) => {
    try {
        const result = await Slack.update({ 
            chat_userid: req.body.userid, 
            text: req.body.text,
            state : req.body.state,
        }, {
            where: {
                time : req.body.time
            }
        });
        res.send(result);
    } catch(err) {
        console.error(err);
    }
});

// DB Delete --------------------
router.delete("/delete", async(req, res) => {
    try {
        let result = await Slack.destroy({
            where: {
                time: req.query.time
            }
        });
        res.send(result);
    } catch(err) {
        console.log("delete chat err : " + err);
    }
});

// Module Exports --------------------
module.exports = router;