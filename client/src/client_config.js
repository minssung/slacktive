var client_c = {
    dataTitleReg : /(\W{2})\s*(\W*)/,
    dataTimeReg : /(\d{4}-\d{2}-)/,
    dataCateReg : /휴가|병가|예비군|입원|동원|훈련|민방위|기타/,
    dataCateTimeReg : /(오전)+\s*(반차)+/,
    channel_calendar : "CS7RWKTT5",
    channel_times : "CSZTZ7TCL",
    colorArray : ['#FFB1B1','#FFE0B1','#FFF8B1','#E6FFB1','#B1FFB1','#B1FFDE','#B1FEFF','#B1D8FF','#B1BAFF','#D1B1FF','#FFB1F8'],
}
module.exports = client_c;