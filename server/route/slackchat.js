const express = require("express");
const router = express.Router();
const models = require("../models");
const _ = require("lodash");

// DB Setting --------------------
const Slack = models.slackchat;

// DB Insert --------------------
router.get("/init", async(req, res) => {
    const slacks = [{
        username: "slack user name",
        text : "slack board text",
        date : "2020,02,20,10:00,AM"
    }];

    await Slack.sync ({ forcce : true });

    for (const slack of slacks) {
        await Slack.create ({ 
            "username" : slack.username, 
            "text" : slack.text, 
            "date" : slack.date 
        });
    }
    res.send(true);
});

// ------------------------------------- DB CRUD -------------------------------------

// DB SelectAll --------------------
router.get("/", async(req, res) => {
    let result = await Slack.findAll({
    });
    res.send(result);
});

// DB SelectOne --------------------
router.get("/:id", async(req, res) => {
    try 
    {
        let result = await Slack.findOne({
            where: {
                id: req.params.id
            },
        });
        res.send(result);
    } catch (err){
        console.log(err);
    }
});

/*
// DB Create --------------------
router.post("/", async(req, res) => {
    let result = false;
    try{
        await Slack.create({
            username: req.body.username, 
            text : req.body.text, 
            date : req.body.date
        });
        //await result_slack.createGroup({groupName: "slackApp"});
        result = true;
    }catch(err) {
        console.error(err);
    }
    res.send(result);
});
*/

// DB FindOrCreate --------------------
router.post("/create", async(req, res) => {
    let result = false;
    try{
        Slack.findOrCreate({
            where : {
                date : req.body.date,
                username : req.body.username
            },
            defaults : {
                id : req.body.id,
                username: req.body.username, 
                text : req.body.text,
                date : req.body.date
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
router.put("/:id", async(req, res) => {
    let result = null;
    try {
        result = await Slack.update({ 
            username: req.body.username, 
            text: req.body.text }, {
            where: {
              id : req.params.id
            }
          }).then(() => {
              return result;
          });
    } catch(err) {
        console.error(err);
    }
    res.send(result);
});

// DB Delete --------------------
router.delete("/:id", async(req, res) => {
    let result = await Slack.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        console.log("Done");
      });
    res.send(result);
});

// Module Exports --------------------
module.exports = router;