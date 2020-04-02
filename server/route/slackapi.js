const express = require("express");
const router = express.Router();
//const configs = require("../server_config");
const axios = require('axios');
const models = require("../models");
const moment = require('moment');
moment.tz.setDefault("Asia/Seoul");

const User = models.user;
const Slackchat = models.slackchat;
const Calendar = models.calendar;
const General = models.general;

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../devServer_config') : configs = require('../server_config');

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
        try {
            result.data.ok === true
        } catch (err) {
            console.log('어딘가 문제가 있군 그래', err);
        }
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
        res.status(500).send(err);
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
        let historyOne = await axios.get(configs.domain+"/slack/oneRow");
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
        let timeReg = [];       // 시간을 정규식으로 처리
        let stateSet = "";      // 상태 디비 입력 용도
        let resultArray = [];
        resultArray = regFunc("times",resultSet,Changetime,timeCheck,timeReg,stateSet);
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
        let historyOne = await axios.get(configs.domain+"/calendar/oneRow");
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
        let resultArray = regFunc("calendar",resultSet,Changetime,calReg,calArray,textTimes,search)
        try {
            await Calendar.bulkCreate(resultArray,{
                individualHooks : true,
            })
        } catch(err) {
            console.error("bulkcreate cal err : " + err);
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
        let Changetime = "";    // 디비에 들어갈 리얼 타임
        let timeCheck = "";     // 시간 비교 용도
        let timeReg = [];       // 시간을 정규식으로 처리
        let stateSet = "";      // 상태 디비 입력 용도
        let resultArray = [];
        resultArray = regFunc("times",resultSet,"init",Changetime,timeCheck,timeReg,stateSet);
        try {
            await Slackchat.bulkCreate(resultArray,{
                individualHooks : true,
            });
        } catch(err) {
            console.error("bulkcreate Init atten arr : " + err);
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
        let resultArray = regFunc("calendar",resultSet,"init",Changetime,calReg,calArray,textTimes,search)
        try {
            await Calendar.bulkCreate(resultArray,{
                individualHooks : true,
            })
        } catch(err) {
            console.error("bulkcreate Init Cal err : " + err);
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

// 해당 데이터의 유저 조회 --------------------------------------------------
router.get("/userGetVerify", async(req,res)=>{
    let result = [];
    try {
        if(req.query.select === "calendar"){
            result = await Calendar.findOne({ where : { id : req.query.id } });
        } else {
            result = await General.findOne({ where : { id : req.query.id } });
        }
    }catch(err){
        console.log("user Get verify err : " + err);
    }
    res.send(result)
});

// 정규식을 거쳐 처리하는 함수 --------------------------------------------------
function regFunc(channel ,resultSet,init, ...args){
    let resultArray = [];
    if(channel === "times") {
        // 출퇴근의 처리
        // args : 0 => real time
        // args : 1 => check time
        // args : 2 => time Reg result
        // args : 3 => state var
        resultSet.forEach(data=> {
            args[0] = moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm:ss");
            args[1] = moment.unix(data.ts).utcOffset("+09:00").format("HH:mm");
            // data.text 조건문 처리
            if(configs.timeAttenden.test(data.text)) {
                // 출퇴근에 대한 정규식 처리
                args[2] = configs.timeAttenden.exec(data.text);
                // 0번째 요소 제거
                args[2].shift();
                switch(args[2][2]){
                    case "ㅊㄱ" : args[2][2] = "출근"; break;
                    case "ㅌㄱ" : args[2][2] = "퇴근"; break;
                    case "ㅇㄱ" : args[2][2] = "외근"; break;
                }
                try {
                    // 본인 지정 시간대가 있을 경우
                    if(args[2][0] && parseInt(args[2][0]) <= 11) {
                        args[3] = (/출근/.test(args[2][2])) ? "출근" : args[2][2]
                        // 만약 분까지 입력 시에
                        if(args[2][1]) {
                            // 11시이상이며 0분을 넘었다면
                            if(parseInt(args[2][0]) >= 11 && parseInt(args[2][1]) > 0) {
                                args[3] = "지각"
                            }
                        }
                        // 지정 시간 없이 텍스트만 입력 시
                    } else {
                        // 11시 이전 8시 반 이후 지정 텍스트 같이 입력 시
                        if (args[1] <= configs.Am1 && args[1] >= configs.Am0) {
                            args[3] = args[2][2]
                            // 11시 이후 입력 텍스트 경우
                        } else if(args[1] > configs.Am1 && args[1] <= configs.Pm0) {
                            args[3] = (/출근/.test(args[2][2])) ? "지각" : args[2][2]
                            // 4시 50분 이후 입력 텍스트 경우
                        } else if(args[1] > configs.Pm0) {
                            args[3] = (/퇴근/.test(args[2][2])) ? "퇴근" : args[2][2];
                            // 야근 체크
                            try {
                                (async ()=> {
                                    let useridCheck = await axios.get(`${configs.domain}/user/one?userid=${data.user}`);
                                    let whatTime = await axios.get(`${configs.domain}/slack/onworktime?userid=${useridCheck.data.id}`);
                                    let timeValue = await moment.unix(whatTime.data.ts).utcOffset("+09:00").format("HH:mm");
                                    const timeArray = timeValue.split(':');
                                    let setIntTime = parseInt(timeArray[0])+10+':'+parseInt(timeArray[1]);
                                    let setStringTime = String(setIntTime);
                                    if (args[1] > setStringTime) {
                                        args[3] = (/퇴근/.test(args[2][2])) ? "야근" : args[2][2]
                                    }
                                })();
                            } catch (error) {
                                console.log('Night shift Error : '. error)
                            };
                        } 
                    }
                    // 유저 상태 업데이트
                    User.update({
                        state : args[3]
                    },{
                        where : { id : data.user }
                    })
                } catch (err) {
                    console.log("Reg Times Err : " + err)
                }
                // 추가해야 될 예외 처리
                // 오전 반차의 경우 오후에 출근 텍스트 입력 시 지각 처리 x
                resultArray.push({
                    userId : data.user,
                    time : args[0],
                    ts : data.ts,
                    text : data.text,
                    state : args[3]
                });
            } else {
                if(!init){
                    errMessageMe(data,channel);
                }
                console.log("Reg Times Input Err : retry input : " + 
                moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm:ss")  + " , err Msg : " + data.text)
            }
        });
    } else {
        // 일정용 처리
        // args : 0 => real time
        // args : 1 => cal Reg
        // args : 2 => cal array
        // args : 3 => text time
        // args : 4 => search
        let index = 0;
        resultSet.map(data => {
            args[0] = moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm:ss");
            args[1] = configs.calendarReg.exec(data.text);
            args[2] = [];
            args[3] = "";
            if(configs.calendarReg.test(data.text)) {
                try {
                    // 배열에다가 정규표현식으로 담기
                    for (index = 0; index < args[1].length; index++) {
                        // 불필요한 요소 제거
                        if(index === 0 || index === 5)
                            continue;
                            // 1 : 년
                            // 2 : 월
                            // 3 : 일 수에 대한 다차원 배열
                            // 4 : 내용
                            args[2].push(args[1][index]);
                    }
                    // 일 수를 배열로 받아서 변환
                    // 일, 공백 한칸, ,기준으로 스플릿
                    args[2][3] = args[1][4].split(/\,/)
                    for (index = 0; index < args[2][3].length; index++) {
                        args[4] = args[2][3].indexOf("")
                        if(args[4]!= -1)
                        args[2][3].splice(args[4],1)
                    }
                    // 예 : 20년 입력시 2020으로 바꿈 & 입력 없을 시 작성한 년도
                    if(args[2][1]){
                        if(!/\d{4}?/.test(args[2][1])){
                            args[2][1] = "20" + args[2][1]
                        }
                        args[2][1] = args[2][1].replace(/\년$/, "-");
                        args[3] = args[2][1]
                    } else {
                        args[3] = /^(\d{4}-)/.exec(args[0])[1]
                    }
                    // 예 : 1월 입력시 01로 바꿈 & 입력 없을 시 현재 월
                    if(args[2][2]){
                        if(!/\d{2}?/.test(args[2][2])) {
                            args[2][2] = "0" + args[2][2]
                        }
                        args[2][2] = args[2][2].replace(/\월$/, "-");
                        args[3] = args[3] + args[2][2];
                    } else {
                        if(/^\d{4}-(\d{2})/.test(args[0])[1] < 10) {
                            args[3] = args[3] + /^\d{4}-(\d{2}-)/.exec(args[0])[1]
                        } else {
                            args[3] = args[3] + /^\d{4}-(\d{2}-)/.exec(args[0])[1]
                        }
                    }
                    // 뒤에 남은 일 수들 입력 및 중간에 , 넣기
                    let dateFormat = "";
                    let splitDate = [];
                    for (index = 0; index < args[2][3].length; index++) {
                        args[2][3][index] = args[2][3][index].replace(/\년/, "-");
                        args[2][3][index] = args[2][3][index].replace(/\월/, "-");
                        args[2][3][index] = args[2][3][index].replace(/\일/g, "");
                        args[2][3][index] = args[2][3][index].replace(/\s*/g, "");
                        if(!/\d{2}?/.test(args[2][3][index])){
                            args[2][3][index] = "0" + args[2][3][index]
                        }
                        if(/~/.test(args[2][3][index])) {
                            splitDate = args[2][3][index].split("~")
                            if(/\d{1,}-\d{1,}-\d{1,}/.test(splitDate[1])) {
                                dateFormat = moment(splitDate[1], "YYYY-M-D").format("YYYY-MM-DD")
                            } else if(/\d{1,}-\d{1,}$/.test(splitDate[1])) {
                                dateFormat = moment(splitDate[1], "M-D").format("YYYY-MM-DD")
                            } else {
                                dateFormat = moment(splitDate[1], "D").format("YYYY-MM-DD")
                            }
                            args[3] = args[3] + splitDate[0] + "~" + dateFormat;
                        } else {
                            args[3] = args[3] + args[2][3][index] + (index === args[2][3].length -1 ? "" : ",");
                        }
                    }
                    // 반환
                    resultArray.push({
                        userId : data.user,
                        time : args[0],
                        ts : data.ts,
                        text : data.text,
                        cate : args[2][4],
                        textTime : args[3],
                        state : "휴가관련",
                    })
                } catch(err){
                    console.log("Calendar init Reg err : " + err)
                }
            } else {
                if(!init){
                    errMessageMe(data,channel);
                }
                console.log("Reg Calendars Input Err : retry input : " + 
                moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm:ss") + " , err Msg : " + data.text)
            }
        });
    }
    return resultArray;
}

// 정규식에 어긋난 내용은 개인 슬랙 채널에 메시지를 보냄
errMessageMe = async(data,channel) => {
    try {
        const user = await User.findOne({
            where : {
                id : data.user,
            }
        });
        await axios({
            method : "post",
            url : "https://slack.com/api/chat.postMessage",
            header : {
                "Content-type" : "application/json",
                "Authorization" : "Bearer " + user.dataValues.p_token,
            },
            params : {
                token : user.dataValues.p_token,
                channel : user.dataValues.userchannel,
                text : "양식에 맞지 않는 메시지 : " + data.text + " 이(가) 등록되지 않았습니다.",
                as_user: true
            }
        });
        let textChannel = "";
        if(channel === "times") {
            textChannel = configs.channel_time;
        } else {
            textChannel = configs.channel_calendar;
        }
        await axios({
            method : "post",
            url : "	https://slack.com/api/chat.delete",
            header : {
                "Content-type" : "application/json",
                "Authorization" : "Bearer " + user.dataValues.p_token,
            },
            params : {
                token : user.dataValues.p_token,
                channel : textChannel,
                ts : data.ts,
            }
        });
    } catch(err){
        console.log("reg post me message err : " + err);
    }
}

module.exports = router;