const express = require('express');
const app = express();
const models = require("./models");
const user_router = require("./route/user");
const boards_router = require("./route/slackchat");
const slack_router = require("./route/slackapi");
const axios = require("axios");
let configs = require('./server_config');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://slack.com");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", user_router);
app.use("/slack", boards_router);
app.use("/slackapi", slack_router);

app.get('/', (req, res) => {
    res.send("Hello World!");
});

const PORT = process.env.PORT || 5000;
models.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", {raw: true})
.then(() => {
    models.sequelize.sync({ force:true }).then(()=>{
        app.listen(PORT, () => {
            console.log(`app running on port ${PORT}`);
        });
    });
})

app.get('/login', async(req, res) => {
    const result = await axios.get("https://slack.com/oauth/authorize",{
        params : {
            scope : "chat:write:user",
            client_id : configs.c_id,
            redirect_uri : "http://localhost:5000/loginslack",
            state : req.param.state
        }
    });
    res.send(result.data);
});

app.get('/loginslack', async(req,res) => {
    const result = await axios({
        method : "get",
        url : "https://slack.com/api/oauth.access",
        params : {
            client_id : configs.c_id,
            client_secret : configs.c_s_id,
            code : req.query.code,
            redirect_uri : "http://localhost:5000/loginslack"
        }
    })
    let userInfoJson = {
        u_token : result.data.access_token,
        u_id : result.data.user_id
    };

    configs.p_token = userInfoJson.u_token;
    configs.bearer_p_token = "Bearer " + userInfoJson.u_token;
    configs.u_id = userInfoJson.u_id;
    
    console.log(configs);
    res.redirect("http://localhost:3000/");
});