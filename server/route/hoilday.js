//  ------------------------------------- First Setting -------------------------------------
const express = require("express");
const router = express.Router();
const models = require("../models");
const _ = require("lodash");

// DB Setting --------------------
const Hoilday = models.Hoilday;
 
// ------------------------------------- DB CRUD -------------------------------------
// DB SelectAll --------------------
router.get("/all", async(req, res) => {
    try {
        const result = await Hoilday.findAll();
        res.send(result);
    } catch(err) {
        console.log("select hoilday all err : " + err)
    }
});

// DB SelectOne --------------------
router.get("/one", async(req, res) => {
    try {
        const result = await Hoilday.findOne({
            where : {
                time : req.query.time
            }
        });
        res.send(result);
    } catch(err) {
        console.log("select hoilday one err : " + err);
    }
});

// DB FineOrCreate --------------------
router.post("/create", async(req, res) => {
    let result = false;
    try{
        await Hoilday.findOrCreate({
            where : {
                time : req.body.time
            },
            defaults : {
                userid: req.body.userid, 
                text: req.body.text,
                time : req.body.time,
                state : req.body.state,
            }
        }).spread((none, created)=>{
            if(created){
                result = true;
            }
        });
    }catch(err) {
        console.error("created hoilday err : " + err);
    }
    res.send(result);
});

// DB Update --------------------
router.put("/update", async(req, res) => {
    let result = null;
    try {
        await Hoilday.update({ 
            userid: req.body.userid,
            text: req.body.text,
            time: req.body.time,
            state : req.body.state 
            }, {
            where: {
                time : req.body.time
            }
        });
        result = true;
    } catch(err) {
        console.error("hoilday update err : " + err);
        result = false;
    }
    console.log("update : " + result);
    res.send(result);
});

// DB Delete --------------------
router.delete("/delete", async(req, res) => {
    try {
        let result = await Hoilday.destroy({
            where: {
                time: req.query.time
            }
        });
        res.send(result);
    } catch(err) {
        console.log("delete hoilday err : " + err);
    }
});

// Module Exports --------------------
module.exports = router;