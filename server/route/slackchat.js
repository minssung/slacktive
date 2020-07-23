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

// 해당 스태이트에 맞는 내용 및 이전 달과 비교값까지 가져오기 --------------------
router.get("/state", async(req, res) => {
    try {
        let setTime = req.query.time;
        if(req.query.sub) {
            setTime = moment(req.query.time,"YYYY-MM-DD").subtract(1, 'month').format("YYYY-MM")
        }
        let result = await Slack.count({
            where : {
                [Op.or] : [{state : req.query.state}, {state : req.query.stateSub}],
                userId : req.query.userid,
                time : {
                    [Op.substring] : setTime, 
                }
            }
        })
        res.send(result+"");
    } catch (err){
        console.log("select chat state err : " + err);
        res.end();
    }
});

// 스태이트의 모든 값 가져오기 --------------------
router.get("/stateall", async(req, res) => {
    try {
        let whereQuery = `state='${req.query.state}'`
        if(req.query.stateSub) {
            whereQuery = `(state='${req.query.state}' or state='${req.query.stateSub}')`
        }
        const queryStateAll = `SELECT d.date, ifnull(s.state,0) as state FROM ( SELECT DATE_FORMAT(time, '%Y-%m') AS date FROM slackchats where userid='${req.query.userId}' 
                GROUP BY DATE_FORMAT(time, '%Y-%m') ORDER BY date DESC) as d LEFT JOIN (
                SELECT DATE_FORMAT(time, '%Y-%m') as date, count(state) as state FROM slackchats WHERE userid='${req.query.userId}' and ${whereQuery} 
                group by DATE_FORMAT(time, '%Y-%m')) as s on d.date = s.date;`
        
        let result = await models.sequelize.query(queryStateAll, { type : models.sequelize.QueryTypes.SELECT ,raw : true, required : false})
        res.send(result);
    } catch (err){
        console.log("select chat state err : " + err); 
        res.end();
    }
});

// 스태이트의 모든 값 가져오기 --------------------
router.get("/stateallavg", async(req, res) => {
    try {
        const queryStateAll = `SELECT time, text FROM slackchats where (state="지각" or state="출근" or state="외근") order by time desc`
        let result = await models.sequelize.query(queryStateAll, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        res.send(result);
    } catch (err){
        console.log("select chat state err : " + err);
        res.end();
    }
});

// 해당 스태이트의 값 타임에 맞게 가져오기 --------------------
router.get("/getstate", async(req, res) => {
    try {
        let result = await Slack.findOne({
            where : {
                state : req.query.state,
                userId : req.query.userid,
                time : {
                    [Op.substring] : req.query.time, 
                }
            }
        })
        res.send(result);
    } catch (err){
        console.log("select chat getState err : " + err);
        res.end();
    }
});

// 평균 시간 값 가져오기 --------------------
router.get("/time", async(req, res) => {
    try {
        let setTime = req.query.time;
        if(req.query.sub) {
            setTime = moment(req.query.time,"YYYY-MM-DD").subtract(1, 'month').format("YYYY-MM")
        }
        const query = `select SEC_TO_TIME(AVG(TIME_TO_SEC(date_format(time, '%T')))) as times from slackchats where (state='${req.query.state}' or state='${req.query.stateSub}') and userId='${req.query.userid}' and time like '%${setTime}%'`
        let result = await models.sequelize.query(query, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        res.send(result[0].times);
    } catch (err){
        console.log("select chat Timestate err : " + err);
        res.end();
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