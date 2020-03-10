//  ------------------------------------- First Setting -------------------------------------
const express = require("express");
const router = express.Router();
const models = require("../models");

// DB Setting --------------------
const General = models.general;
const Op = models.Sequelize.Op;
 
// ------------------------------------- DB CRUD -------------------------------------
// DB SelectAll --------------------
router.get("/all", async(req, res) => {
    try {
        const result = await General.findAll({
            include : [{
                model : models.user,
                attributes : ['username','usercolor']
            }],
            order : [[
                'id' , 'ASC'
            ]]
        });
        res.send(result);
    } catch(err) {
        console.log("select General all err : " + err)
    }
});

// DB SelectAll users Generals  --------------------
router.get("/allTime", async(req, res) => {
    try {
        const result = await General.findAll({
            include : [{
                model : models.user,
                attributes : ['username']
            }],
            order : [[
                'id' , 'ASC'
            ]],
            where : {
                textTime : {
                    [Op.like] : "%" + req.query.textTime + "%"
                }
            }
        });
        res.send(result);
    } catch(err) {
        console.log("select General all err : " + err)
    }
});

// DB SelectAll One User Generals --------------------
router.get("/getTime", async(req, res) => {
    try {
        const result = await General.findAll({
            include : [{
                model : models.user,
                attributes : ['username']
            }],
            order : [[
                'id' , 'ASC'
            ]],
            where : {
                textTime : {
                    [Op.like] : "%" + req.query.textTime + "%",
                },
                userId : {
                    [Op.like] : "%" + req.query.userId + "%",
                },
            }
        });
        res.send(result);
    } catch(err) {
        console.log("select General all err : " + err)
    }
});

// DB SelectOne --------------------
router.get("/one", async(req, res) => {
    try {
        const result = await General.findOne({
            where : {
                id : req.query.id
            }
        });
        res.send(result);
    } catch(err) {
        console.log("select General one err : " + err);
    }
});

// DB SelectOne Id --------------------
router.get("/oneRow", async(req, res) => {
    try {
        let result = await General.findOne({
            limit : 1,
            order : [
                [ 'id','DESC']
            ]
        });
        res.send(result);
    } catch (err){
        console.log("select General one err : " + err);
    }
});

// DB FineOrCreate --------------------
router.post("/create", async(req, res) => {
    let result = null;
    try{
        await General.findOrCreate({
            where : {
                textTime : req.body.textTime,
                userId : req.body.userId,
                title : req.body.title,
            },
            defaults : {
                title: req.body.title,
                content: req.body.content,
                tag : req.body.tag,
                partner : req.body.partner,
                state : req.body.state,
                textTime : req.body.textTime,
                location : req.body.location,
                userId : req.body.userId,
            }
        });
        result = await General.findOne({
            limit : 1,
            order : [
                [ 'id','DESC']
            ]
        });
    }catch(err) {
        console.error("created General err : " + err);
    }
    res.send(result);
});

// DB Update --------------------
router.put("/update", async(req, res) => {
    let result = true;
    try {
        await General.update({ 
            title: req.body.title,
            content : req.body.content,
            textTime : req.body.textTime,
            partner : req.body.partner,
            tag : req.body.tag,
            state : req.body.state,
            location : req.body.location,
            }, {
            where: {
                id : req.body.id,
            }
        });
    } catch(err) {
        console.error("General update err : " + err);
        result = false;
    }
    res.send(result);
});

// DB Delete --------------------
router.delete("/delete", async(req, res) => {
    let result = true;
    try {
        await General.destroy({
            where: {
                id: req.query.id
            }
        });
    } catch(err) {
        result = false;
        console.log("delete General err : " + err);
    }
    res.send(result);
});

// Module Exports --------------------
module.exports = router;