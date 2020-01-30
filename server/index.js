// -------------------- require list --------------------
const express = require('express');
const app = express();
const models = require("./models");
const user_router = require("./route/user");
const boards_router = require("./route/slackchat");
const slack_router = require("./route/slackapi");
const axios = require("axios");
let jwt = require("jsonwebtoken");
let configs = require('./server_config');

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

app.use("/user", user_router);
app.use("/slack", boards_router);
app.use("/slackapi", slack_router);

app.get('/', (req, res) => {
    res.send("Hello SlackApi World!");
});

// -------------------- 초기 포트 및 서버 실행 --------------------
const PORT = process.env.PORT || 5000;
models.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", {raw: true})
.then(() => {
    models.sequelize.sync({ force:false }).then(()=>{
        app.listen(PORT, async() => {
            console.log(`app running on port ${PORT}`);
            try {
                await axios.get("http://localhost:5000/slackapi/teamUsers");
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
                scope : "chat:write:user",
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
            u_id : result.data.user_id,
            p_token : result.data.access_token,
            b_p_token : "Bearer " + result.data.access_token,
        });
        const usertoken = getToken(result.data);

        res.send(usertoken);
    } catch(err) {
        console.log("login access err : " + err);
    }
});
// -------------------- ********** --------------------

// -------------------- token sign & token verify--------------------
function getToken(data){
    try {
        const getToken = jwt.sign({
            userid : data.user_id
        },
            configs.serectKey,
        {
            expiresIn : '5m'
        });
        return getToken;
    } catch(err) {
        console.log("token sign err : " + err);
    }
}

app.get('/verify', (req,res)=>{
    try {
        const token = req.headers['x-access-token'] || req.query.token;
        const getToken = jwt.verify(token, configs.serectKey);
        console.log("token verify");
        res.send(getToken);
    } catch(err) {
        console.log("token verify err" + err);
    }
});

// -------------------- ********** --------------------