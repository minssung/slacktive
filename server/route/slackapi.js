const express = require("express");
const router = express.Router();
const models = require("../models");

const axios = require('axios');
const moment = require('moment');
moment.tz.setDefault("Asia/Seoul");

const User = models.user;
const Slackchat = models.slackchat;
const Holiday = models.holiday;

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../devServer_config') : configs = require('../server_config');

// 팀의 모든 유저 보기 ( 앱 포함 ) --------------------------------------------------
router.get("/teamusers", async(req,res)=>{
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
            console.log('team users list err : ', err);
        }
        const resultSet = result.data.members;
        const array = resultSet.map((data)=>{
            return {
                user : data.id,
                R_name : data.real_name,
                is_bot : data.is_bot
            }
        });

        // 테이블 생성 name 컬럼 추가 ( 봇 제외 유저만 )
        for (const user of array) {
            if(user.R_name && user.R_name !== "Slackbot" && !user.is_bot) {
                User.findOrCreate({
                    where : {
                        id : user.user,
                    },
                    defaults : {
                        id : user.user,
                        username : user.R_name,
                        state : "생성",
                        holidaycount : 20,  // default : 20
                    }
                })
            }
        }
        res.send(array);
    } catch(err){
        console.log("db created err : " + err);
        res.status(500).send(err);
    }
});

// 채널에 메시지 보내기 --------------------------------------------------
router.post("/messagepost", async(req,res)=>{
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
        res.status(500).send(err);
    }
});

// 채널의 메시지 내역 가져오기 ( 출퇴근 ) --------------------------------------------------
router.post("/channelhistory", async(req,res) =>{
    try {
        // 가장 최근 데이터 추출
        let historyOne = await axios.get(configs.domain+"/slack/oneRow");
        
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
        const resultArray = initFuncHoliday(resultSet, false);

        try {
            await Slackchat.bulkCreate(resultArray,{
                individualHooks : true,
            });
        } catch(err) {
            console.error("bulkcreate atten arr : " + err);
            res.status(500).send(err);
        }
        res.send(resultArray);
    } catch(error) {
        console.log("slack channel history err : " + error);
        res.status(500).send(error);
    }
});

// 채널의 메시지 내역 가져오기 ( 일정용 ) --------------------------------------------------
router.post("/channelhistorycal", async(req,res) =>{
    try {
        let historyOne = await axios.get(configs.domain+"/holiday/oneRow");

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
        const resultArray = initFuncHoliday(resultSet, false);

        try {
            await Holiday.bulkCreate(resultArray,{
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
router.post("/channelhistoryinittime", async(req,res) =>{
    const nowDate = moment(new Date()).format("YYYY-01-01");
    const oldest = moment(nowDate).format("X");
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
                oldest,
            }
        });
        const resultSet = (result.data.messages).reverse();
        const resultArray = initFunc(resultSet, true);

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

// 채널의 메시지 내역 가져오기 초기 실행 ( 휴가용 ) --------------------------------------------------
router.post("/channelhistoryinitcal", async(req,res) =>{
    const nowDate = moment(new Date()).format("YYYY-01-01");
    const oldest = moment(nowDate).format("X");
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
                oldest,
            }
        });
        const resultSet = (result.data.messages).reverse();
        const resultArray = initFuncHoliday(resultSet, true);

        try {
            await Holiday.bulkCreate(resultArray,{
                individualHooks : true,
            })
        } catch(err) {
            console.error("bulkcreate Init Cal err : " + err);
        }
        res.send(resultArray);
    } catch(error) {
        console.log("slack channelCal history err : " + error);
    }
});

// 팀의 전체 채널 리스트 가져오기 --------------------------------------------------
router.post("/channellist", async(req,res)=>{
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
        res.status(500).send(err);
    }
});

// 채널의 메시지 삭제 --------------------------------------------------
router.post("/messagedelete", async(req,res)=>{
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
        res.status(500).send(err);
    }
});

// 채널의 메시지 업데이트 --------------------------------------------------
router.post("/messageupdate", async(req,res)=>{
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
        res.status(500).send(err);
    }
});

