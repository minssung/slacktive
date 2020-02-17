//  ------------------------------------- First Setting -------------------------------------
const express = require("express");
const router = express.Router();
const models = require("../models");

// DB Setting --------------------
const Calendar = models.calendar;
 
// ------------------------------------- DB CRUD -------------------------------------
// DB SelectAll --------------------
router.get("/all", async(req, res) => {
    try {
        const result = await Calendar.findAll({
            include : [{
                model : models.user,
                attributes : ['username']
            }],
            order : [[
                'id' , 'ASC'
            ]]
        });
        res.send(result);
    } catch(err) {
        console.log("select Calendar all err : " + err)
    }
});

router.get("/allTime", async(req, res) => {
    try {
        const result = await Calendar.findAll({
            include : [{
                model : models.user,
                attributes : ['username']
            }],
            order : [[
                'id' , 'ASC'
            ]],
            where : {
                textTime : req.query.textTime
            }
        });
        res.send(result);
    } catch(err) {
        console.log("select Calendar all err : " + err)
    }
});

// DB SelectOne --------------------
router.get("/one", async(req, res) => {
    try {
        const result = await Calendar.findOne({
            where : {
                id : req.query.id
            }
        });
        res.send(result);
    } catch(err) {
        console.log("select Calendar one err : " + err);
    }
});

// DB SelectOne Id --------------------
router.get("/oneRow", async(req, res) => {
    try {
        let result = await Calendar.findOne({
            limit : 1,
            order : [
                [ 'time','DESC']
            ]
        });
        res.send(result);
    } catch (err){
        console.log("select chat one err : " + err);
    }
});

// DB FineOrCreate --------------------
router.post("/create", async(req, res) => {
    let result = false;
    try{
        await Calendar.findOrCreate({
            where : {
                ts : req.body.ts,
                textTime : req.body.textTime,
                userId : req.body.userId,
                cate : req.body.cate,
            },
            defaults : {
                text: req.body.text,
                cate : req.body.cate,
                ts : req.body.ts,
                time : req.body.time,
                textTime : req.body.textTime,
                textTitle : req.body.textTitle,
                userId : req.body.userId,
            }
        }).spread((none, created)=>{
            if(created){
                result = true;
            }
        });
    }catch(err) {
        console.error("created Calendar err : " + err);
    }
    res.send(result);
});

// DB Update --------------------
router.put("/update", async(req, res) => {
    let result = true;
    try {
        await Calendar.update({ 
            text: req.body.text,
            cate : req.body.cate,
            textTime : req.body.textTime,
            textTitle : req.body.textTitle,
            }, {
            where: {
                id : req.body.id,
                userId : req.body.userId
            }
        });
    } catch(err) {
        console.error("Calendar update err : " + err);
        result = false;
    }
    res.send(result);
});

// DB Delete --------------------
router.delete("/delete", async(req, res) => {
    let result = true;
    try {
        await Calendar.destroy({
            where: {
                id: req.query.id
            }
        });
    } catch(err) {
        result = false;
        console.log("delete Calendar err : " + err);
    }
    res.send(result);
});

// Module Exports --------------------
module.exports = router;