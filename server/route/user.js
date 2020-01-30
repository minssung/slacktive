//  ------------------------------------- First Setting -------------------------------------
const express = require("express");
const router = express.Router();
const models = require("../models");
const _ = require("lodash");
const axios = require("axios");
let configs = require('../server_config');

// DB Setting --------------------
const User = models.user;
 
// ------------------------------------- DB CRUD -------------------------------------
// DB SelectAll --------------------
router.get("/all", async(req, res) => {
    let result = await User.findAll({
    });
    res.send(result);
});

// DB SelectOne --------------------
router.get("/:userid", async(req, res) => {
    try {
        let result = await User.findOne({
            where : {
                userid : req.params.userid
            }
        });
        res.send(result);
    } catch(err) {
        console.log(err);
    }
});

// DB FineOrCreate --------------------
router.post("/create", async(req, res) => {
    let result = false;
    try{
        await User.findOrCreate({
            where : {
                userid : req.body.userid,
            },
            defaults : {
                id : req.body.id,
                userid: req.body.userid, 
                username: req.body.username, 
                // useremail : req.body.useremail,
                // userphone : req.body.userphone,
                state : "출근"
                //result_user.createGroup({groupName: req.body.groupName});
            }
        }).spread((none, created)=>{
            if(created){
                result = true;
            }
        });
    }catch(err) {
        console.error(err);
    }
    res.send(result);
});

// DB Update --------------------
router.put("/update", async(req, res) => {
    let result = null;
    try {
        await User.update({ 
            username: req.body.username,
            useremail: req.body.useremail, 
            userphone : req.body.userphone,
            p_token : req.body.p_token,
            b_p_token : req.body.b_p_token,
            state : req.body.state 
            }, {
            where: {
                userid : req.body.u_id
            }
          }).then((res) => {
              result = true;
          });
    } catch(err) {
        console.error(err);
        result = false;
    }
    console.log("update : "+result);
    res.send(result);
});

// DB Delete --------------------
router.delete("/:id", async(req, res) => {
    try {
        let result = await User.destroy({
            where: {
                id: req.params.id
            }
        });
        res.send(result);
    } catch(err) {
        console.log(err);
    }
});

// Module Exports --------------------
module.exports = router;