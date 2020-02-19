const express = require("express");
const router = express.Router();
const models = require("../models");

// DB Setting --------------------
const Slack = models.slackchat;

// ------------------------------------- DB CRUD -------------------------------------

// DB SelectAll --------------------
router.get("/all", async(req, res) => {
    try {
        const result = await Slack.findAll({
            include : [{
                model : models.user,
                attributes : ['username']
            }],
            order : [[
                'id' , 'ASC'
            ]]
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
router.get("/oneRow", async(req, res) => {
    try {
        let result = await Slack.findOne({
            limit : 1,
            order : [
                [ 'time','DESC']
            ]
        });
        res.send(result);
    } catch (err){
        console.log("select chat one err : " + err);
    }
});

// DB FindOrCreate --------------------
router.post("/create", async(req, res) => {
    try {
        let result = await Slack.findOrCreate({
            where : {
                ts : req.body.ts,
                userId : req.body.userId
            },
            defaults : {
                id : req.body.id,
                userId: req.body.userId, 
                text : req.body.text,
                time : req.body.time,
                state : req.body.state,
                ts : req.body.ts,
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
            userId: req.body.userId, 
            text: req.body.text,
            state : req.body.state,
        }, {
            where: {
                ts : req.body.ts
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
                ts: req.query.ts
            }
        });
        res.send(result);
    } catch(err) {
        console.log("delete chat err : " + err);
    }
});

// Module Exports --------------------
module.exports = router;