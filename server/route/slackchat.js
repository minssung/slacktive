const express = require("express");
const router = express.Router();
const models = require("../models");

// DB Setting --------------------
const Slack = models.slackchat;
const Op = models.Sequelize.Op;
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

// DB Select State AVG --------------------
router.get("/state", async(req, res) => {
    try {
        let result = await Slack.count({
            where : {
                state : req.query.state,
                userId : req.query.userid,
                time : {
                    [Op.substring] : req.query.time, 
                }
            }
        })
        res.send(result+"");
    } catch (err){
        console.log("select chat state err : " + err);
    }
});

// DB Select time AVG --------------------
router.get("/time", async(req, res) => {
    try {
        const query = `select SEC_TO_TIME(AVG(TIME_TO_SEC(date_format(time, '%T')))) as times from slackchats where state='${req.query.state}' and userId='${req.query.userid}' and time like '%${req.query.time}%'`
        let result = await models.sequelize.query(query, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        res.send(result[0].times);
    } catch (err){
        console.log("select chat state err : " + err);
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

// DB SelectOne onWorkTime Lastdata --------------------
router.get("/onworktime", async(req, res) => {
    try {
        let result = await Slack.findOne({
            limit : 1,
            where : {
                userid : req.query.userid,
                [Op.or]: [{state: '출근'}, {state: '지각'}]
            },
            order : [
                ['time','DESC']
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

// DB halfVacation --------------------
router.get("/tardy", async(req, res) => {
    try {
        const query = `select * from slackchats where state='지각' and userid='${req.query.userid}' and time >= '${req.query.time}' and time <= '${req.query.time2}'`;
        let result = await models.sequelize.query(query, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        res.send(result);
    } catch (err){
        console.log("select all tardy user err : " + err);
    }
});

// DB halfVacation --------------------
router.get("/onwork", async(req, res) => {
    try {
        const query = `select * from slackchats where (state='지각' or state='출근') and userid='${req.query.userid}' and time >= '${req.query.time}' and time <= '${req.query.time2}'`;
        let result = await models.sequelize.query(query, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        res.send(result);
    } catch (err){
        console.log("select all tardy user err : " + err);
    }
});

// Module Exports --------------------
module.exports = router;