const express = require("express");
const router = express.Router();
const axios = require('axios');
const _ = require("lodash");
const configs = require("../server_config");
const models = require("../models");
const moment = require('moment');
moment.tz.setDefault("Asia/Seoul");

const User = models.user;
const Slackchat = models.slackchat;
const Calendar = models.calendar;

// 팀의 모든 유저 보기 ( 앱 포함 ) --------------------------------------------------
router.get("/teamUsers", async(req,res)=>{
    try {
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/users.list",
            header : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            params: {
                token : configs.b_token,
            }
        });
        const resultSet = result.data.members;
        const array = resultSet.map((data)=>{
            return {
                user : data.id,
                name : data.name,
                R_name : data.real_name,
                is_bot : data.is_bot
            }
        });
        // 테이블 생성 name 컬럼 추가 ( 봇 제외 유저만 )
        for (const user of array) {
            if(user.R_name !== undefined && user.R_name !== "Slackbot" && user.is_bot === false)
                User.findOrCreate({
                    where : {
                        id : user.user,
                        username : user.R_name
                    },
                    defaults : {
                        id : user.user,
                        username : user.R_name,
                        state : "대기",
                        holidaycount : 20,
                    }
                }).spread((none, created) =>{
                    if(created){
                        console.log(created);
                    }
                });
        }
        res.send(array);
    } catch(err){
        console.log("db created err : " + err);
    }
});

// 채널에 메시지 보내기 --------------------------------------------------
router.post("/messagePost", async(req,res)=>{
    try {
        const result = await axios({
            method : "post",
            url : "https://slack.com/api/chat.postMessage",
            header : {
                "Content-type" : "application/json",
                "Authorization" : "Bearer " + req.body.p_token,
            },
            params : {
                token : req.body.p_token,
                channel : req.body.channel,
                text : req.body.text,
                as_user: true
            }
        });
        res.send(result.data);
    }catch(err){
        console.log("slack post message err : " + err);
    }
});

// 채널의 메시지 내역 가져오기 ( 봇 및 앱도 포함 ) --------------------------------------------------
router.post("/channelHistory", async(req,res) =>{
    try {
        let historyOne = [];
        historyOne = await Slack.findOne({
            limit : 1,
            order : [
                [ 'time','DESC']
            ]
        });
        console.log("on --------------------------------");
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/conversations.history",
            header : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            params: {
                token : configs.p_token,
                channel : req.body.channel,
                oldest : historyOne.data.time
            }
        });
        const resultSet = (result.data.messages).reverse();
        const resultArray = resultSet.map(data=>{
            return data.user &&  {
                userId : data.user,
                time : data.ts,
                text : data.text,
                state : "출근",
            }
        });
        try {
            await Slackchat.bulkCreate(resultArray,{
                individualHooks : true,
            });
        } catch(err) {
            console.error("bulk create arr : " + err);
        }
        res.send(resultArray);
    } catch(error) {
        console.log("slack channel history err : " + error);
    }
});

// 채널의 메시지 내역 가져오기 초기 실행 ( 출퇴근용 )--------------------------------------------------
router.post("/channelHistoryInit", async(req,res) =>{
    try {
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/conversations.history",
            header : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            params: {
                token : configs.p_token,
                channel : req.body.channel,
            }
        });
        const resultSet = (result.data.messages).reverse();
        let resultArray = [];
        resultArray = resultSet.map(data=> {
            const Changetime = moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm:ss");
            const timeCheck = moment.unix(data.ts).utcOffset("+09:00").format("HH:mm");
            if (timeCheck > "11:00") {
                return data.user && {
                    userId : data.user,
                    time : Changetime,
                    text : data.text,
                    state : "지각",
                }
            } else {
                return data.user && {
                    userId : data.user,
                    time : Changetime,
                    text : data.text,
                    state : "출근",
                }
            }   
        });
        try {
            await Slackchat.bulkCreate(resultArray,{
                individualHooks : true,
            });
        } catch(err) {
            console.error("bulkcreate init err : " + err);
        }
        res.send(resultArray);
    } catch(error) {
        console.log("slack channel history err : " + error);
    }
});
// 채널의 메시지 내역 가져오기 초기 실행 ( 일정용 ) --------------------------------------------------
router.post("/channelHistoryInitCal", async(req,res) =>{
    try {
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/conversations.history",
            header : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            params: {
                token : configs.p_token,
                channel : req.body.channel,
            }
        });
        const resultSet = (result.data.messages).reverse();
        let resultArray = [];
        resultArray = resultSet.map(data=> {
            return data.user && {
                userId : data.user,
                time : data.ts,
                text : data.text,
                state : "휴가",
            }
        });
        try {
            await Calendar.bulkCreate(resultArray,{
                individualHooks : true,
            });
        } catch(err) {
            console.error("bulkcreate init err : " + err);
        }
        res.send(resultArray);
    } catch(error) {
        console.log("slack channel history err : " + error);
    }
});

