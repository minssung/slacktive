// -------------------- require list --------------------
const express = require('express');
const app = express();
const models = require("./models");
const user_router = require("./route/user");
const chat_router = require("./route/slackchat");
const slack_router = require("./route/slackapi");
const calendar_router = require("./route/calendar");
const generals_router = require("./route/generals");
const axios = require("axios");
let jwt = require("jsonwebtoken");
let configs = require('./server_config');
const moment = require('moment');
const Agenda = require('agenda');

// -------------------- 초기 서버 ( app ) 설정 --------------------
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://slack.com");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Origin", "http://dev.cedar.kr:2222");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// DB
app.use("/user", user_router);
app.use("/slack", chat_router);
app.use("/calendar", calendar_router);
app.use("/generals", generals_router);
// API
app.use("/slackapi", slack_router);
// Default
app.get('/', (req, res) => {
    //let reg = /\(?(수정|삭제)?\)?\s*\[(\s*\S*\s*)\]\s*(\d*년)?\s*(\d*월)?\s*((\d*일?,*\s*~*)*\s*일?)*\s*(\W*)\s*(\_)*\s*(\d*년)?\s*(\d*월)?\s*((\d*일?,*\s*~*)*\s*일?)*/
    // let text = moment().format()
    // moment.locale('ko')
    // let mom = moment(text).format("YYYY. M. D (ddd) LT");
    // console.log(mom)
    // let dp = moment(mom, "YYYY/MM/DD")
    // console.log(moment(dp).format("YYYY-M-D LT"))
    res.send("Hello SlackApi World!");
});



// ---------- MongoDB 연동 ---------- //
const mongoConnectionString = 'mongodb://'+configs.host+':27017/agenda';
const agenda = new Agenda({ db: { address: mongoConnectionString, options: { useUnifiedTopology: true, autoReconnect: false, reconnectTries: false, reconnectInterval: false } }});

