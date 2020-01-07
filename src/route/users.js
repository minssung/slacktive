const express = require('express');
const _ = require('lodash');
const router = express.Router();

let users = [{
    id: 1,
    name: '홍길동'
},{
    id: 2,
    name: "강철수"
}];

router.get("/", (req, res) => {
    let msg = "유저가 존재하지 않습니다.";
    if (users.length > 0) {
        msg = users.length + "명의 유저가 존재합니다.";
    }
    res.send({msg, result: users})
});
 
router.get("/:id", (req, res) => {
    let msg = "유저가 존재하지 않습니다.";
    let user = _.find(users, ["id", parseInt(req.params.id)]);
    if (user) {
        msg = "id가 " + req.params.id + "인 유저를 발견했습니다.";
    }
    res.send({msg, result: user});
    
});
 
router.post("/", (req, res) => {
    const check_user = _.find(users, ["id", req.body.id]);
    let msg = req.body.id + " 를 가진 유저가 이미 존재합니다.";
    let success = false;
    if (!check_user) {
        users.push(req.body);
        msg = req.body.name + "유저가 추가되었습니다.";
        success = true;
    }
    res.send({msg, success});

});
 
router.put("/:id", (req, res) => {
    let check_user = _.find(users, ["id", parseInt(req.params.id)]);     // 파라미터 숫자 값을 가져올 때는 parseInt 해줘야 함!
    let check = _.find(users, "name");
    let msg = req.params.id + " 유저가 존재하지 않습니다.";

    if (check_user) {
        msg = req.params.id + " 수정이 완료되었습니다.";
        check.name = req.body.name;
    }
    res.send({msg, result: check_user});
    
});
 
router.delete("/:id", (req, res) => {
    let check_user = _.find(users, ["id", parseInt(req.params.id)]);     // 파라미터 숫자 값을 가져올 때는 parseInt 해줘야 함!
    let msg = req.params.id + " 유저가 존재하지 않습니다.";

    if (check_user) {
        msg = req.params.id + " 삭제가 완료되었습니다.";
        users = _.reject(users, ["id", parseInt(req.params.id)]);
    }
    res.send({msg, result: check_user});

});

module.exports = router;