var configs = {
    database : "slack",
    user : "cedar",
    password : "tlejroqkfwk",
    host : "192.168.0.40",
    dialect : "mysql",
    b_token : "xoxb-891877255443-926835312512-0DPrg5HQzjs8YR6bgqWzmf4X",    // app 토큰
    p_token : "xoxp-891877255443-891877703267-1007165528342-ad3527f8fe466c5ab2cc83e24f123c33",
    bearer_p_token : "Bearer xoxp-891877255443-891877703267-1007165528342-ad3527f8fe466c5ab2cc83e24f123c33",
    c_id : "891877255443.906922103267",             // app client 아이디
    c_s_id : "75d6c672024db024e2f4c481ba3a56e2",    // app secret 아이디
    channel_time : "CSZTZ7TCL",     // 출퇴근
    channel_calendar : "CS7RWKTT5", // 일정용
    secretKey : "akdom",
    // 정규식 컨피그
    timeAttenden : /^([0-9]{1,})?시?\s*([0-9]{1,})?분?\s*\W*?\s*(출근|ㅊㄱ|퇴근|ㅌㄱ|외근|ㅇㄱ|야근|예비군|민방위|개인\s*사유|입원|병원|복귀)/,
    subTime : /시$|분$/,
    calendarReg : /\[\s*(\S*)\s*\]\s*(\d*년)?\s*(\d*월)?\s*((\d*일?[\,*\s+\~*]?)*)*\s*(\W*)/,
    subCalReg : /\s{1,}|\,|일/,

    Am0 : "08:30",
    Am1 : "11:00",
    Pm0 : "16:50",

    // API 호출 도메인
    domain : "http://dev.cedar.kr:3333",
    redirectDomain : "http://dev.cedar.kr:2222",
    port : 3333

}

module.exports = configs;