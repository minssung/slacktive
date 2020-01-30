const express = require("express");
const router = express.Router();
const models = require("../models");
const _ = require("lodash");

// DB Setting --------------------
const Slack = models.slackchat;

// ------------------------------------- DB CRUD -------------------------------------

// DB SelectAll --------------------
router.get("/all", async(req, res) => {
    try {
        const result = await Slack.findAll();
        res.send(result);
    } catch(err){
        console.log("select chat all err : " + err);
    }
});

// DB SelectOne --------------------
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

// DB FindOrCreate --------------------
router.post("/create", async(req, res) => {
    let result = false;
    try {
        Slack.findOrCreate({
            where : {
                time : req.body.time,
                userid : req.body.userid
            },
            defaults : {
                userid: req.body.userid, 
                text : req.body.text,
                time : req.body.time,
                state : req.body.state,
            }
        }).spread((none, created) =>{
            if(created) {
                result = true;
            }
        });
    }catch(err) {
        console.error(err);
    }
    res.send(result);
});

// DB Update --------------------
router.put("/update", async(req, res) => {
    try {
        const result = await Slack.update({ 
            userid: req.body.userid, 
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