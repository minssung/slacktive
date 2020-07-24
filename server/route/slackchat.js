const express = require("express");
const router = express.Router();
const models = require("../models");
const moment = require("moment");

// DB Setting --------------------
const Slack = models.slackchat;
const Op = models.Sequelize.Op;

// ------------------------------------- DB CRUD -------------------------------------

// 전체 가져오기 --------------------
router.get("/all", async(req, res) => {
    try {
        const result = await Slack.findAll({
            include : [{
                model : models.user,
            }],
            order : [[
                'id' , 'ASC'
            ]]
        });
        res.send(result);
    } catch(err){
        console.log("select chat all err : " + err);
        res.end();
    }
});

// 월 기준 가져오기 --------------------
router.get("/monthall", async(req, res) => {
    let stateIf = `state="${req.query.state}"`;
    if(req.query.state === "출근") {
        stateIf = `state="출근" or state="지각" or state="외근"`;
    } else if(req.query.state === "야근") {
        stateIf = `state="야근"`;
    }

    let query = `select date_format(time, "%Y-%m") as date, count(state) as state from slackchats where (${stateIf}) and userId="${req.query.userId}" group by date`;
    try {
        const result = await models.sequelize.query(query, { type : models.sequelize.QueryTypes.SELECT, raw : true })
        res.send(result);
    } catch(err){
        console.log("select chat all err : " + err);
        res.send(false);
    }
});

// 한사람 전체 가져오기 --------------------
router.get("/userall", async(req, res) => {
    let stateIf  = req.query.state === "지각" ? 
        [{ [Op.like] : "%지각%"}] : ( req.query.state === "출근" ? 
        [{ [Op.like] : "%지각%"}, { [Op.like] : "%출근%"}, { [Op.like] : "%외근%"}] : [{ [Op.like] : "%야근%" }] )
    try {
        const result = await Slack.findAll({
            include : [{
                model : models.user,
            }],
            order : [[
                'id' , 'ASC'
            ]],
            where : {
                [Op.and] : {
                    [Op.or] : [
                        { time : { [Op.like] : `%${req.query.preTime}%`} }, 
                        { time : { [Op.like] : `%${req.query.toTime}%`} }
                    ],
                    state : {
                        [Op.or] : stateIf
                    },
                    userId : {
                        [Op.like] : `%${req.query.userId}%`
                    }
                }
            }
        });
        res.send(result);
    } catch(err){
        console.log("select chat all err : " + err);
        res.send(false);
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
        res.end();
    }
});

// DB SelectOne Time --------------------
router.get("/avgtime", async(req, res) => {
    let query = `select sec_to_time(avg(time_to_sec(date_format(time, "%T")))) as times from slackchats where (state="출근" or state="지각" or state="외근") and userId="${req.query.userId}" and time like "%${req.query.time}%" `;
    try {
        let result = await models.sequelize.query(query, { type : models.sequelize.QueryTypes.SELECT, raw : true })
        res.send(result[0].times);
    } catch (err){
        console.log("select chat one err : " + err);
        res.send(false);
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
        res.end();
    }
});

// DB SelectOne onWorkTime Lastdata --------------------
router.post("/onworktime", async(req, res) => {
    try {
        let result = await Slack.findOne({
            limit : 1,
            where : {
                userid : req.body.userid,
                [Op.or]: [{state: '출근'}, {state: '지각'}]
            },
            order : [
                ['time','DESC']
            ]
        });
        res.send(result);
    } catch (err){
        console.log("select chat one err : " + err);
        res.end();
    }
});

// DB FindOrCreate --------------------
router.post("/create", async(req, res) => {
    try {
        let result = await Slack.create({
            userId: req.body.userId, 
            text : req.body.text,
            time : req.body.time,
            state : req.body.state,
            textTime : req.body.textTime,
            ts : req.body.ts,
        });
        res.send(result);
    } catch(err) {
        console.error(err);
        res.end();
    }
});

// DB Update --------------------
router.put("/update", async(req, res) => {
    try {
        const result = await Slack.update({ 
            text: req.body.text,
            state : req.body.state,
            textTime : req.body.textTime,
        }, {
            where: {
                ts : req.body.ts
            }
        });
        res.send(result);
    } catch(err) {
        console.error(err);
        res.end();
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
        res.end();
    }
});

// DB halfVacation --------------------
router.get("/stateload", async(req, res) => {
    try {
        const query = `select * from slackchats where state='${req.query.state}' and userid='${req.query.userid}' and time >= '${req.query.time}' and time <= '${req.query.time2}'`;
        let result = await models.sequelize.query(query, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        res.send(result);
    } catch (err){
        console.log("select state load err : " + err);
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