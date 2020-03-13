var configs = {
    database : "cedar_slack",
    user : "root",
    password : "multi1004",
    host : "172.17.0.1",
    dialect : "mysql",
    b_token : "xoxb-891877255443-920415436790-HejG1RR0VWl7zeKF2UK1q5zv",    // app 토큰
    p_token : "xoxp-891877255443-903345006064-918149810816-13c225d442b28a4616610dc158bdb43f",
    bearer_p_token : "Bearer xoxp-891877255443-903345006064-918149810816-13c225d442b28a4616610dc158bdb43f",
    c_id : "891877255443.917690987700",             // app client 아이디
    c_s_id : "a3d91f285b22bfbb47c29f13fdd12c5c",    // app secret 아이디
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
}

module.exports = configs;