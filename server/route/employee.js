const express = require("express");
const router = express.Router();
const models = require("../models");
const moment = require('moment');
const axios = require('axios');

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../devServer_config') : configs = require('../server_config');

// Employee Data Count
router.get("/dataCount", async(req, res) => {
    try {
        const query = `SELECT count(*) FROM users`;
        let result = await models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT, raw: true });

        res.send(result)

    } catch (err) {
        console.log('Employee dataCount Check Error', err);
    }
})

// Employee Status Data
// 현재 날짜를 바탕으로 데이터를 불러들이기 때문에 날짜 갱신이 필요함.
router.post("/status", async(req, res) => {
    try {
        const query = `SELECT * FROM users`;
        let result = await models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT, raw: true });

        const today = moment().format('YYYY-MM');
        // 현재 날짜에서 다음 달 구하기
        const date = new Date();
        const onePlusMonth = date.setMonth(date.getMonth() + 1);
        const today2 = moment(onePlusMonth).format('YYYY-MM');

        let array = [];

        const userDB = async() => {
            try {
                for (i = 0; i < result.length; i++) {
                    let vacationApi = await axios.get(`${configs.domain}/holiday/vacation?cate=`+encodeURI('휴가')+`&userid=${result[i].id}&time=${today}&time2=${today2}`);
                    let halfVacationApi = await axios.get(`${configs.domain}/holiday/halfVacation?userid=${result[i].id}&time=${today}&time2=${today2}`);
                    let tardyApi = await axios.get(`${configs.domain}/slack/stateload?state=`+encodeURI('지각')+`&userid=${result[i].id}&time=${today}&time2=${today2}`);
                    let onworkApi = await axios.get(`${configs.domain}/slack/onwork?userid=${result[i].id}&time=${today}&time2=${today2}`);
                    let NightShiftApi = await axios.get(`${configs.domain}/slack/stateload?state=`+encodeURI('야근')+`&userid=${result[i].id}&time=${today}&time2=${today2}`);

                    await Promise.all([vacationApi,halfVacationApi,tardyApi,onworkApi,NightShiftApi]).then(val=>{
                        halfVacationApi = val[1].data.length/2;
                        vacationApi = val[0].data.length + halfVacationApi;
                        tardyApi = val[2].data.length;
                        onworkApi = val[3].data.length;
                        NightShiftApi = val[4].data.length;
                    })

                    array.push({
                        username : result[i].username,
                        vac : vacationApi,
                        tardy : tardyApi,
                        onworktime : onworkApi,
                        nightshift : NightShiftApi
                    });
                }

            } catch (err) {
                console.log('TRY CATCH', err);
            }
        }
        await userDB();

        res.send(array);

    } catch(err) {
        console.log("select users all err : " + err);
        res.end();
    }
});

// Module Exports --------------------
module.exports = router;