//  ------------------------------------- First Setting -------------------------------------
const express = require("express");
const router = express.Router();
const models = require("../models");
const _ = require("lodash");

// DB Setting --------------------
const User = models.user;

// DB Insert --------------------
router.get("/init", async(req, res) => {
    const users = [{
        userid : 'ABCDEF',
        username : "HongGilDong",
        useremail : "aaa@a.com",
        userphone : "000-0000-0000",
        totalcount : 0,
        state : "출근"
    }];

    await User.sync ({ forcce : true });

    for (const user of users) {
        await User.create ({ 
            "userid" : user.userid, 
            "username" : user.username,
            "useremail" : user.useremail,
            "userphone" : user.userphone,
            "totalcount" : user.totalcount,
            "state" : user.state });
    }
    res.send(true);
});
 
// ------------------------------------- DB CRUD -------------------------------------
// DB SelectAll --------------------
router.get("/", async(req, res) => {
    let result = await User.findAll({
    });
    res.send(result);
});

// DB SelectOne --------------------
router.get("/:id", async(req, res) => {
    let result = await User.findOne({
        where: {
            id: req.params.id
        }
    });
    res.send(result);
});

/*
// DB Create --------------------
router.post("/", async(req, res) => {
    let result = false;
    try{
        await User.create({
            userid: req.body.userid, 
            username: req.body.username, 
            useremail : req.body.useremail,
            userphone : req.body.userphone,
            totalcount : 0,
            state : "출근"});
        //await result_user.createGroup({groupName: req.body.groupName});
        result = true;
    }catch(err) {
        console.error(err);
    }
    res.send(result);
});
*/

// DB FineOrCreate --------------------
router.post("/create", async(req, res) => {
    let result = false;
    try{
        await User.findOrCreate({
            where : {
                userid : req.body.userid,
                username : req.body.username
            },
            defaults : {
                id : req.body.id,
                userid: req.body.userid, 
                username: req.body.username, 
                useremail : req.body.useremail,
                userphone : req.body.userphone,
                totalcount : 0,
                state : "출근"
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
router.put("/:id", async(req, res) => {
    let result = null;
    try {
        await User.update({ 
            username: req.body.username,
            useremail: req.body.useremail, 
            userphone : req.body.userphone,
            totalcount : req.body.totalcount,
            state : req.body.state }, {
            where: {
              id : req.params.id
            }
          }).then((res) => {
              return result;
          });
    } catch(err) {
        console.error(err);
    }
    res.send(result);
});

// DB Delete --------------------
router.delete("/:id", async(req, res) => {
    let result = await User.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        console.log("Done");
      });
    res.send(result);
});

// Module Exports --------------------
module.exports = router;