//  ------------------------------------- First Setting -------------------------------------
const express = require("express");
const router = express.Router();
const models = require("../models");

// DB Setting --------------------
const Holiday = models.holiday;
 
// ------------------------------------- DB CRUD -------------------------------------
// DB SelectAll --------------------
router.get("/all", async(req, res) => {
    try {
        const result = await Holiday.findAll();
        res.send(result);
    } catch(err) {
        console.log("select holiday all err : " + err)
    }
});

// DB SelectOne --------------------
router.get("/one", async(req, res) => {
    try {
        const result = await Holiday.findOne({
            where : {
                time : req.query.time
            }
        });
        res.send(result);
    } catch(err) {
        console.log("select holiday one err : " + err);
    }
});

// DB FineOrCreate --------------------
router.post("/create", async(req, res) => {
    let result = false;
    try{
        await Holiday.findOrCreate({
            where : {
                time : req.body.time
            },
            defaults : {
                holiday_userid: req.body.userid, 
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
        console.error("created holiday err : " + err);
    }
    res.send(result);
});

// DB Update --------------------
router.put("/update", async(req, res) => {
    let result = null;
    try {
        await Holiday.update({ 
            holiday_userid: req.body.userid,
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
        console.error("Holiday update err : " + err);
        result = false;
    }
    console.log("update : " + result);
    res.send(result);
});

// DB Delete --------------------
router.delete("/delete", async(req, res) => {
    try {
        let result = await Holiday.destroy({
            where: {
                time: req.query.time
            }
        });
        res.send(result);
    } catch(err) {
        console.log("delete holiday err : " + err);
    }
});

// Module Exports --------------------
module.exports = router;