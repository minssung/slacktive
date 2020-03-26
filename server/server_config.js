var configs = {
    database : "cedar_slack",
    user : "root",
    password : "multi1004",
    host : "docker.for.mac.host.internal",
    dialect : "mysql",

    b_token : "xoxb-891877255443-1018466406144-iMi61HmA2ZxNNN4czIlQN1km",    // app 토큰
    p_token : "xoxp-891877255443-903345006064-1029115807702-f33baeed08cc3f5e2101610f5e6534f7",
    bearer_p_token : "Bearer xoxp-891877255443-903345006064-1029115807702-f33baeed08cc3f5e2101610f5e6534f7",

    c_id : "891877255443.1020233666183",             // app client 아이디
    c_s_id : "41b20749c5abaddff0218a565ed76a00",    // app secret 아이디
    
    channel_time : "CSZTZ7TCL",     // 출퇴근
    channel_calendar : "CS7RWKTT5", // 일정용

    secretKey : "akdom",

    // 정규식 컨피그
    timeAttenden : /^([0-9]{1,})?시?\s*([0-9]{1,})?분?\s*\W*?\s*(출근|ㅊㄱ|퇴근|ㅌㄱ|외근|ㅇㄱ|야근|예비군|민방위|개인\s*사유|입원|병원|복귀)/,

    calendarReg : /\[\s*(\S*)\s*\]\s*(\d*년)?\s*(\d*월)?\s*((\s*\d*년?\s*\d*월?\s*\d*일?[\,*\s+\~*]?)*)*\s*(.*)/,
    subCalReg : /\s{1,}|\,|일/,

    Am0 : "08:30",
    Am1 : "11:00",
    Pm0 : "16:50",
}

module.exports = configs;