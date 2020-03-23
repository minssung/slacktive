var configs = {
    database : "slack",
    user : "cedar",
    password : "tlejroqkfwk",
    host : "192.168.0.40",
    dialect : "mysql",
    b_token : "xoxb-891877255443-920415436790-lO14rUeNfh2Gwf5aulBZfxa4",    // app 토큰
    p_token : "xoxp-891877255443-903345006064-985515730113-0cdcc4b499041bb5259ddc9dd37f71c1",
    bearer_p_token : "Bearer xoxp-891877255443-903345006064-985515730113-0cdcc4b499041bb5259ddc9dd37f71c1",
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

    // API 호출 도메인
    domain : "http://192.168.0.40:3333",
    redirectDomain : "http://dev.cedar.kr:2222",
    port : 3333

}

module.exports = configs;
