// -------------------- require list --------------------
const express = require('express');
const app = express();
const models = require("./models");
const user_router = require("./route/user");
const chat_router = require("./route/slackchat");
const slack_router = require("./route/slackapi");
const holiday_router = require("./route/holiday");
const generals_router = require("./route/generals");
const employee_router = require("./route/employee");
const axios = require("axios");
let jwt = require("jsonwebtoken");
const moment = require('moment');
const Agenda = require('agenda');

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('./devServer_config') : configs = require('./server_config');
// -------------------- 초기 서버 ( app ) 설정 --------------------
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://slack.com");
    res.header("Access-Control-Allow-Origin", configs.redirectDomain);
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// DB
app.use("/user", user_router);
app.use("/slack", chat_router);
app.use("/generals", generals_router);
app.use("/employee", employee_router);
app.use("/holiday", holiday_router);
app.use("/general", generals_router);
// API
app.use("/slackapi", slack_router);

// ---------- MongoDB 연동 ---------- //
const mongoConnectionString = 'mongodb://'+configs.host+':27017/agenda';
const agenda = new Agenda({ db: { address: mongoConnectionString, options: { useUnifiedTopology: true, autoReconnect: false, reconnectTries: false, reconnectInterval: false } }});

// ---------- Agenda 스케줄러 ---------- //
try {
    agenda.on('ready', () => {
        console.log('Success agenda connecting');
        // 2분
        agenda.define('Busy', {lockLifetime: 10000}, async job => {
            console.log('2분 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
            const History = axios.post(configs.domain+"/slackapi/channelhistory");
            const HistoryCal = axios.post(configs.domain+"/slackapi/channelhistorycal");
            await Promise.all([History,HistoryCal]).then((val)=>{
                console.log("Promise All History Api Suce")
            })
        });
        // 10분
        agenda.define('First', {lockLifetime: 10000}, async job => {
            console.log('10분 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
            const History = axios.post(configs.domain+"/slackapi/channelhistory");
            const HistoryCal = axios.post(configs.domain+"/slackapi/channelhistorycal");
            await Promise.all([History,HistoryCal]).then((val)=>{
                console.log("Promise All History Api Suce")
            })
        });
        // 2시간
        agenda.define('Second', {lockLifetime: 10000}, async job => {
            console.log('2시간 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
            const History = axios.post(configs.domain+"/slackapi/channelhistory");
            const HistoryCal = axios.post(configs.domain+"/slackapi/channelhistorycal");
            await Promise.all([History,HistoryCal]).then((val)=>{
                console.log("Promise All History Api Suce")
            })
        });
        // 2시간
        agenda.define('Third', {lockLifetime: 10000}, async job => {
            console.log('2시간 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
            const History = axios.post(configs.domain+"/slackapi/channelhistory");
            const HistoryCal = axios.post(configs.domain+"/slackapi/channelhistorycal");
            await Promise.all([History,HistoryCal]).then((val)=>{
                console.log("Promise All History Api Suce")
            })
        });
          
        (async () => { // IIFE to give access to async/await
        await agenda.start();
        await agenda.every('*/2 9-11 * * *', 'Busy');
        await agenda.every('*/10 12-18 * * *', 'First');
        await agenda.every('*/60 19-23/2 * * *', 'Second');
        await agenda.every('*/60 0-8/2 * * *', 'Third');
        })();
        
    });
} catch{err => {
    console.error(err);
    process.exit(-1);
}};

// -------------------- 초기 포트 및 서버 실행 --------------------
const PORT = process.env.PORT || configs.port;
models.sequelize.query("SET FOREIGN_KEY_CHECKS = 1", {raw: true}).then(() => {
    models.sequelize.sync({ force : false }).then(()=>{
        app.listen(PORT, async() => {
            async function startServer() {
                console.log(`app running on port ${PORT}`);
                try {
                    const result = await axios.get(`${configs.domain}/user/all`);
                    if(!result.data || !result.data[0]) {
                        await axios.get(configs.domain+"/slackapi/teamusers");
                        await axios.post(configs.domain+"/slackapi/channelhistoryinitcal");
                        await axios.post(configs.domain+"/slackapi/channelhistoryinittime");
                    }
                    console.log('현재 시간 : ', moment(new Date()).format('HH:mm'));
               
                } catch(err){
                    console.log("app running err ( sql db created ) : " + err);
                }
            }
            startServer();
        });
    });
});
// -------------------- slack 연동 login & access p_token created --------------------
app.get('/login', async(req, res) => {
    try {
        const result = await axios.get("https://slack.com/oauth/authorize",{
            params : {
                scope : ['chat:write:user','users:read'],
                client_id : configs.c_id,
                redirect_uri : configs.redirectDomain,
            }
        });
        res.send(result.data);
    } catch(err) {
        console.log("login trying err : " + err);
        res.end();
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
                redirect_uri : configs.redirectDomain,
            }
        });
        await axios.put(configs.domain+"/user/update",{
            userid : result.data.user_id,
            p_token : result.data.access_token,
        });
        const usertoken = getToken(result.data);

        res.send(usertoken);
    } catch(err) {
        console.log("login access err : " + err);
        res.end();
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
            expiresIn : '2400m'
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
app.get('/update', async(req, res) => {
    try {
        await axios.post(`${configs.domain}/slackapi/channelhistorycal`);
        res.send(true);
    } catch(err) {
        console.log("history update err : " + err);
        res.send(false);
    }
});
