// -------------------- require list --------------------
const express = require('express');
const app = express();
const models = require("./models");
const user_router = require("./route/user");
const chat_router = require("./route/slackchat");
const slack_router = require("./route/slackapi");
const calendar_router = require("./route/calendar");
const axios = require("axios");
// const crypto = require("crypto");
let jwt = require("jsonwebtoken");
let configs = require('./server_config');
const moment = require('moment');
const Agenda = require('agenda');

// -------------------- 초기 서버 ( app ) 설정 --------------------
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://slack.com");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
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
// API
app.use("/slackapi", slack_router);
// Default
app.get('/', (req, res) => {
    const today = moment(new Date()).format("YYYY-MM-DD");
    let setDay1 = "2020-02-20";
    let setDay2 = "2020-02-20,21";
    let setDay3 = "2020-02-20~23";

    let getDays = /(\d{4}-\d{2}-)(\d{2})([,~])?(\d{2})?/.exec(setDay2)
    if(getDays[3]){
        if(getDays[3] && getDays[3] === ","){
            console.log(",!!")
        } else {
            console.log("~!!")
        }
    } else {
        console.log("!!")
    }
    console.log(getDays)
    res.send("Hello SlackApi World!");
});

// ---------- MongoDB 연동 ---------- //
const mongoConnectionString = 'mongodb://'+configs.host+':27017/agenda';
const agenda = new Agenda({ db: { address: mongoConnectionString, options: { useUnifiedTopology: true, autoReconnect: false, reconnectTries: false, reconnectInterval: false } }});

// ---------- Agenda 스케줄러 ---------- //
try {
    agenda.on('ready', () => {
        console.log('Success agenda connecting');

        agenda.define('First', {lockLifetime: 10000}, async job => {
            console.log('10분 마다 실행', moment(new Date()).format('MM-DD HH:mm:ss'));
            await axios.post("http://localhost:5000/slackapi/channelHistory");
            await axios.post("http://localhost:5000/slackapi/channelHistoryCal");
        });

        agenda.define('Second', {lockLifetime: 10000}, async job => {
            console.log('2시간 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
            await axios.post("http://localhost:5000/slackapi/channelHistory");
            await axios.post("http://localhost:5000/slackapi/channelHistoryCal");
        });

        agenda.define('Third', {lockLifetime: 10000}, async job => {
            console.log('2시간 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
            await axios.post("http://localhost:5000/slackapi/channelHistory");
            await axios.post("http://localhost:5000/slackapi/channelHistoryCal");
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
const PORT = process.env.PORT || 5000;
models.sequelize.query("SET FOREIGN_KEY_CHECKS = 1", {raw: true})
.then(() => {
    models.sequelize.sync({ force:false }).then(()=>{
        app.listen(PORT, async() => {
            console.log(`app running on port ${PORT}`);
            try {
                await axios.get("http://localhost:5000/slackapi/teamUsers");
                // await axios.post("http://localhost:5000/slackapi/channelHistoryInitCal");
                // await axios.post("http://localhost:5000/slackapi/channelHistoryInit");
                // axios.get("http://localhost:5000/");

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
                redirect_uri : "http://localhost:3000",
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
                redirect_uri : "http://localhost:3000",
            }
        });
        await axios.put("http://localhost:5000/user/update",{
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

// const sleep = (ms) => {
//     return new Promise(resolve=>{
//         setTimeout(resolve,ms)
//     })
// }
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