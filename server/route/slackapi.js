const express = require("express");
const router = express.Router();
const axios = require('axios');
const _ = require("lodash");
const configs = require("../server_config");

// 팀의 모든 유저 보기 ( 앱 포함 ) --------------------------------------------------
router.post("/teamUsers", async(req,res)=>{
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
        res.send(array);
    }catch(err){
        console.log(err);
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
                "Authorization" : configs.bearer_p_token,
            },
            params : {
                token : configs.p_token,
                channel : "CSMN5L4KY",
                text : "출근",
                //as_user: true
              }
        });
        res.send(result.data);
    }catch(err){
        console.log(err);
    }
});

// 채널의 메시지 내역 가져오기 ( 봇 및 앱도 포함 ) --------------------------------------------------
router.post("/channelHistory", async(req,res) =>{
    try {
        res.on('error', (err) =>{
            console.log(err);
        });
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/conversations.history",
            header : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            params: {
                token : configs.p_token,
                channel : req.body.chname
            }
        });
        const resultSet = (result.data.messages).reverse();
        const resultArray = resultSet.map(data=>{
            return {
                text : data.text,
                user : data.user,
                name : data.username,
                ts : data.ts
            }
        });
        res.send(resultArray);
    } catch(error) {
        console.log(error);
    }
});

// 해당 채널의 대화 멤버 가져오기 --------------------------------------------------
router.post("/channelMembers", async(req,res)=>{
    try {
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/conversations.members",
            header : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            params : {
                token : configs.b_token,
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
        console.log(err);
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
                token : configs.b_token,
            }
        });
        const resultSet = result.data.channels;
        const array = resultSet.map(data =>{
            return {
                id : data.id,
                name : data.name
            }
        });
        res.send(array);
    }catch(err){
        console.log(err);
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
                "Authorization" : configs.bearer_p_token,
            },
            params : {
                token : configs.p_token,
                channel : req.body.channels,
                ts : req.body.times
            }
        });
        res.send(result.data);
    }catch(err){
        console.log(err);
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
                "Authorization" : configs.bearer_p_token,
            },
            params : {
                token : configs.p_token,
                channel : req.body.channels,
                text : req.body.texts,
                ts : req.body.times,
                as_user : true
            }
        });
        res.send(result.data);
    }catch(err){
        console.log(err);
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
                "Authorization" : configs.bearer_p_token,
            },
            params : {
                token : configs.p_token,
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
                token : configs.b_token,
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
        console.log(err);
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
                token : configs.b_token,
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
                "Authorization" : configs.bearer_p_token,
            },
            params : {
                token : configs.p_token,
            }
        });
        res.send(result.data);
    }catch(err){
        console.log(err);
    }
});

module.exports = router;