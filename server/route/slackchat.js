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
                'id' , 'DESC'
            ]],
            where : {
                [Op.and] : {
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

// DB 원하는 state 데이터 가져오기 --------------------
router.get("/stateload", async(req, res) => {
    try {
        const query = `select * from slackchats where state='${req.query.state}' and userid='${req.query.userid}' and time >= '${req.query.time}' and time <= '${req.query.time2}'`;
        let result = await models.sequelize.query(query, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        res.send(result);
    } catch (err){
        console.log("select state load err : " + err);
    }
});

// DB 출근, 지각 데이터 가져오기 --------------------
router.get("/onwork", async(req, res) => {
    try {
        const query = `select * from slackchats where (state='지각' or state='출근') and userid='${req.query.userid}' and time >= '${req.query.time}' and time <= '${req.query.time2}'`;
        let result = await models.sequelize.query(query, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        res.send(result);
    } catch (err){
        console.log("select all tardy user err : " + err);
    }
});

// Row Query --------------------------
// 특정 월에 출근 또는 야근 등의 데이터가 있지만, 지각의 데이터는 없는 경우에, 지각은 해당 월에 0으로 표시됨.
// 특정 월에 어떤한 데이터도 없을 시, 해당 월은 표시되지 않음.
router.get("/monthdata", async(req, res) => {
    let whereQuery = `state="${req.query.state}"`;

    if(req.query.state === "출근") {
        whereQuery = `(state="출근" or state="지각")`;
    }

    try {
        const query = `
            SELECT d.date, ifnull(s.state,0) as state FROM ( SELECT DATE_FORMAT(time, '%Y-%m') AS date FROM slackchats where userid='${req.query.userId}' 
            GROUP BY DATE_FORMAT(time, '%Y-%m') ORDER BY date DESC) as d LEFT JOIN (
            SELECT DATE_FORMAT(time, '%Y-%m') as date, count(state) as state FROM slackchats WHERE userid='${req.query.userId}' and ${whereQuery} 
            group by DATE_FORMAT(time, '%Y-%m')) as s on d.date = s.date  order by date desc;
        `;

        let result = await models.sequelize.query(query, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        
        res.send(result);
    } catch (err){
        console.log("select all tardy user err : " + err);
        res.send(false);
    }
});

// Module Exports --------------------
module.exports = router;