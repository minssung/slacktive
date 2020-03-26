var client_c = {
    dataTimeReg : /(\d{4}-\d{2}-)/,     // ex ) 2020-02-
    dataCateReg : /휴가|병가|예비군|입원|동원|훈련|민방위|대휴|기타/,   // 여기에 해당하는 내용은 isAll => true
    dataCateTimeReg : /(오전)+\s*(반차)+/,
    dataCateTimeRegPm : /(오후)+\s*(반차)+/,
    channel_calendar : "CS7RWKTT5", // 휴가관련 채널
    channel_times : "CSZTZ7TCL",    // 근태관련 채널
    colors : [
        'greenyellow',
        'turquoise',
        'gold',
        'thistle',
        'violet'
    ],

    // API 호출 도메인
    domain : "http://localhost:5000",
}
module.exports = client_c;