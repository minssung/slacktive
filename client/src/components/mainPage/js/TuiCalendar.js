import React from "react";
import axios from 'axios';
import moment from "moment";
import 'moment/locale/ko'       // 한글로 불러오기
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';    // 캘린더 css 적용
//import configs from '../../../client_config'; // config 파일
import '../css/popupCrt.css'    // 팝업 생성
import '../css/popupConfirm.css'    // 팝업 확인
import arrow from '../css/arrow.png';   // 카테고리의 화살표
import loadMask from '../../../resource/loadmaskTest.gif'   // loadmask
import Timekeeper from 'react-timekeeper';
import 'react-daypicker/lib/DayPicker.css';
import DayPicker from 'react-daypicker';
import charImg from '../css/char.png';

moment.locale('en');    // ko -> 한글 버전. => moment.js에서 한글로 변환하는게 잘 안되고 오류가 있음 ( invalid err )

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../../devClient_config') : configs = require('../../../client_config');

class TestCal extends React.Component {
    constructor(props) {
        super(props);
        this.calendarRef = React.createRef();   // 캘린더 인스턴스용 Ref
        //  userinfo popup refs
        this.state = {
            scheduleArray : [], // 캘린터 아이템에 넣기 전 푸시용
            generalsArray : [], // 일정 아이템에 넣기 전 푸시용
            scheduleItem : null,    // 캘린더에 표시되는 아이템들
            usertoken : "", // 유저 토큰 값
            user : [],  // 유저 데이터 정보 디비
            // popup create state
            startDate : "", // 시작 날짜
            endDate : "",   // 끝 날짜
            startTime : "", // 상세 시간 시작
            endTime : "",   // 상세 시간 끝
            saveData : {},  // 등록 및 수정으로 저장 시
            popupInv : "none",  // 팝업 창 제어용
            title : "", // 제목
            partnerInput : "",  // 파트너 검색 인풋
            partnerDrop : "none",   // 파트너 리스트 창 제어용
            partnerData : [],   // db에서 가져와 담을 값
            partnerSelt : [],   // 선택한 파트너 값
            memoArea : "",  // 메모
            cateClick : false,  // 카테고리 리스트 창 제어용
            showTimeStart : false,
            showTimeEnd : false,
            showDateStart : false,
            showDateEnd : false,
            // 드롭다운의 리스트들
            cateTag : [
                {name : "출장 / 미팅", color : configs.colors[0], num : 0},
                {name : "회의", color : configs.colors[1], num : 1},
                {name : "휴가관련", color : configs.colors[2], num : 2},
                {name : "생일", color : configs.colors[3], num : 3},
                {name : "기타", color : configs.colors[4], num : 4},
            ],
            // 드롭다운의 현재 보여질 리스트 항목
            currentTag : { name : "출장 / 미팅", color : configs.colors[0], num : 0 },
            // popup schedule state
            in_data : {},   // 데이터를 넘겨주거나 보여줄 때
            popupInvSchedule : "none",
            userGet : true, // 해당 유저의 데이터인지 확인용
            // popup update state
            updateTF : false,   // 수정 버튼을 누를 경우
            updateID : "",  // 업뎃 시 아이디
            updateCID : "", // 업뎃 시 캘린더 아이디
            // load mask
            loading : ""
        }
    }
    // 초기 마운트
    async componentDidMount() {
        // token verify
        await this.setState({
            usertoken : await this.props.Token
        })
        const { usertoken } = this.state;
        // user Db setting
        await this.setState({
            user : await axios.get(`${configs.domain}/user/one?userid=${usertoken}`)
        })
        // calendar init moubt
        await this.scheduleInitMount()
        const { scheduleArray,generalsArray } = this.state;
        // calendar create mount
        this.scheduleCreateMount(scheduleArray,generalsArray);
    }
    // 캘린더 스케줄 초기 마운트 시 생성 설정 -> 불러오기
    async scheduleInitMount() {
        // calendar db select all -> init
        let schedulesDB = axios.get(configs.domain+"/calendar/all");
        let generalsDB = axios.get(configs.domain+"/generals/all");
        await Promise.all([schedulesDB,generalsDB]).then((val)=>{
            schedulesDB = val[0].data;
            generalsDB = val[1].data;
        })
        this.setState({
            scheduleArray : schedulesDB,
            generalsArray : generalsDB
        })
    }
    // 캘린더 스케줄 마운트 및 정규식 표현 처리 -> 보여주기
    async scheduleCreateMount(datasS,datasG) {
        let scheduleItem = [];
        let startDate = "";
        let endDate = "";
        let regDays = [];
        let color = "";
        try {
            datasS.forEach(data => {
                color = configs.colors[2];                                                
                regDays = configs.dataTimeReg.exec(data.textTime)   // 디비의 타임 텍스트를 가져와서 정규식 거침
                let days = [];  // 일 수를 복수로 담을 배열
                let scheduleObj = {};   // 스케줄 아이템을 담을 변수
                let isAll = configs.dataCateReg.test(data.cate) ? true : false
                let timeAm = isAll ? " 00:00" : " 09:00"
                let timePm = isAll ? " 23:59" : " 19:00"
                timeAm = configs.dataCateTimeRegPm.test(data.cate) ? " 14:00" : timeAm
                timePm = configs.dataCateTimeReg.test(data.cate) ? " 14:00" : timePm
                // regDays : 2020-02-02-
                // 물결을 사용한 다수 일정 등록 시
                if(/~/.test(data.textTime)) {
                    days = data.textTime.split(/~/)
                    startDate = moment(days[0] + timeAm).format()
                    endDate = moment(days[1] + timePm).format()
                    scheduleObj = {
                        id: data.id,
                        calendarId: '0',
                        title: data.user.username + " " + data.cate,
                        category: 'time',
                        isAllDay: isAll,
                        start : startDate,
                        end : endDate,
                        bgColor : color,
                    };
                    scheduleItem.push(scheduleObj)
                // 컴마를 사용한 다수 일정 등록 시
                } else if(/,/.test(data.textTime)) {
                    days = data.textTime.split(/,/)
                    for (let index = 0; index < days.length; index++) {
                        if(days[index].length < 3)
                            days[index] = regDays[0] + days[index]
                    }
                    // days -> 각각 배열로 출력
                    let num = 0;
                    let count = -1;
                    for (let index = 0; index < days.length; index++) {
                        if(days[index+1] && moment(days[index+1]).diff(days[index], 'days') === 1) {
                            if(count === -1)
                            count = index;
                            continue;
                        } else {
                            if(count === -1) {
                                startDate = moment(days[index] + timeAm).format()
                                endDate = moment(days[index] + timePm).format()
                            } else {
                                startDate = moment(days[count] + timeAm).format()
                                endDate = moment(days[index] + timePm).format()
                                count = -1
                            }
                            scheduleObj = {
                                id: data.id,
                                calendarId: "" + num++,
                                title: data.user.username + " " + data.cate,
                                category: 'time',
                                isAllDay: isAll,
                                start : startDate,
                                end : endDate,
                                bgColor : color,
                            };
                            scheduleItem.push(scheduleObj)
                        }
                    }
                // 단일 일정 등록 시
                } else {
                    startDate = moment(data.textTime + timeAm).format()
                    endDate = moment(data.textTime + timePm).format()
                    scheduleObj = {
                        id: data.id,
                        calendarId: '0',
                        title: data.user.username + " " + data.cate,
                        category: 'time',
                        isAllDay: isAll,
                        start : startDate,
                        end : endDate,
                        bgColor : color,
                    };
                    scheduleItem.push(scheduleObj)
                }
            })
            // 일정용 스케줄
            datasG.forEach(data=>{
                switch(data.tag) {
                    case "휴가관련" : color = configs.colors[2]; break;
                    case "출장 / 미팅" : color = configs.colors[0]; break;
                    case "회의" : color = configs.colors[1]; break;
                    case "생일" : color = configs.colors[3]; break;
                    case "기타" : color = configs.colors[4]; break;
                    default : break;
                }
                let textTimes = data.textTime.split("~");
                let scheduleObj = {};
                scheduleObj = {
                    id: data.id,
                    calendarId: '99',
                    title: data.title,
                    category: "time",
                    isAllDay: false,
                    start : textTimes[0]+"",
                    end : textTimes[1]+"",
                    bgColor : color,
                };
                scheduleItem.push(scheduleObj)
            })
        } catch(err) {
            console.log("TUI Mount init err : " + err)
        }
        await this.dashDataProps();
        this.setState({
            scheduleItem,
            loading : "load",
        })
    }
    // 대시보드에 프롭스 넘겨주기
    async dashDataProps() {
        const result = await axios.get(configs.domain+"/updatState");
        this.props.changeDashDb(result.data)
    }
    // ------------------------------ Instance method ------------------------------ //
    // 이전 / 다음 / 오늘 달로 이동하는 버튼
    handleClickPrevNextButton = async(data) => {
        const calendar = this.calendarRef.current.getInstance();
        if(data === "pre")
            calendar.prev();
        else 
            calendar.next();
    };
    // ------------------------------ Event ------------------------------ //
    // 캘린더 영역을 클릭 시에 이벤트 호출
    beforeCreateSchedule = (e) => {
        this.setState({
            startDate : moment(e.start._date).format("YYYY-MM-DD HH:mm"),
            startTime : moment(e.start._date).format("LT"),
            endDate : moment(e.end._date).format("YYYY-MM-DD HH:mm"),
            endTime : moment(e.end._date).format("LT"),
            title : "",
            currentTag : { name : "출장 / 미팅", color : configs.colors[0], num : 0 },
            partnerInput : "",
            memoArea : "",
            partnerData : [],
            partnerSelt : [],
            partnerDrop : "none",
            in_data : {},
         });
        this.setState({
            popupInv : this.state.popupInv === "none" ? "flex" : "none",
            popupInvSchedule : "none",
        });
    }
    // 새로운 일정 생성 시 동작
    // 생성 시 슬랙에도 메시지 출력
    // 캘린더 상에서 일정 등록 시 필요 양식 => 예) oo 휴가/반차
    createScheduleItems = async(data) => {
        const calendar = this.calendarRef.current.getInstance();
        const { user,currentTag } = this.state;
        this.setState({
            loading : "",
        })
        // 휴가 관련 = 2
        if(currentTag.num === 2) {
            let timeText = "";
            // 날짜 차이가 1인 경우
            if(moment(data.endDate).diff(data.startDate, "days") >= 1) {
                timeText = "["+user.data.username+"] "+ moment(data.startDate).format("YYYY[년] MM[월] DD[일]") + "~" + moment(data.endDate).format("YYYY[년] MM[월] DD[일]") + " " + data.title
            // 날짜 차이가 없는 경우 = 종료일과 같음
            } else {
                timeText = "["+user.data.username+"] "+ moment(data.startDate).format("YYYY[년] MM[월] DD[일] ") + data.title
            }
            // 슬랙에 메시지 전송
            try {
                await axios.post(configs.domain+"/slackapi/messagePost",{
                    channel : configs.channel_calendar,
                    p_token : user.data.p_token,
                    text : timeText
                })
                // 채널 내역 갱신
                await axios.post(configs.domain+"/slackapi/channelHistoryCal")
                // 새로 마운트
                // calendar init mount
                await this.scheduleInitMount()
                // 새로 재생성
                // calendar create mount
                this.scheduleCreateMount(this.state.scheduleArray,this.state.generalsArray);
            } catch(err) {
                console.log("before create scd err : " + err);
            }
        // 휴가관련 외의 경우 -> 일정용 디비에 저장
        } else {
            try {
                let partners = "";
                data.partner.forEach((data,i)=>{
                    if(i === 0) {
                        partners = "" + data.username;
                    } else {
                        partners = partners + "," + data.username;
                    }
                });
                const PartnersData = data.partner.map((data)=>{
                    return {
                        id : data.id,
                        username : data.username,
                    }
                })
                // 슬랙에 메시지 전송
                const post = axios.post(configs.domain+"/slackapi/messagePost",{
                    channel : user.data.userchannel,
                    p_token : user.data.p_token,
                    text : `제목 : [${data.title}] / 메모사항 : [${data.content}] / ${data.startDate}~${data.endDate} / 참여자 : [${partners}]`
                })
                // 일정 디비에 생성
                const result = await axios.post(configs.domain+"/generals/create",{
                    title : data.title,
                    content : data.content,
                    partner : PartnersData,
                    textTime : `${data.startDate}~${data.endDate}`,
                    tag : data.state,
                    userId : user.data.id,
                });
                let bgColor = "";
                switch(currentTag.num) {
                    case 2 : bgColor = configs.colors[2]; break;
                    case 0 : bgColor = configs.colors[0]; break;
                    case 1 : bgColor = configs.colors[1]; break;
                    case 3 : bgColor = configs.colors[3]; break;
                    case 4 : bgColor = configs.colors[4]; break;
                    default : break;
                }
                // 스케줄 아이템 생성
                calendar.createSchedules([{
                    id : result.data.id,
                    calendarId: '99',   // 일정용임을 구분짓는 수 99
                    title: data.title,
                    category: "time",
                    start : data.startDate,
                    end : data.endDate,
                    bgColor
                }]);
                await post;
            } catch(err) {
                console.log("before create gnr err : " + err);
            }
            this.setState({
                loading : "load",
            })
        }
        await this.dashDataProps();
    }
    // 일정 수정 시
    // 수정 시 슬랙의 메시지도 수정
    // 수정 시에도 생성 시와 같은 양식 준수 필요
    beforeUpdateSchedule = async(data) => {
        const calendar = this.calendarRef.current.getInstance();
        const { user,updateCID,updateID } = this.state
        let dataText = "";
        let dbTimeText = "";
        let timeText = "";
        // 직접 입력 업데이트인 경우
        if(data.dir) {
            if(data.state === "휴가관련") {
                if(moment(data.endDate).diff(data.startDate, "days") >= 1){
                    timeText = `[${user.data.username}] ${moment(data.startDate).format("YYYY[년] MM[월] DD[일]")}~${moment(data.endDate).format("YYYY[년] MM[월] DD[일]")} ${data.title}`
                    dbTimeText = moment(data.startDate).format("YYYY-MM-DD") + "~" + moment(data.endDate).format("YYYY-MM-DD")
                } else {
                    timeText = `[${user.data.username}] ${moment(data.startDate).format("YYYY[년] MM[월] DD[일]")} ${data.title}`
                    dbTimeText = moment(data.startDate).format("YYYY-MM-DD");
                }
                try {
                    let result = await axios.get(`${configs.domain}/calendar/one?id=${updateID}`);
                    const updat = axios.put(configs.domain+"/calendar/update",{
                        id : updateID,
                        userId : user.data.id,
                        text : timeText,
                        cate : data.title,
                        textTime : dbTimeText,
                    });
                    const posting = axios.post(configs.domain+"/slackapi/messageUpdate",{
                        p_token : user.data.p_token,
                        channel : configs.channel_calendar,
                        text : timeText,
                        time : result.data.ts
                    })
                    calendar.updateSchedule(updateID, updateCID, {
                        title : user.data.username + " " + data.title,
                        start : data.startDate,
                        end : data.endDate,
                    });
                    await Promise.all([updat,posting]);
                } catch(err) {
                    console.log("before updat scd err : " + err); 
                }
            } else {
                dbTimeText = data.startDate + "~" + data.endDate;
                try {
                    let result = await axios.get(`${configs.domain}/generals/one?id=${updateID}`);
                    const updat = axios.put(configs.domain+"/generals/update",{
                        id : updateID,
                        title : data.title,
                        textTime : dbTimeText,
                        content : data.content,
                        partner : data.partner,
                        tag : data.state,
                    });
                    const posting = axios.post(configs.domain+"/slackapi/messagePost",{
                        channel : user.data.userchannel,
                        p_token : user.data.p_token,
                        text : `이전에 등록한 일정 -> 제목 : [(수정전)${result.data.title} (수정후)${data.title}] / 날짜 : (수정전)${result.data.textTime} (수정후)${dbTimeText}이 캘린더에서 수정되었습니다.`
                    });
                    calendar.updateSchedule(updateID, updateCID, {
                        title : data.title,
                        start : data.startDate,
                        end : data.endDate,
                    });
                    await Promise.all([updat,posting]);
                } catch(err) {
                    console.log("before updat gnr err : " + err);
                }
            }
        // 드래그를 통한 날짜 업데이트인 경우
        } else {
            // 휴가 관련 업데이트 일 경우
            if(data.schedule.calendarId !== "99") {
                let result = await axios.get(`${configs.domain}/calendar/one?id=${data.schedule.id}`);
                if(result.data.userId === user.data.id) {
                    dataText = (/\S*\s*(.*)/.exec(data.schedule.title))[1];
                    if(moment(data.end._date).diff(data.start._date, "days") >= 1){
                        timeText = `[${user.data.username}] ${moment(data.start._date).format("YYYY[년] MM[월] DD[일]")}~${moment(data.end._date).format("YYYY[년] MM[월] DD[일]")} ${dataText}`
                        dbTimeText = moment(data.start._date).format("YYYY-MM-DD") + "~" + moment(data.end._date).format("YYYY-MM-DD")
                    } else {
                        timeText = `[${user.data.username}] ${moment(data.start._date).format("YYYY[년] MM[월] DD[일]")} ${dataText}`
                        dbTimeText = moment(data.start._date).format("YYYY-MM-DD");
                    }
                    try {
                        const updat = axios.put(configs.domain+"/calendar/update",{
                            id : data.schedule.id,
                            userId : user.data.id,
                            text : timeText,
                            cate : dataText,
                            textTime : dbTimeText,
                        });
                        const posting = axios.post(configs.domain+"/slackapi/messageUpdate",{
                            p_token : user.data.p_token,
                            channel : configs.channel_calendar,
                            text : timeText,
                            time : result.data.ts
                        })
                        calendar.updateSchedule(data.schedule.id, data.schedule.calendarId, {
                            start : data.changes.start && data.changes.start._date,
                            end : data.changes.end && data.changes.end._date,
                        });
                        await Promise.all([updat,posting]);
                    } catch(err){
                        console.log("before scd update err : " + err);
                    }
                }
            // 일정 관련 업데이트 일 경우
            } else {
                let result = await axios.get(`${configs.domain}/generals/one?id=${data.schedule.id}`);
                if(result.data.userId === user.data.id) {
                    dbTimeText = moment(data.start._date).format("YYYY-MM-DD LT") + "~" + moment(data.end._date).format("YYYY-MM-DD LT")
                    try {
                        const updat = axios.put(configs.domain+"/generals/update",{
                            id : data.schedule.id,
                            textTime : dbTimeText,
                        });
                        const posting = axios.post(configs.domain+"/slackapi/messagePost",{
                            channel : user.data.userchannel,
                            p_token : user.data.p_token,
                            text : `이전에 등록한 일정 -> 제목 : [${result.data.title}] / 날짜 : (수정전)${result.data.textTime} (수정후)${dbTimeText}이 캘린더에서 수정되었습니다.`
                        });
                        calendar.updateSchedule(data.schedule.id, data.schedule.calendarId, {
                            start : data.changes.start && data.changes.start._date,
                            end : data.changes.end && data.changes.end._date,
                        });
                        await Promise.all([updat,posting]);
                    } catch(err){
                        console.log("before scd update err : " + err);
                    }
                }
            }
        }
        this.setState({
            popupInv : "none",
            popupInvSchedule : "none",
        })
        await this.dashDataProps();
    }
    // 일정 삭제 시
    // 삭제 시 메시지 또한 삭제 됨
    beforeDeleteSchedule = async(id, c_id) => {
        const calendar = this.calendarRef.current.getInstance();
        const { user } = this.state;
        try {
            let scheduleResult = [];
            // 캘린더 아이디가 99가 아닌 값 -> 휴가용
            if(c_id !== "99") {
                // 조회
                scheduleResult = await axios.get(`${configs.domain}/calendar/one?id=${id}`);
                // 디비에서 삭제
                const delt = axios.delete(`${configs.domain}/calendar/delete?id=${id}`);
                // 캘린더상에서 삭제
                calendar.deleteSchedule(id, c_id);
                // 팝업 창 내리기
                this.setState({ popupInvSchedule : "none", })
                // 슬랙에서 삭제
                axios.post(configs.domain+"/slackapi/messageDelete",{
                    p_token : user.data.p_token,
                    channel : configs.channel_calendar,
                    time : scheduleResult.data.ts,
                })
                await delt;
            // 캘린더 아이디가 99인 값 -> 일정용
            } else {
                // 해당 아이디 조회
                const generalResult = await axios.get(`${configs.domain}/generals/one?id=${id}`);
                // 디비에서 삭제
                const delt = axios.delete(`${configs.domain}/generals/delete?id=${id}`);
                // 캘린더상에서 삭제
                calendar.deleteSchedule(id, c_id);
                // 팝업 창 내리기
                this.setState({ popupInvSchedule : "none", })
                // 삭제 되었다는 메시지 보내기
                axios.post(configs.domain+"/slackapi/messagePost",{
                    channel : user.data.userchannel,
                    p_token : user.data.p_token,
                    text : `이전에 등록한 일정 -> 제목 : [${generalResult.data.title}] / 날짜 : ${generalResult.data.textTime}이 캘린더에서 삭제되었습니다.`
                });
                await delt;
            }
        } catch(err) {
            console.log("before scd delete err : " + err)
        }
        await this.dashDataProps();
    }
    // 카테고리 선택 값
    cateClick(cate, num) {
        const { cateClick } = this.state;
        this.setState({
            cateClick : cateClick ? false : true,
        })
        if(cate){
            this.setState({
                currentTag : {
                    name : cate.name,
                    color : cate.color,
                    num : num,
                }
            })
        }
    }
    // 메모 사항 인풋 값
    memoArea(e) {
        this.setState({ memoArea : e.target.value })
    }
    // 타이틀 인풋 값
    titleInput(e) {
        this.setState({ title : e.target.value, })
    }
    // 시계 모달로 입력받은 값 
    dateTime(e) {
        const { showTimeEnd, showTimeStart} = this.state;
        if(showTimeStart) {
            this.setState({ startTime : e.formattedSimple + " " + e.meridiem.toUpperCase() })
        }
        if(showTimeEnd) {
            this.setState({ endTime : e.formattedSimple + " " + e.meridiem.toUpperCase() })
        }
    }
    // 시계 팝업 제어용
    setShowTime(bool) {
        if(bool === "end") {
            this.setState({ showTimeEnd : true })
        } else if(bool === "start"){
            this.setState({ showTimeStart : true})
        } else {
            this.setState({ showTimeStart : bool, showTimeEnd : bool })
        }
    }
    // 달력 팝업 제어용
    setShowDate(bool) {
        if(bool === "end") {
            this.setState({ showDateEnd : true })
        } else if(bool === "start"){
            this.setState({ showDateStart : true})
        } else {
            this.setState({ showDateStart : bool, showDateEnd : bool })
        }
    }
    // 파트너 인풋 값
    async partnerInput(e) {
        await this.setState({ partnerInput : e.target.value })
        const { partnerInput } = this.state;
        if(partnerInput) {
            try {
                const result = await axios.get(`${configs.domain}/user/search?username=${partnerInput}`);
                if(result.data) {
                    this.setState({ partnerData : result.data });
                }
            } catch(err) {
                console.log("search Partner api err : " + err);
            }
            this.setState({ partnerDrop : "flex" });
        } else {
            this.setState({ partnerDrop : "none" });
        }
    }
    // 파트너 삭제 버튼
    partnerCancel(id) {
        this.setState({ partnerSelt : this.state.partnerSelt.filter(val => val.id !== id) })
    }
    // 해당 파트너 클릭 시
    partnerClick(data) {
        this.setState({ 
            partnerDrop : "none",
            partnerInput : "",
            partnerSelt : this.state.partnerSelt.concat(data)   // state 값에 추가
        });
    }
    // 일정 등록을 위한 팝업 창
    popupCreate() {
        const { 
            startDate,endDate,startTime,endTime,    // 시간 관련
            popupInv,   // 팝업 창 제어
            cateClick,cateTag,currentTag,   // 태그 관련    
            memoArea,title,     // 메모와 타이틀
            partnerInput,partnerDrop,partnerData,partnerSelt,   // 파트너 등록 관련
            updateTF,    // 수정 시
            showTimeStart,showDateStart,
            showTimeEnd,showDateEnd,
        } = this.state;
        return <div className="popup-crt">
            <div className="popup-crt-main" style={{
                display : popupInv
            }}>
                <div className="popup-crt-header">
                    <span className="popup-crt-headerTitle">일정 등록하기</span>
                    <span className="popup-crt-headerCancel" onClick={this.clickCancel.bind(this)}>x</span>
                </div>
                <div className="popup-crt-hAndBLine"></div>
                <div className="popup-crt-body">
                    <span className="popup-crt-bodyText">제목</span>
                    <input type="text" className="popup-crt-bodyTitleInput" placeholder="제목에 들어갈 내용" value={title} onChange={this.titleInput.bind(this)}></input>
                    <div className="popup-crt-bodyTime">
                        <span className="popup-crt-bodyText popup-crt-bodyDateText">시작일</span>
                        <span className="popup-crt-bodyText">시작시간</span>
                    </div>
                    <div className="popup-crt-bodyTimeDate">
                        <span className="popup-crt-bodyTextContent-time" onClick={this.setShowDate.bind(this,"start")}>{moment(startDate).format("YYYY. MM. DD (ddd)")}</span>
                        {
                            showDateStart && 
                            <div className="popup-crt-datePicker">
                                <DayPicker onDayClick={(day) => this.setState({ startDate : day })} />
                                <div className="popup-crt-showDate" onClick={this.setShowDate.bind(this,false)}><span>close</span></div>
                            </div>
                        }
                        <span className="popup-crt-bodyTextContent-time" onClick={this.setShowTime.bind(this,"start")}>{startTime}</span>
                        {
                            showTimeStart &&
                            <div className="popup-crt-timePicker">
                                <Timekeeper
                                    onChange={this.dateTime.bind(this)}
                                    switchToMinuteOnHourSelect
                                    closeOnMinuteSelect={true}
                                    hour24Mode
                                />
                                <div className="popup-crt-showTime" onClick={this.setShowTime.bind(this,false)}><span>close</span></div>
                            </div>
                        }
                    </div>
                    <div className="popup-crt-bodyTime">
                        <span className="popup-crt-bodyText popup-crt-bodyDateText">종료일</span>
                        <span className="popup-crt-bodyText">종료시간</span>
                    </div>
                    <div className="popup-crt-bodyTimeDate">
                        <span className="popup-crt-bodyTextContent-time" onClick={this.setShowDate.bind(this,"end")}>{moment(endDate).format("YYYY. MM. DD (ddd)")}</span>
                        {
                            showDateEnd && 
                            <div className="popup-crt-datePicker">
                                <DayPicker onDayClick={(day) => this.setState({ endDate : day })} />
                                <div className="popup-crt-showDate" onClick={this.setShowDate.bind(this,false)}>close</div>
                            </div>
                        }
                        <span className="popup-crt-bodyTextContent-time" onClick={this.setShowTime.bind(this,"end")}>{endTime}</span>
                        {
                            showTimeEnd &&
                            <div className="popup-crt-timePicker">
                                <Timekeeper
                                    onChange={this.dateTime.bind(this)}
                                    switchToMinuteOnHourSelect
                                    closeOnMinuteSelect={true}
                                    hour24Mode
                                />
                                <div className="popup-crt-showTime" onClick={this.setShowTime.bind(this,false)}>close</div>
                            </div>
                        }
                    </div>
                    <span className="popup-crt-bodyText">카테고리</span>
                    <div className="popup-crt-bodyCateContent">
                        <button className="popup-crt-bodyCateBtns" onClick={this.cateClick.bind(this)}>
                            <div className="popup-crt-bodyCateBtnDiv">
                                <div className="popup-crt-bodyCateBtnDivDetail">
                                    <div className="popup-crt-bodyCateMark" style={{ backgroundColor : currentTag.color }}></div>
                                    <span className="popup-crt-bodyTextContent">{currentTag.name}</span>
                                </div>
                                <img alt="arrow" src={arrow} className="popup-crt-bodyCateArrow"></img>
                            </div>
                        </button>
                        <div className="popup-crt-bodyCateList" style={{ display : cateClick ? "flex" : "none" }}>
                            {
                                cateTag.map((data,i)=>{
                                    return <button key={i} className="popup-crt-bodyCateBtn" onClick={this.cateClick.bind(this,data,i)}>
                                        <div className="popup-crt-bodyCateBtnDiv">
                                            <div className="popup-crt-bodyCateMark" style={{ backgroundColor : data.color }}></div>
                                            <span className="popup-crt-bodyTextContent">{data.name}</span>
                                        </div>
                                    </button>
                                })
                            }
                        </div>
                    </div>
                    <span className="popup-crt-bodyText">참여인원</span>
                    <div className="popup-crt-bodyPartnerDiv">
                        <img alt="char" src={charImg} className="popup-crt-bodyPartnerInputImg"></img>
                        <input type="text" className="popup-crt-bodyPartnerInput" onChange={this.partnerInput.bind(this)} value={partnerInput}></input>
                    </div>
                    <div>
                        <div className="popup-crt-bodyPartnerDroplist" style={{ display : partnerDrop }}>
                            {
                                partnerData && 
                                partnerData.map((data,i)=> {
                                    return <div key={i} className="popup-crt-bodyPartnerBoxRow" onClick={this.partnerClick.bind(this,data)}>
                                        <div className="popup-crt-bodyPartnerSpaceDiv">
                                            <img src={charImg} alt="char" className="popup-crt-bodyPartnerImg"></img>
                                            <span className="popup-crt-bodyTextContent">{data.username}</span>
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                    <div className="popup-crt-bodyPartnerContent">
                        {
                            partnerSelt &&
                            partnerSelt.map((data,i)=> {
                                return <div key={i} className="popup-crt-bodyPartnerBox">
                                    <img src={charImg} alt="char" className="popup-crt-bodyPartnerImg2"></img>
                                    <span className="popup-crt-bodyTextContentPartner">{data.username}</span>
                                    <button className="popup-crt-bodyPartnerDelt" onClick={this.partnerCancel.bind(this,data.id)}><span className="popup-crt-bpdt">x</span></button>
                                </div>
                            })
                        }
                    </div>
                    <span className="popup-crt-bodyText">메모 사항</span>
                    <textarea className="popup-crt-bodyMemoContent" value={memoArea} onChange={this.memoArea.bind(this)}></textarea>
                </div>
                <div className="popup-crt-btns">
                    <button className="popup-crt-btnCreate" onClick={this.clickSave.bind(this,updateTF)}>
                        <span className="popup-crt-btnSpan">{updateTF ? "수정" : "등록"}</span>
                    </button>
                </div>
            </div>
        </div>
    }
    // 팝업 창의 저장 버튼 누를 시
    async clickSave(updateTF) {
        const { currentTag,startDate,endDate,memoArea,title,startTime,endTime,partnerSelt } = this.state
        if(moment(endDate).diff(startDate, "days") < 0) {
            alert("날짜 입력이 잘못되었습니다. 다시 시도해주세요.");
            return;
        }
        if(!title) {
            alert("제목을 입력해주세요.");
            return;
        }
        await this.setState({
            saveData : {},
        })
        if(currentTag.num === 2){
            await this.setState({
                saveData : {
                    title : title,
                    startDate : moment(startDate).format("YYYY-MM-DD"),
                    endDate : moment(endDate).format("YYYY-MM-DD"),
                    state : "휴가관련",
                    dir : true,
                }
            })
        } else {
            await this.setState({
                saveData : {
                    title : title,
                    content : memoArea,
                    partner : partnerSelt,
                    startDate : moment(startDate).format("YYYY-MM-DD") + " " + startTime,
                    endDate : moment(endDate).format("YYYY-MM-DD") + " " + endTime,
                    state : currentTag.name,
                    dir : true,
                }
            })
        }
        this.setState({
            popupInv : "none",
            updateTF : false,
        })
        if(updateTF){
            this.beforeUpdateSchedule(this.state.saveData);
        } else {
            this.createScheduleItems(this.state.saveData);
        }
    }
    // 팝업 창의 취소 버튼 누를 시
    clickCancel() {
        this.setState({
            popupInv : "none",
            popupInvSchedule : "none",
            updateTF : false,
            in_data : {},
        })
    }
    // 스케줄 클릭 시
    clickSchedule = async(e) =>{ 
        const { cateTag } = this.state;
        let color = "";
        let num = 0;
        await this.setState({
            in_data : {},
        })
        if(e.schedule.calendarId !== "99") {
            const calendarResult = await axios.get(`${configs.domain}/calendar/one?id=${e.schedule.id}`);
            await this.setState({
                in_data : {
                    id : e.schedule.id,
                    c_id : e.schedule.calendarId,
                    title : calendarResult.data.cate,
                    tag : calendarResult.data.state,
                    color : configs.colors[2],
                    num : 0,
                    start : moment(e.schedule.start._date).format("YYYY-MM-DD HH:mm"),
                    end : moment(e.schedule.end._date).format("YYYY-MM-DD HH:mm"),
                    startTime : moment(e.schedule.start._date).format("LT"),
                    endTime : moment(e.schedule.end._date).format("LT"),
                }
            })
        } else {
            try {
                const generalResult = await axios.get(`${configs.domain}/generals/one?id=${e.schedule.id}`);
                cateTag.forEach(data=>{
                    if(data.name === generalResult.data.tag) {
                        color = data.color;
                        num = data.num
                    }
                });
                await this.setState({
                    in_data : {
                        id : generalResult.data.id,
                        c_id : e.schedule.calendarId,
                        title : generalResult.data.title,
                        content : generalResult.data.content,
                        partner : generalResult.data.partner,
                        color : color,
                        num : num,
                        tag : generalResult.data.tag,
                        memo : generalResult.data.content,
                        start : moment(e.schedule.start._date).format("YYYY-MM-DD HH:mm"),
                        end : moment(e.schedule.end._date).format("YYYY-MM-DD HH:mm"),
                        startTime : moment(e.schedule.start._date).format("LT"),
                        endTime : moment(e.schedule.end._date).format("LT"),
                    }
                })
            } catch (err) {
                console.log("click schedule info err : " + err)
            }
        }
        await this.popupScheduleUser();
        await this.setState({
            popupInvSchedule : this.state.popupInvSchedule === "none" ? "flex" : "none",
            popupInv : "none",
            updateTF : false,
        });
    }
    // 스케줄 클릭 시 해당 유저의 스케줄인지 체크
    async popupScheduleUser() {
        const { usertoken,in_data } = this.state
        try {
            let select = "";
            if(in_data.c_id === "99")
                select = "general"
            else
                select = "calendar"
            const result = await axios.get(`${configs.domain}/slackapi/userGetVerify?id=${in_data.id}&select=${select}`)
            if(result.data.userId === usertoken)
                this.setState({ userGet : true })
            else
                this.setState({ userGet : false })
        } catch(err) {
            console.log("popup user get err : " + err);
        }
    }
    // 스케줄용 팝업 창
    popupSchedule() {
        const { in_data,userGet } = this.state;
        return <div className="popup-confirm">
            <div className="popup-confirm-main" style={{
                display : this.state.popupInvSchedule,
            }}>
                <div className="popup-confirm-header">
                    <span className="popup-confirm-headerTitle">일정 확인</span>
                    <span className="popup-confirm-headerCancel" onClick={this.clickCancel.bind(this)}>x</span>
                </div>
                <div className="popup-confirm-hAndBLine"></div>
                <div className="popup-confirm-body">
                    <span className="popup-confirm-bodyText">제목</span>
                    <span className="popup-confirm-bodyTextContent">{in_data.title}</span>
                    <span className="popup-confirm-bodyText">시간</span>
                    <span className="popup-confirm-bodyTextContent">{moment(in_data.start).format("YYYY. MM. DD. (ddd) LT")} ~  {moment(in_data.end).format("YYYY. MM. DD. (ddd) LT")}</span>
                    <span className="popup-confirm-bodyText">카테고리</span>
                    <div className="popup-confirm-bodyCateContent">
                        <div className="popup-confirm-bodyCateMark" style={{ backgroundColor : in_data.color }}></div>
                        <span className="popup-confirm-bodyTextContent">{in_data.tag}</span>
                    </div>
                    <span className="popup-confirm-bodyText">참여인원</span>
                    <div className="popup-confirm-bodyPartnerContent">
                        {
                            in_data.partner &&
                            in_data.partner.map((data,i)=>{
                                return <div key={i} className="popup-confirm-bodyPartnerBox">
                                    <img src={charImg} alt="char" className="popup-confirm-bodyPartnerImg"></img>
                                    <span className="popup-confirm-bodyTextContent">{data.username}</span>
                                </div>
                            })
                        }
                    </div>
                    <span className="popup-confirm-bodyText">메모 사항</span>
                    <div className="popup-confirm-bodyTextContent">
                        <span>{in_data.memo ? in_data.memo : ""}</span>
                    </div>
                </div>
                <div className="popup-confirm-btns">
                    {
                        userGet && <>
                            <button className="popup-confirm-btnUpdat" onClick={this.popupUpdate.bind(this,in_data)}>
                                <span className="popup-confirm-btnUpdatText">수정</span>
                            </button>
                            <button className="popup-confirm-btnDelet" onClick={this.beforeDeleteSchedule.bind(this,in_data.id,in_data.c_id)}>
                                <span className="popup-confirm-btnDeletText">삭제</span>
                            </button>
                        </>
                    }
                </div>
            </div>
        </div>
    }
    // 수정 버튼을 눌렀을 시 수정용 스태이트 값 변환
    popupUpdate(data) {
        this.setState({
            // 현재 수정 버튼을 누른 상태인지 체크하기 위한 불 값
            updateTF : true,
            // 넘어온 데이터를 토대로 재구성하여 보여줌
            title : data.title,
            startDate : data.start,
            endDate : data.end,
            startTime : data.startTime,
            endTime : data.endTime,
            currentTag : { name : data.tag, color : data.color, num : data.num },
            partnerInput : "",
            partnerSelt : data.partner,
            memoArea : data.memo ? data.memo : "",
            updateID : data.id,
            updateCID : data.c_id,
        })
        this.setState({
            popupInv : "flex",
            popupInvSchedule : "none",
        })
    }
    // ------------------------------ 렌더링 ------------------------------ //
    render() {
        // 팝업 창 처음부터 렌더
        const popupmini = this.popupCreate();
        const popupschedule = this.popupSchedule();
        const { loading } = this.state;
        return (
            <div className="tui-div">
                {
                    !loading && <div className="loadMaskDiv">
                        <img alt="Loging~" src={loadMask} className="loadMask"></img>
                    </div>
                }
                <div className="tui-monthBtnDiv">
                    <span className="tui-monthText" onClick={this.handleClickPrevNextButton.bind(this,"pre")}>&lt; 이전 달</span>
                    <span className="tui-monthText" onClick={this.handleClickPrevNextButton.bind(this,"nex")}>다음 달 &gt;</span>
                </div>
                { popupmini /*popup components create */ }
                { popupschedule /*popup components schedule */ }
                <Calendar
                    height="610px"
                    ref={this.calendarRef}
                    onBeforeCreateSchedule={this.beforeCreateSchedule}
                    onBeforeUpdateSchedule={this.beforeUpdateSchedule}
                    onBeforeDeleteSchedule={this.beforeDeleteSchedule}
                    disableDblClick={true}
                    disableClick={false}
                    isReadOnly={false}
                    schedules={this.state.scheduleItem}
                    timezones={[
                        {
                        timezoneOffset: 540,
                        displayLabel: 'GMT+09:00',
                        tooltip: 'Seoul'
                        }
                    ]}
                    useDetailPopup={false}
                    useCreationPopup={false}
                    view={"month"}
                    month={{
                        daynames: ['일', '월', '화', '수', '목', '금', '토'],
                        narrowWeekend : true,
                        isAlways6Week : true
                    }}
                    onClickSchedule={this.clickSchedule}
                />
            </div>
        );
    }
}

export default TestCal;