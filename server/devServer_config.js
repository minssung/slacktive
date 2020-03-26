var configs = {
    database : "cedar_slack",
    user : "root",
    password : "multi1004",
    host : "localhost",
    dialect : "mysql",
    b_token : "xoxb-891877255443-1018466406144-pbpZVkpx03ljLcuqlUmNNuxr",    // app 토큰
    p_token : "xoxp-891877255443-903345006064-1005921916626-b3393cbb182884ba20ace9fe856905f4",
    bearer_p_token : "Bearer xoxp-891877255443-903345006064-1005921916626-b3393cbb182884ba20ace9fe856905f4",
    c_id : "891877255443.1020233666183",             // app client 아이디
    c_s_id : "41b20749c5abaddff0218a565ed76a00",    // app secret 아이디
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
    domain : 'http://localhost:5000',
    redirectDomain : "http://localhost:3000",
    port : 5000
    
}

module.exports = configs;