// 인증 및 신원 정보 조회 --------------------------------------------------
router.post("/authinfo", async(req,res)=>{
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
        res.status(500).send(err);
    }
});

/* ------------------------------------ ===================== ----------------------------------
--------------------------------------- 필터 함수 및 에러 필터 함수 ----------------------------------
--------------------------------------- ===================== ---------------------------------- */

// 정규식 필터를 통한 출퇴근 디비 생성 -> init 의 경우 init => true
function initFunc(data, init) {
    let returnArray = [];

    data.forEach(data => {
        if(configs.timeAttenden.test(data.text)) {
            let textSplit = configs.timeAttenden.exec(data.text);
            let hour = null;
            let minute = null;
            let cate = "출근";

            /** 
             *  textSplit 결과
             *  0번째 인덱스 => 전체값
             *  1번째 인덱스 => 시
             *  2번째 인덱스 => 분
             *  3번째 인덱스 => 구분
             * 
             *  ex) 10시 28분 현대ㅇㄱ
            */

            if(textSplit[1]) hour = textSplit[1].replace(/시/, "");      // ex : 10
            if(textSplit[2]) minute = textSplit[2].replace(/분/, "");    // ex : 28
            switch(textSplit[3]) {                                      // ex : ㅇㄱ => 외근
                case "ㅊㄱ" : cate = "출근"; break;
                case "ㅌㄱ" : cate = "퇴근"; break;
                case "ㅇㄱ" : cate = "외근"; break;
                default : cate = textSplit[3]; break;
            }
            
            // 시 처리
            if(hour) hour = parseInt(hour);
            else hour = parseInt(moment.unix(data.ts).utcOffset("+09:00").format("HH"));        // 시가 없다면 해당 텍스트를 찍은 시

            // 분 처리
            if(minute) minute = parseInt(minute);
            else minute = parseInt(moment.unix(data.ts).utcOffset("+09:00").format("mm"));      // 분이 없다면 해당 텍스트를 찍은 분

            // 해당 유저가 당일 반차인 경우에 대한 조건 필요 -> 오전반차인 경우 오후 출근이기에 지각이 아님 ( 15시 이후는 지각 )
            if(hour >= configs.Am1 && cate === "출근") cate = "지각";

            // 시:분
            let textTime = hour + ":" + minute;

            returnArray.push({
                userId : data.user,
                text : data.text,
                time : moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm"),
                ts : data.ts,
                state : cate,
                textTime : textTime,
            });
        } else {
            console.log("정규식에 해당하지 않는 채팅입니다. 채팅내용, 시간 = ", data.text, moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm"))
            if(!init) errMessageMe(data, "times")
        }
    });

    return returnArray;
} 

// 정규식 필터를 통한 휴가 디비 생성  -> init 의 경우 init => true
function initFuncHoliday(data, init) {
    let returnArray = [];

    data.forEach(data => {
        if(configs.calendarReg.test(data.text)) {
            let textSplit = configs.calendarReg.exec(data.text);
            let year = moment.unix(data.ts).utcOffset("+09:00").format("YYYY");
            let month = moment.unix(data.ts).utcOffset("+09:00").format("MM");;
            let days = null;
            let cate = null;
            let textTime = [];

            let startDate = null;
            let endDate = null;

            /**
             *  textSplit 결과
             *  [0] => 필터없는 전체 결과
             *  [1] => 이름 ( 누구인지 )
             *  [2] => 년
             *  [3] => 월
             *  [4] => 일 ( 일, 일,일, 일~일 )
             *  [5] => 마지막 일 ( 필요없는 데이터 )
             *  [6] => 내용 ( 휴가/반차/병가 등 )
             */

            if(textSplit[2]) {
                year = textSplit[2].replace(/년/g,"");
                if(!/\d{4}/.test(year)) year = "20" + year;
            }
            if(textSplit[3]) {
                month = textSplit[3].replace(/월/g,"");
                if(!/\d{2}/.test(month)) month = "0" + month;   
            }
            if(textSplit[4]) days = textSplit[4].replace(/일/g,"");
            cate = textSplit[6].replace(/ /,"") || "휴가";

            startDate = year + "-" + month + "-";
            endDate = year + "-" + month + "-";

            // 단일 휴가의 경우
            if(!/[~,]/.test(days)) {
                if(!/\d{2}/.test(days)) days = "0" + days; 
                startDate = startDate + days;
                endDate = endDate + days;
                textTime.push({ startDate, endDate });
            }

            // 컴마를 이용한 복수 휴가의 경우
            if(/,/.test(days)) {
                let comma = days.split(",");

                /**
                 *  comma 결과값
                 *  , 수만큼 배열 생성
                 *  ex ) 1,2 => 배열[1]개, 3,4,5,6 => 배열[3]개
                 */

                let startDateTemp = startDate;
                let endDateTemp = endDate;
                comma.forEach(data => {
                    if(!/\d{2}/.test(data)) data = "0" + data; 
                    textTime.push({ startDate : startDateTemp + data, endDate : endDateTemp + data });
                })
            }

            // 물결을 이용한 복수 휴가의 경우
            if(/~/.test(days)) {
                let backtick = days.split("~");

                /**
                 *  backtick 결과값
                 *  배열[1]개 생성
                 *  ex ) 1~3 => 배열[1,3]
                 *  + 만약 ~ 뒤에 배열값에 년월을 새로 추가한 경우 해당 값도 새롭게 처리하여 엔드데이트에 추가
                 */

                if(!/\d{2}/.test(backtick[0])) backtick[0] = "0" + backtick[0]; 
                if(/(\d*년)\s*(\d*월)\s*(\d*)?/.test(backtick[1])) {
                    backtick[1] = backtick[1].replace(/ /,"");
                    let backtickSplit = /(\d*년)\s*(\d*월)\s*(\d*)/.exec(backtick[1]);

                    if(backtickSplit[1]) backtickSplit[1] = backtickSplit[1].replace(/년/g,"");
                    if(backtickSplit[2]) backtickSplit[2] = backtickSplit[2].replace(/월/g,"");
                    if(!/\d{4}/.test(backtickSplit[1])) backtickSplit[1] = "20" + backtickSplit[1];  
                    if(!/\d{2}/.test(backtickSplit[2])) backtickSplit[2] = "0" + backtickSplit[2];
                    if(!/\d{2}/.test(backtickSplit[3])) backtickSplit[3] = "0" + backtickSplit[3];

                    endDate = backtickSplit[1] + "-" + backtickSplit[2] + "-";
                    backtick[1] = backtickSplit[3];
                } else if(!/\d{2}/.test(backtick[1])) backtick[1] = "0" + backtick[1]; 
                textTime.push({ startDate : startDate + backtick[0], endDate : endDate + backtick[1] });
            }

            returnArray.push({
                text : data.text,
                time : moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm"),
                ts : data.ts,
                cate : cate,
                textTime : textTime,
                userId : data.user,
            })
        } else {
            console.log("정규식에 해당하지 않는 채팅입니다. 채팅내용, 시간 = ", data.text, moment.unix(data.ts).utcOffset("+09:00").format("YYYY-MM-DD HH:mm"))
            if(!init) errMessageMe(data, "holiday")
        }
    });

    return returnArray;
}

// 정규식에 어긋난 내용은 개인 슬랙 채널에 메시지를 보냄
// data => 데이터 값
// channel => 어떤 채널에 보낼 것인지
errMessageMe = async(data,channel) => {
    try {
        let textChannel = "";
        if(channel === "times") textChannel = configs.channel_time;
        else textChannel = configs.channel_calendar;

        const user = await User.findOne({ where : { id : data.user } });

        if(!user.dataValues) return console.log(data.user + "에 해당하는 유저가 없습니다.");
        if(!user.dataValues.p_token) return console.log(data.user + "의 토큰값이 없습니다. 로그인해주세요.");

        let post = null;
        if(user.dataValues.userchannel) {
            post = axios({
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
        }

        const delet = axios({
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

        await Promise.all([post,delet]).then(data => { if(data) console.log("post & delete 적용"); })
    } catch(err){
        console.log("reg err => post me message || delete message func err : " + err);
    }
}

module.exports = router;