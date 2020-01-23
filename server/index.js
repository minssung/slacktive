const express = require('express');
const app = express();
const models = require("./models");
const user_router = require("./route/user");
const boards_router = require("./route/slackchat");
const slack_router = require("./route/slackapi");
const axios = require("axios");
const configs = require('./server_config');

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
            scope : "identity.basic",
            client_id : configs.c_id,
            redirect_uri : "http://localhost:5000/loginslack",
            state : "loging..."
        }
    });
    res.send(result.data);
});

app.get('/loginslack', async(req,res) => {
    const result = await axios.get("https://slack.com/api/oauth.access",{
        params : {
            client_id : configs.c_id,
            client_secret : configs.c_s_id,
            code : req.query.code,
            redirect_uri : "http://localhost:5000/loginslack"
        }
    })
    res.send(result.data);
});