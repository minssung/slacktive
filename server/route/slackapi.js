const express = require("express");
const router = express.Router();

const configs = require("../server_config");

const axios = require('axios');
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

// 채널의 메시지 내역 가져오기 ( 출퇴근 ) --------------------------------------------------
router.post("/channelHistory", async(req,res) =>{
    try {
        // 가장 최근 데이터 추출
        let historyOne = await axios.get("http://localhost:5000/slack/oneRow");
        console.log("History Update");
        
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/conversations.history",
            header : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            params: {
                token : configs.p_token,
                channel : configs.channel_time,
                oldest : historyOne.data.ts // 가장 최근 데이터 기준으로 다음 데이터 수집
            }
        });
        const resultSet = (result.data.messages).reverse();
        let Changetime = "";    // 디비에 들어갈 리얼 타임
        let timeCheck = "";     // 시간 비교 용도
        let timeArray = [];     // 정규식 처리된 시간을 담을 배열
        let timeReg = [];       // 시간을 정규식으로 처리
        let stateSet = "";      // 상태 디비 입력 용도
        let resultArray = [];
        resultArray = regFunc("times",resultSet,Changetime,timeCheck,timeReg,timeArray,stateSet);
        try {
            await Slackchat.bulkCreate(resultArray,{
                individualHooks : true,
            });
        } catch(err) {
            console.error("bulkcreate atten arr : " + err);
        }
        res.send(resultArray);
    } catch(error) {
        console.log("slack channel history err : " + error);
    }
});