// ---------- Agenda 스케줄러 ---------- //
try {
    agenda.on('ready', () => {
        console.log('Success agenda connecting');
        // 10분
        agenda.define('First', {lockLifetime: 10000}, async job => {
            console.log('10분 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
            const History = axios.post("http://localhost:5000/slackapi/channelHistory");
            const HistoryCal = axios.post("http://localhost:5000/slackapi/channelHistoryCal");
            await History;
            await HistoryCal;
            await calendarStateUpdatFunc();
        });
        // 2시간
        agenda.define('Second', {lockLifetime: 10000}, async job => {
            console.log('2시간 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
            const History = axios.post("http://localhost:5000/slackapi/channelHistory");
            const HistoryCal = axios.post("http://localhost:5000/slackapi/channelHistoryCal");
            await History;
            await HistoryCal;
            await calendarStateUpdatFunc();
        });
        // 2시간
        agenda.define('Third', {lockLifetime: 10000}, async job => {
            console.log('2시간 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
            const History = axios.post("http://localhost:5000/slackapi/channelHistory");
            const HistoryCal = axios.post("http://localhost:5000/slackapi/channelHistoryCal");
            await History;
            await HistoryCal;
            await calendarStateUpdatFunc();
        });
          
        (async () => { // IIFE to give access to async/await
        await agenda.start();
        await agenda.every('*/10 9-18 * * *', 'First');
        await agenda.every('*/60 19-23/2 * * *', 'Second');
        await agenda.every('*/60 0-8/2 * * *', 'Third');
        })();
        
    });
} catch{err => {
    console.error(err);
    process.exit(-1);
}};

// -------------------- 초기 포트 및 서버 실행 --------------------
const PORT = process.env.PORT || 3333;
models.sequelize.query("SET FOREIGN_KEY_CHECKS = 1", {raw: true})
.then(() => {
    models.sequelize.sync({ force:true }).then(()=>{
        app.listen(PORT, async() => {
            console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
            if (process.env.NODE_ENV === undefined) {
                console.log('undefined 일 때');
            }
            if (process.env.NODE_ENV === 'developer') {
                console.log('developer 일 때');
            }
            console.log(`app running on port ${PORT}`);
            try {
                await axios.get("http://dev.cedar.kr:3333/slackapi/teamUsers");
                await axios.post("http://dev.cedar.kr:3333/slackapi/channelHistoryInitCal");
                await axios.post("http://dev.cedar.kr:3333/slackapi/channelHistoryInit");
                // await axios.get("http://localhost:5000/")
                // < ----------- 현재 시간의 date string ----------- >
                let nowtimeString = moment(new Date()).format('HH:mm')
                console.log('현재 시간 : ', nowtimeString);
                
            } catch(err){
                console.log("app running err ( sql db created ) : " + err);
            }
        });
    });
})
// -------------------- slack 연동 login & access p_token created --------------------
app.get('/login', async(req, res) => {
    try {
        const result = await axios.get("https://slack.com/oauth/authorize",{
            params : {
                scope : 'chat:write:user,users:read',
                client_id : configs.c_id,
                redirect_uri : "http://dev.cedar.kr:2222",
            }
        });
        res.send(result.data);
    } catch(err) {
        console.log("login trying err : " + err);
    }
});
app.get('/login-access', async(req,res) => {
    try {
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/oauth.access",
            params : {
                client_id : configs.c_id,
                client_secret : configs.c_s_id,
                code : req.query.code,
                redirect_uri : "http://dev.cedar.kr:2222",
            }
        });
        await axios.put("http://dev.cedar.kr:3333/user/update",{
            userid : result.data.user_id,
            p_token : result.data.access_token,
        });
        const usertoken = getToken(result.data);

        res.send(usertoken);
    } catch(err) {
        console.log("login access err : " + err);
    }
});
// -------------------- ********** --------------------

// -------------------- token sign & token verify --------------------
function getToken(data){
    try {
        const getToken = jwt.sign({
            userid : data.user_id
        },
            configs.secretKey,
        {
            expiresIn : '600m'
        });
        return getToken;
    } catch(err) {
        console.log("token sign err : " + err);
    }
}

app.get('/verify', (req,res)=>{
    try {
        const token = req.headers['x-access-token'] || req.query.token;
        const getToken = jwt.verify(token, configs.secretKey);
        console.log("token verify");
        res.send(getToken);
    } catch(err) {
        console.log("token verify Api err " + err);
        res.send("err");
    }
});
// -------------------- ********** --------------------

// -------------------- index Api --------------------
app.get('/updateHistorys', async(req,res) => {
    try {
        const resultC = axios.post("http://localhost:5000/slackapi/channelHistoryCal");
        const resultH = axios.post("http://localhost:5000/slackapi/channelHistory");
        const updatDate = new Date();
        await resultC;
        await resultH;
        res.send(updatDate);
    } catch(err) {
        console.log("index api & history updat err : " + err)
    }
})
// 갱신 버튼 누를 시 즉시 상태 업데이트 시도
app.get('/updatState', async(req,res) => {
    let text = "";
    try {
        await calendarStateUpdatFunc();
        text = "업데이트 성공"
    } catch (err) {
        text = "업데이트 에러"
    }
    res.send(text)
});

// calendar 내용 토대로 오늘 날짜의 일정이 있는 사람의 상태를 체크 및 업뎃 -> 휴가, 병가, 미팅, 회의 등..
async function calendarStateUpdatFunc() {
    const todays = moment(new Date()).format('YYYY-MM-')
    const today = moment(new Date()).format('YYYY-MM-DD')
    try {
        const result = await axios.get(`http://localhost:5000/calendar/allTime?textTime=${todays}`);
        let resultSet = result.data
        
        resultSet.forEach((data) => {
            let getDays = /(\d{4}-\d{2}-)(\d{2}?([,~]?\d{2}?)*)/.exec(data.textTime);
            let update = false;
            // 0 : default
            // 1 : 년-월-
            // 2 : 일 수 배열 혹은 단일
            // 3 : 단일 인지 복수 인지 여부를 나타낼 값
            if(getDays[3]){
                if(/\,{1,}/.exec(getDays[2])){
                    getDays[2] = getDays[2].split(/[,~]/)
                    // , 기준 일 시 배열로 나눠서 각각 오늘 날짜와 검증
                    for (let index = 0; index < getDays[2].length; index++) {
                        getDays[2][index] = todays + getDays[2][index]
                        if(getDays[2][index] === today){
                            update = true;
                            break;
                        }
                    }
                } else {
                    // ~ 기준 일 시 각각 나누고 오늘 날짜와 시간 차를 계산하여 검증
                    getDays[2] = getDays[2].split(/[,~]/)
                    for (let index = 0; index < getDays[2].length; index++) {
                        getDays[2][index] = todays + getDays[2][index]
                    }
                    if(moment(getDays[2][0]).diff(today) <= 0 && moment(getDays[2][getDays[2].length -1]).diff(today) >= 0){
                        update = true;
                    }
                }
            } else {
                // 단일 날짜가 오늘 날짜인지 검증
                if(data.textTime === today){
                    update = true;
                }
            }
            // 검증에서 true 일 시 업데이트
            if(update){
                models.user.update({
                    id : data.userId,
                    state : data.cate,
                }, {
                    where : {
                        id : data.userId,
                    }
                })
            }
        });
    } catch (err){
        console.log("scheduler err code calendars selt : " + err);
    }
}