// 해당 채널의 대화 멤버 가져오기 --------------------------------------------------
router.get("/channelMembers", async(req,res)=>{
    try {
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/conversations.members",
            header : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            params : {
                token : configs.p_token,
                channel : req.body.channel,
            }
        });
        const resultSet = result.data.members;
        const array = resultSet.map(data=>{
            return {
                member : data
            }
        })
        res.send(array);
    } catch(err){
        console.log("slack channel members err : " + err);
    }
});

// 팀의 전체 채널 리스트 가져오기 --------------------------------------------------
router.post("/channelList", async(req,res)=>{
    try {
        const result = await axios({
            method : "get",
            url : "	https://slack.com/api/conversations.list",
            header : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            params : {
                token : configs.p_token,
            }
        });
        console.log(result.data)
        const resultSet = result.data.channels;
        const array = resultSet.map(data =>{
            return {
                id : data.id,
                name : data.name
            }
        });
        res.send(array);
    }catch(err){
        console.log("slack channel list err : " + err);
    }
});

// 채널의 메시지 삭제 --------------------------------------------------
router.post("/messageDelete", async(req,res)=>{
    try {
        const result = await axios({
            method : "post",
            url : "	https://slack.com/api/chat.delete",
            header : {
                "Content-type" : "application/json",
                "Authorization" : "Bearer " + req.body.p_token,
            },
            params : {
                token : req.body.p_token,
                channel : req.body.channel,
                ts : req.body.time
            }
        });
        res.send(result.data);
    }catch(err){
        console.log("slack message delete err : " + err);
    }
});

// 채널의 메시지 업데이트 --------------------------------------------------
router.post("/messageUpdate", async(req,res)=>{
    try {
        const result = await axios({
            method : "post",
            url : "	https://slack.com/api/chat.update",
            header : {
                "Content-type" : "application/json",
                "Authorization" : "Bearer " + req.body.p_token,
            },
            params : {
                token : req.body.p_token,
                channel : req.body.channel,
                text : req.body.text,
                ts : req.body.time,
                as_user : true
            }
        });
        res.send(result.data);
    }catch(err){
        console.log("slack channel msg update err : " + err);
    }
});

// 대화의 사용자 강퇴 --------------------------------------------------
router.post("/conversationsKick", async(req,res)=>{
    try {
        const result = await axios({
            method : "post",
            url : "	https://slack.com/api/conversations.kick",
            header : {
                "Content-type" : "application/json",
                "Authorization" : "Bearer " + req.body.p_token,
            },
            params : {
                token : req.body.p_token,
                channel : req.body.channel,
                user : req.body.user,
            }
        });
        res.send(result.data);
    }catch(err){
        console.log(err);
    }
});

// 사용자 정보 조회 --------------------------------------------------
router.post("/usersInfo", async(req,res)=>{
    try {
        const result = await axios({
            method : "get",
            url : "	https://slack.com/api/users.info",
            header : {
                "Content-type" : "application/x-www-form-urlencoded",
            },
            params : {
                token : req.body.p_token,
                user : req.body.user,
              }
        });
        const resultSet = result.data.user;
        const resultJson = {
            id : resultSet.id,
            t_id : resultSet.team_id,
            name : resultSet.name,
            r_name : resultSet.real_name,
            tz : resultSet.tz,
            profile : {
                title : resultSet.profile.title,
                phone : resultSet.profile.phone,
                email : resultSet.profile.email,
                f_name : resultSet.profile.first_name,
                l_name : resultSet.profile.last_name
            },
            update : resultSet.updated,
        };
        res.send(resultJson);
    }catch(err){
        console.log("slack user info err : " + err);
    }
});

// 봇 정보 조회 --------------------------------------------------
router.post("/botInfo", async(req,res)=>{
    try {
        const result = await axios({
            method : "get",
            url : "	https://slack.com/api/bots.info",
            header : {
                "Content-type" : "application/x-www-form-urlencoded",
            },
            params : {
                token : req.body.p_token,
            }
        });
        res.send(result.data);
    }catch(err){
        console.log(err);
    }
});

// 인증 및 신원 정보 조회 --------------------------------------------------
router.post("/authInfo", async(req,res)=>{
    try {
        const result = await axios({
            method : "get",
            url : "	https://slack.com/api/auth.test",
            header : {
                "Content-type" : "application/json",
                "Authorization" : "Bearer " + req.body.p_token,
            },
            params : {
                token : req.body.p_token,
            }
        });
        res.send(result.data);
    }catch(err){
        console.log("slack auth identity test err : " + err);
    }
});

module.exports = router;