// 채널의 메시지 내역 가져오기 ( 일정용 ) --------------------------------------------------
router.post("/channelHistoryCal", async(req,res) =>{
    try {
        let historyOne = await axios.get("http://localhost:5000/calendar/oneRow");
        console.log("calendar History Update");
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/conversations.history",
            header : {
                "Content-type": "application/x-www-form-urlencoded",
            },
            params: {
                token : configs.p_token,
                channel : configs.channel_calendar,
                oldest : historyOne.data.ts
            }
        });
        const resultSet = (result.data.messages).reverse();
        let Changetime = "";
        let calArray = [];
        let calReg = [];
        let textTimes = "";
        let search = "";
        let toDayDate = new Date();
        let resultArray = regFunc("calendar",resultSet,Changetime,calReg,calArray,textTimes,toDayDate,search)
        try {
            await Calendar.bulkCreate(resultArray,{
                individualHooks : true,
            })
        } catch(err) {
            console.error("bulkcreate init err : " + err);
        }
        await models.sequelize.query("delete n1 from `calendars` n1, `calendars` n2 where n1.id < n2.id and n1.cate = n2.cate and n1.textTime = n2.textTime and n1.userId = n2.userId")
        res.send(resultArray);
    } catch(error) {
        console.log("slack channel history cal err : " + error);
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
                channel : configs.channel_time,
            }
        });
        const resultSet = (result.data.messages).reverse();
        let Changetime = "";
        let timeCheck = "";
        let timeArray = [];
        let timeReg = [];
        let stateSet = "";
        let resultArray = [];
        resultArray = regFunc("times",resultSet,Changetime,timeCheck,timeReg,timeArray,stateSet);
        try {
            await Slackchat.bulkCreate(resultArray,{
                individualHooks : true,
            });
        } catch(err) {
            console.error("bulkcreate atten arr : " + err);
        }
        res.send(resultArray);
    } catch(error) {
        console.log("slack channel history atten init err : " + error);
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
                channel : configs.channel_calendar,
            }
        });
        const resultSet = (result.data.messages).reverse();
        let Changetime = "";
        let calArray = [];
        let calReg = [];
        let textTimes = "";
        let search = "";
        let toDayDate = new Date();
        let resultArray = regFunc("calendar",resultSet,Changetime,calReg,calArray,textTimes,toDayDate,search)
        try {
            await Calendar.bulkCreate(resultArray,{
                individualHooks : true,
            })
        } catch(err) {
            console.error("bulkcreate init err : " + err);
        }
        await models.sequelize.query("delete n1 from `calendars` n1, `calendars` n2 where n1.id < n2.id and n1.cate = n2.cate and n1.textTime = n2.textTime and n1.userId = n2.userId")
        res.send(resultArray);
    } catch(error) {
        console.log("slack channelCal history err : " + error);
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

// 정규식을 거쳐 처리하는 함수 --------------------------------------------------
function regFunc(channel ,resultSet, ...args){
    // 출퇴근의 처리
    // args : 0 => real time
    // args : 1 => check time
    // args : 2 => time Reg
    // args : 3 => times array
    // args : 4 => state var
    if(channel === "times"){
        let resultArray = resultSet.map(data=> {
            args[0] = moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm:ss");
            args[1] = moment.unix(data.ts).utcOffset("+09:00").format("HH:mm");
            // 출퇴근에 대한 정규식 처리
            args[2] = configs.timeAttenden.exec(data.text);
            // 처리된 값 조건문 처리
            if(args[2] && args[2][4]) {
                // 처리된 값 배열에 새로 담기
                for (let index = 0; index < args[2].length; index++) {
                    // 필요없는 내용
                    if(index === 0)
                        continue;
                    // 새로운 배열에 담기
                    // 시 와 분 제거
                    if(configs.subTime.exec(args[2][index])){
                        args[2][index] = args[2][index].replace(configs.subTime, "");
                    }
                    args[3][index-1] = args[2][index];
                }
                // 단답 텍스트 변환
                switch(args[3][3]){
                    case "ㅊㄱ" :
                        args[3][3] = "출근"
                        break;
                    case "ㅌㄱ" :
                        args[3][3] = "퇴근"
                        break;
                    case "ㅇㄱ" : 
                    args[3][3] = "외근"
                        break;
                    default : 
                        break
                }
                try {
                    // 본인 지정 시간대가 있을 경우
                    if(args[3][0] && parseInt(args[3][0]) < 11){
                        args[4] = args[3][3]
                        // 지정 시간 없이 텍스트만 입력 시
                    } else {
                        // 11시 이전 8시 반 이후 지정 텍스트 같이 입력 시
                        if (args[1] < configs.Am1 && args[1] > configs.Am0) {
                            args[4] = args[3][3]
                            // 11시 이후 입력 텍스트 경우
                        } else if(args[1] > configs.Am1) {
                            args[4] = (args[3][3] === "출근") ? "지각" : args[3][3]
                            // 4시 50분 이후 입력 텍스트 경우
                        } else if(args[1] > configs.Pm0) {
                            args[4] = (args[3][3] === "퇴근") ? "퇴근" : args[3][3]
                        }
                    }
                    // 유저 상태 업데이트
                    User.update({
                        state : args[4]
                    },{
                        where : { id : data.user }
                    })
                } catch (err) {
                    console.log("Reg Times Err : " + err)
                }
                // 추가해야 될 예외 처리
                // 오전 반차의 경우 오후에 출근 텍스트 입력 시 지각 처리 x
                return data.user && {
                    userId : data.user,
                    time : args[0],
                    ts : data.ts,
                    text : data.text,
                    state : args[4]
                }
            } else {
                console.log("Reg Times Input Err : retry input : " + 
                moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm:ss")  + " , err Msg : " + data.text)
            }
        });
        return resultArray;
    // 일정용 처리
    // args : 0 => real time
    // args : 1 => cal Reg
    // args : 2 => cal array
    // args : 3 => text time
    // args : 4 => today Date
    // args : 5 => search
    } else if(channel === "calendar") {
        let index = 0;
        let resultArray = resultSet.map(data => {
            args[0] = moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm:ss");
            args[1] = configs.calendarReg.exec(data.text);
            args[2] = [];
            args[3] = "";
            if(args[1] && args[1][5]) {
                try {
                    // 배열에다가 정규표현식으로 담기
                    for (index = 0; index < args[1].length; index++) {
                        if(index === 0 || index === 5)
                            continue;
                            args[2].push(args[1][index]);
                    }
                    // 일 수를 배열로 받아서 변환
                    args[2][3] = args[1][4].split(/\s{1,}|\,|일/)
                    for (index = 0; index < args[2][3].length; index++) {
                        args[5] = args[2][3].indexOf("")
                        if(args[5]!= -1)
                        args[2][3].splice(args[5],1)
                    }
                    // 예 : 20년 입력시 2020으로 바꿈 & 입력 없을 시 현재 년도
                    if(args[2][1]){
                        if(!/\d{4}?/.exec(args[2][1])){
                            args[2][1] = "20" + args[2][1]
                        }
                        args[2][1] = args[2][1].replace(/\년$/, "-");
                        args[3] = args[2][1]
                    } else {
                        args[3] = (args[4].getFullYear()) + "-";
                    }
                    // 예 : 1월 입력시 01로 바꿈 & 입력 없을 시 현재 월
                    if(args[2][2]){
                        if(!/\d{2}?/.exec(args[2][2])){
                            args[2][2] = "0" + args[2][2]
                        }
                        args[2][2] = args[2][2].replace(/\월$/, "-");
                        args[3] = args[3] + args[2][2];
                    } else {
                        if((args[4].getMonth() + 1) < 10){
                            args[3] = args[3] + "0" + (args[4].getMonth() + 1) + "-"; 
                        } else {
                            args[3] = args[3] + (args[4].getMonth() + 1) + "-"; 
                        }
                    }
                    // 뒤에 남은 일 수들 입력 및 중간에 , 넣기
                    for (index = 0; index < args[2][3].length; index++) {
                        if(!/\d{2}?/.exec(args[2][3][index])){
                            args[2][3][index] = "0" + args[2][3][index]
                        }
                        args[3] = args[3] + args[2][3][index] + (index === args[2][3].length -1 ? "" : ",");
                    }
                    // 반환
                    return data.user && {
                        userId : data.user,
                        time : args[0],
                        ts : data.ts,
                        text : data.text,
                        cate : args[2][4],
                        textTime : args[3],
                        textTitle : args[2][0] + " " + args[2][4]
                    }
                } catch(err){
                    console.log("Calendar init Reg err : " + err)
                }
            } else {
                console.log("Reg Calendars Input Err : retry input : " + 
                moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm:ss") + " , err Msg : " + data.text)
            }
        });
        return resultArray;
    }
}

module.exports = router;