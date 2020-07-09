//  ------------------------------------- First Setting -------------------------------------
const express = require("express");
const router = express.Router();
const models = require("../models");

// DB Setting --------------------
const General = models.general;
const Op = models.Sequelize.Op;
const stateQuery = "select max(id), state from generals group by state";
 
// ------------------------------------- DB CRUD -------------------------------------
// DB SelectAll --------------------
router.get("/all", async(req, res) => {
    try {
        const result = await General.findAll({
            include : [{
                model : models.user,
            }],
            order : [[
                'id' , 'ASC'
            ]]
        });
        res.send(result);
    } catch(err) {
        console.log("select General all err : " + err);
        res.end();
    }
});

// DB SelectAll users Generals  --------------------
router.get("/alltime", async(req, res) => {
    try {
        const result = await General.findAll({
            include : [{
                model : models.user,
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
        console.log("select General all err : " + err);
        res.end();
    }
});

// DB SelectAll One User Generals --------------------
router.get("/gettime", async(req, res) => {
    try {
        const result = await General.findAll({
            include : [{
                model : models.user,
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
        console.log("select General all err : " + err);
        res.end();
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
        res.end();
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

// DB Select State --------------------
router.get("/state", async(req, res) => {
    try {
        let result = await models.sequelize.query(stateQuery, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        res.send(result);
    } catch (err){
        console.log("select chat one err : " + err);
        res.end();
    }
});

// DB FineOrCreate --------------------
router.post("/create", async(req, res) => {
    let result = null;
    try{
        await General.create({
            title: req.body.title,
            location : req.body.location,
            content: req.body.content,
            tag : req.body.tag,
            partner : req.body.partner,
            startDate : req.body.startDate,
            endDate : req.body.endDate,
            userId : req.body.userId,
        });
        result = true;
    }catch(err) {
        console.error("created General err : " + err);
        result = false;
    }
    res.send(result);
});

// DB Update --------------------
router.put("/update", async(req, res) => {
    let result = null;
    try {
        result = await General.update({ 
            title: req.body.title,
            location : req.body.location,
            content: req.body.content,
            tag : req.body.tag,
            partner : req.body.partner,
            startDate : req.body.startDate,
            endDate : req.body.endDate,
            userId : req.body.userId,
            }, {
            where: {
                id : req.body.id,
            }
        });
    } catch(err) {
        console.error("General update err : " + err);
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
        console.log("delete General err : " + err);
        result = false;
    }
    res.send(result);
});

// Module Exports --------------------
module.exports = router;