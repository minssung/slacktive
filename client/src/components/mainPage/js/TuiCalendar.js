import React from "react";
import axios from 'axios';
import moment from "moment";
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';    // 캘린더 css 적용
import configs from '../../../client_config'; // config 파일
import '../css/popupCrt.css'    // 팝업 생성
import '../css/popupConfirm.css'    // 팝업 확인

class TestCal extends React.Component {
    constructor(props) {
        super(props);
        this.calendarRef = React.createRef();   // 캘린더 인스턴스용 Ref
        // calendar popup refs
        this.title = React.createRef();
        this.location = React.createRef();
        this.content = React.createRef();
        this.partner = React.createRef();
        this.radioBtn = React.createRef();
        this.time = React.createRef();
        this.etcText = React.createRef();
        //  userinfo popup refs
        this.state = {
            scheduleArray : [], // 캘린터 아이템에 넣기 전 푸시용
            generalsArray : [], // 일정 아이템에 넣기 전 푸시용
            scheduleItem : null,    // 캘린더에 표시되는 아이템들
            usertoken : "", // 유저 토큰 값
            user : [],  // 유저 데이터 정보 디비
            calendarDate : 'default', // 달력 월 표시
            // popup create state
            startDate : "",
            endDate : "",
            saveData : {},
            popupInv : "none",
            selectCal : true,
            // popup schedule state
            start_date : "",
            end_date : "",
            in_data : {},
            popupInvSchedule : "none",
            userGet : true,
            // popup update state
            updateData : {},
            updateTF : false,
        }
    }
    // 초기 마운트
    async componentDidMount(){
        // token verify
        await this.setState({
            usertoken : await this.props.Token
        })
        const { usertoken } = this.state;
        // user Db setting
        await this.setState({
            user : await axios.get(`http://localhost:5000/user/one?userid=${usertoken}`)
        })
        // calendar init moubt
        await this.scheduleInitMount()
        const { scheduleArray,generalsArray } = this.state;
        // calendar create mount
        await this.scheduleCreateMount(scheduleArray,generalsArray);
        // 현재 달력 월
        await this.nowDate();
    }
    // ------------------------------ Instance method ------------------------------ //
    // 이전 달로 이동하는 버튼
    handleClickPrevButton = async() => {
        const calendar = this.calendarRef.current.getInstance();
        calendar.prev();
        this.nowDate();
    };
    // 다음 달로 이동하는 버튼
    handleClickNextButton = async() => {
        const calendar = this.calendarRef.current.getInstance();
        calendar.next();
        this.nowDate();
    };
    // 오늘 날짜로 돌아오기
    todayButton = async() => {
        const calendar = this.calendarRef.current.getInstance();
        calendar.today();
        this.nowDate();
    }
    // 달력 현재 날짜 표시
    nowDate = () => {
        const calendar = this.calendarRef.current.getInstance();
        const date = calendar.getDate();
        const momentdate = moment(date._date).format('YYYY.MM');
        this.setState({
            calendarDate : momentdate
        });
    }
    // ------------------------------ Event ------------------------------ //
    // 캘린더 영역을 클릭 시에 이벤트 호출
    beforeCreateSchedule = async(e) => {
        await this.setState({
            startDate : moment(e.start._date).format("YYYY-MM-DD HH:mm"),
            endDate : moment(e.end._date).format("YYYY-MM-DD HH:mm")
        });
        this.setState({
            popupInv : this.state.popupInv === "none" ? "flex" : "none",
            popupInvSchedule : "none",
            in_data : {},
        });
    }
    // 새로운 일정 생성 시 동작
    // 생성 시 슬랙에도 메시지 출력
    // 캘린더 상에서 일정 등록 시 필요 양식 => 예) oo 휴가/반차
    createScheduleItems = async(data) => {
        const calendar = this.calendarRef.current.getInstance();
        const { user,selectCal } = this.state;
        if(selectCal){
            let timeText = "";
            if(moment(data.endDate).diff(data.startDate, "days") >= 1){
                timeText = "["+user.data.username+"] "+ moment(data.startDate).format("YYYY[년] MM[월] DD") + "~" + moment(data.endDate).format("DD") + " " + data.radio
            } else {
                timeText = "["+user.data.username+"] "+ moment(data.startDate).format("YYYY[년] MM[월] DD[일] ") + data.radio
            }
            try {
                await axios.post("http://localhost:5000/slackapi/messagePost",{
                    channel : configs.channel_calendar,
                    p_token : user.data.p_token,
                    text : timeText
                })
                const result = await axios.post("http://localhost:5000/slackapi/channelHistoryCal")
                calendar.createSchedules([{
                    id: result.data[0].id,
                    calendarId: '0',
                    title: user.data.username + " " + data.radio,
                    category: 'time',
                    isAllDay: configs.dataCateReg.test(data.radio) ? true : false,
                    start : data.startDate,
                    end : data.endDate,
                    bgColor : "#ffffff",
                    color : "#ffffff",
                }])
            } catch(err) {
                console.log("before create scd err : " + err);
            }
        } else {
            try {
                await axios.post("http://localhost:5000/slackapi/messagePost",{
                    channel : user.data.userchannel,
                    p_token : user.data.p_token,
                    text : `[${data.title}] ${data.content} / ${data.startDate}~${data.endDate} / 참여자 : ${data.partner}`
                })
                const result = await axios.post("http://localhost:5000/generals/create",{
                    title : data.title,
                    content : data.content,
                    partner : data.partner,
                    textTime : data.startDate + "~" + data.endDate,
                    userId : user.data.id,
                    location : data.location,
                });
                calendar.createSchedules([{
                    id : result.data.id,
                    calendarId: '99',
                    title: data.title,
                    category: "general",
                    start : data.startDate,
                    end : data.endDate,
                    bgColor : "#ffffff",
                    color : "#ffffff",
                }]);
                console.log("create generals success");
            } catch(err) {
                console.log("before create gnr err : " + err);
            }
        }
        // calendar init mount
        await this.scheduleInitMount()
        // calendar create mount
        await this.scheduleCreateMount(this.state.scheduleArray,this.state.generalsArray);
    }
    // 일정 수정 시
    // 수정 시 슬랙의 메시지도 수정
    // 수정 시에도 생성 시와 같은 양식 준수 필요
    beforeUpdateSchedule = async(data) => {
        const calendar = this.calendarRef.current.getInstance();
        let dataText = "";
        let dbTimeText = "";
        let timeText = "";
        console.log(data);
        console.log(moment(data.end._date).diff(data.start._date, "days"));
        
        
        if(data.changes && data.changes.title){
            dataText = configs.dataTitleReg.exec(data.changes.title)
        } else {
            dataText = configs.dataTitleReg.exec(data.schedule.title)
        }
        if(moment(data.end._date).diff(data.start._date, "days") >= 1){
            timeText = "["+dataText[1]+"] "+ moment(data.start._date).format("YYYY[년] MM[월] DD") + "~" + moment(data.end._date).format("DD") + " " + dataText[2]
            dbTimeText = moment(data.start._date).format("YYYY-MM-DD") + "~" + moment(data.end._date).format("DD")
        } else {
            timeText = "["+dataText[1]+"] "+ moment(data.start._date).format("YYYY[년] MM[월] DD[일] ") + dataText[2]
            dbTimeText = moment(data.start._date).format("YYYY-MM-DD");
        }
        try {
            const { user } = this.state;
            let result = await axios.get(`http://localhost:5000/calendar/one?id=${data.schedule.id}`);
            await axios.put("http://localhost:5000/calendar/update",{
                id : data.schedule.id,
                userId : user.data.id,
                text : timeText,
                cate : dataText[2],
                textTime : dbTimeText,
                textTitle : data.changes.title
            });
            await axios.post("http://localhost:5000/slackapi/messageUpdate",{
                p_token : user.data.p_token,
                channel : configs.channel_calendar,
                text : timeText,
                time : result.data.ts
            })
            calendar.updateSchedule(data.schedule.id, data.schedule.calendarId, {
                title : data.changes.title  && data.changes.title,
                start : data.changes.start && data.changes.start._date,
                end : data.changes.end && data.changes.end._date,
            });
            this.setState({
                popupInv : "none",
                popupInvSchedule : "none",
            })
        } catch(err){
            console.log("before scd update err : " + err);
        }
    }
    // 일정 삭제 시
    // 삭제 시 메시지 또한 삭제 됨
    beforeDeleteSchedule = async(id, c_id) => {
        const calendar = this.calendarRef.current.getInstance();
        const { user } = this.state;
        try {
            let scheduleResult = [];
            if(c_id !== "99") {
                scheduleResult = await axios.get(`http://localhost:5000/calendar/one?id=${id}`);
                await axios.delete(`http://localhost:5000/calendar/delete?id=${id}`);
                await axios.post("http://localhost:5000/slackapi/messageDelete",{
                p_token : user.data.p_token,
                channel : configs.channel_calendar,
                time : scheduleResult.data.ts,
            })
            } else {
                const generalResult = await axios.get(`http://localhost:5000/generals/one?id=${id}`);
                console.log(generalResult)
                await axios.post("http://localhost:5000/slackapi/messagePost",{
                    channel : user.data.userchannel,
                    p_token : user.data.p_token,
                    text : `이전에 등록한 일정 -> 제목 : [${generalResult.data.title}] / 날짜 : ${generalResult.data.textTime}이 캘린더에서 삭제되었습니다.`
                });
                await axios.delete(`http://localhost:5000/generals/delete?id=${id}`);
            }
            calendar.deleteSchedule(id, c_id);
            this.setState({
                popupInvSchedule : "none",
            })
        } catch(err) {
            console.log("before scd delete err : " + err)
        }
    }
    // 캘린더 스케줄 초기 마운트 시 생성 설정
    async scheduleInitMount() {
        // calendar db select all -> init
        let schedulesDB = await axios.get("http://localhost:5000/calendar/all");
        let generalsDB = await axios.get("http://localhost:5000/generals/all");
        await this.setState({
            scheduleArray : schedulesDB.data,
            generalsArray : generalsDB.data,
        })
    }
    // 캘린더 스케줄 마운트 및 정규식 표현 처리
    async scheduleCreateMount(datasS,datasG) {
        let scheduleItem = [];
        let startDate = "";
        let endDate = "";
        let regDays = [];
        let color = "";
        try {
            datasS.forEach(data => {
                color = data.user.usercolor ? data.user.usercolor : "#ffffff";
                regDays = configs.dataTimeReg.exec(data.textTime)
                let days = [];
                let scheduleObj = {};
                let isAll = configs.dataCateReg.test(data.cate) ? true : false
                let timeAm = isAll ? " 00:00" : " 09:00"
                let timePm = isAll ? " 23:59" : " 19:00"
                timeAm = configs.dataCateTimeReg.test(data.cate) ? " 11:59" : timeAm
                // regDays : 2020-02-02-
                // 물결을 사용한 다수 일정 등록 시
                if(/~/.test(data.textTime)){
                    days = data.textTime.split(/~/)
                    if(days.length > 1){
                        for (let index = 0; index < days.length; index++) {
                            if(days[index].length < 3)
                                days[index] = regDays[0] + days[index]
                        }
                    }
                    if(!/\d{2}/.test(days[days.length -1])){
                        days[days.length -1] = "0" + days[days.length -1]
                    }
                    startDate = moment(days[0] + timeAm).format()
                    endDate = moment(days[days.length -1] + timePm).format()
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
                } else if(/,/.test(data.textTime)){
                    days = data.textTime.split(/,/)
                    for (let index = 0; index < days.length; index++) {
                        if(days[index].length < 3)
                            days[index] = regDays[0] + days[index]
                    }
                    // days -> 각각 배열로 출력
                    let num = 0;
                    let count = -1;
                    for (let index = 0; index < days.length; index++) {
                        if(days[index+1] && moment(days[index+1]).diff(days[index], 'days') === 1){
                            if(count === -1)
                            count = index;
                            continue;
                        } else {
                            if(count === -1){
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
            datasG.forEach(data=>{
                color = data.user.usercolor ? data.user.usercolor : "#ffffff";
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
        await this.setState({
            scheduleItem
        })
    }
    selectCalendars(e) {
        this.setState({
            selectCal : e.target.value === "holiday" ? true : false,
        })
    }
    // 일정 등록을 위한 팝업 창
    popupCreate() {
        const { startDate,endDate,popupInv,updateData,updateTF,selectCal,in_data } = this.state;
        return <div className="popup-crt-main" style={{
            display : popupInv
        }}>
            <div className="popup-crt-header">
                <span className="popup-crt-headerTitle">일정 등록하기</span>
                <span className="popup-crt-headerCancel">x</span>
            </div>
            <div className="popup-crt-hAndBLine"></div>
            <div className="popup-crt-body">
                <span className="popup-crt-bodyText">제목</span>
                <span className="popup-crt-bodyTextContent">제목에 들어갈 내용</span>
                <div>
                    <span className="popup-crt-bodyText">시작일</span>
                    <span className="popup-crt-bodyText">시작시간</span>
                </div>
                <div>
                    <span className="popup-crt-bodyTextContent">2020. 03. 03 (수)</span>
                    <span className="popup-crt-bodyTextContent">오전 3:00</span>
                    <input type="checkbox"></input> 종료일과 같음
                </div>
                <div>
                    <span className="popup-crt-bodyText">종료일</span>
                    <span className="popup-crt-bodyText">종료시간</span>
                </div>
                <div>
                    <span className="popup-crt-bodyTextContent">2020. 03. 03 (수)</span>
                    <span className="popup-crt-bodyTextContent">오전 3:00</span>
                </div>
                <span className="popup-crt-bodyText">카테고리</span>
                <div className="popup-crt-bodyCateContent">
                    <div className="popup-crt-bodyCateMark"></div>
                    <span className="popup-crt-bodyTextContent">출장 / 미팅</span>
                </div>
                <span className="popup-crt-bodyText">참여인원</span>
                <div className="popup-crt-bodyPartnerContent">
                    <div className="popup-crt-bodyPartnerBox">
                        <img className="popup-crt-bodyPartnerImg"></img>
                        <span className="popup-crt-bodyTextContent">이름</span>
                    </div>
                    <div className="popup-crt-bodyPartnerBox">
                        <img className="popup-crt-bodyPartnerImg"></img>
                        <span className="popup-crt-bodyTextContent">이름</span>
                    </div>
                    <div className="popup-crt-bodyPartnerBox">
                        <img className="popup-crt-bodyPartnerImg"></img>
                        <span className="popup-crt-bodyTextContent">이름</span>
                    </div>
                </div>
                <span className="popup-crt-bodyText">메모 사항</span>
                <textarea className="popup-crt-bodyMemoContent"></textarea>
            </div>
            <div className="popup-crt-btns">
            <button className="popup-crt-btnCreate">
                    <span className="popup-confirm-bodyMemoContent">등록</span>
                </button>
            </div>
        </div>
    }
    // 팝업 창의 저장 버튼 누를 시
    async clickSave() {
        const { updateTF,selectCal } = this.state
        let times = (this.time.current.innerText).split("~");
        await this.setState({
            saveData : {},
        })
        if(selectCal){
            let radioValue = "";
            for (let index = 0; index < this.radioBtn.current.elements.length; index++) {
                if(this.radioBtn.current.elements[index].checked){
                    if(index === 5) {
                        radioValue = this.etcText.current.value;
                    } else {
                        radioValue = this.radioBtn.current.elements[index].value;
                    }
                    await this.setState({
                        saveData : {
                            radio : radioValue,
                            startDate : moment(times[0]).format("YYYY-MM-DD"),
                            endDate : moment(times[1]).format("YYYY-MM-DD"),
                        }
                    })
                    break;
                }
            }
        } else {
            await this.setState({
                saveData : {
                    title : this.title.current.value,
                    location : this.location.current.value,
                    content : this.content.current.value,
                    partner : this.partner.current.value,
                    startDate : times[0],
                    endDate : times[1],
                }
            })
        }
        this.setState({
            popupInv : "none",
        })
        if(updateTF){
            this.beforeUpdateSchedule(this.state.updateData);
        } else {
            this.createScheduleItems(this.state.saveData);
        }
        this.setState({
            updateTF : false,
            updateData : {},
        })
    }
    // 팝업 창의 취소 버튼 누를 시
    clickCancel() {
        this.setState({
            popupInv : "none",
            popupInvSchedule : "none",
            updateTF : false,
            updateData : {},
            in_data : {},
        })
    }
    // 스케줄 클릭 시
    clickSchedule = async(e) =>{ 
        await this.setState({
            in_data : {},
        })
        if(e.schedule.calendarId !== "99") {
            await this.setState({
                in_data : {
                    id : e.schedule.id,
                    c_id : e.schedule.calendarId,
                    title : e.schedule.title,
                    start : moment(e.schedule.start._date).format("YYYY-MM-DD HH:mm"),
                    end : moment(e.schedule.end._date).format("YYYY-MM-DD HH:mm"),
                }
            })
        } else {
            try {
                const generalResult = await axios.get(`http://localhost:5000/generals/one?id=${e.schedule.id}`);
                await this.setState({
                    in_data : {
                        id : generalResult.data.id,
                        c_id : e.schedule.calendarId,
                        title : generalResult.data.title,
                        location : generalResult.data.location,
                        content : generalResult.data.content,
                        partner : generalResult.data.partner,
                        start : moment(e.schedule.start._date).format("YYYY-MM-DD HH:mm"),
                        end : moment(e.schedule.end._date).format("YYYY-MM-DD HH:mm"),
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
            updateData : {},
        });
    }
    // 스케줄 클릭 시 해당 유저의 스케줄인지 체크
    async popupScheduleUser() {
        const { usertoken,in_data } = this.state
        try {
            let select = "";
            if(in_data.c_id === "99")
                select = "general"
            else {
                select = "calendar"
            }
            const result = await axios.get(`http://localhost:5000/slackapi/userGetVerify?id=${in_data.id}&select=${select}`)
            if(result.data.userId === usertoken){
                await this.setState({
                    userGet : true,
                })
            } else {
                await this.setState({
                    userGet : false,
                })
            }
        } catch(err) {
            console.log("popup user get err : " + err);
        }
    }
    // 스케줄용 팝업 창
    popupSchedule() {
        const { in_data,userGet } = this.state;
        return <div className="popup-confirm-main" style={{
            display : this.state.popupInvSchedule,
        }}>
            <div className="popup-confirm-header">
                <span className="popup-confirm-headerTitle">일정 확인</span>
                <span className="popup-confirm-headerCancel">x</span>
            </div>
            <div className="popup-confirm-hAndBLine"></div>
            <div className="popup-confirm-body">
                <span className="popup-confirm-bodyText">제목</span>
                <span className="popup-confirm-bodyTextContent">제목에 들어갈 내용</span>
                <span className="popup-confirm-bodyText">시간</span>
                <span className="popup-confirm-bodyTextContent">2020. 03. 03 (수) 오전 3:00 ~ 2020. 03. 04 (목) 오전 3:00</span>
                <span className="popup-confirm-bodyText">카테고리</span>
                <div className="popup-confirm-bodyCateContent">
                    <div className="popup-confirm-bodyCateMark"></div>
                    <span className="popup-confirm-bodyTextContent">출장 / 미팅</span>
                </div>
                <span className="popup-confirm-bodyText">참여인원</span>
                <div className="popup-confirm-bodyPartnerContent">
                    <div className="popup-confirm-bodyPartnerBox">
                        <img className="popup-confirm-bodyPartnerImg"></img>
                        <span className="popup-confirm-bodyTextContent">이름</span>
                    </div>
                    <div className="popup-confirm-bodyPartnerBox">
                        <img className="popup-confirm-bodyPartnerImg"></img>
                        <span className="popup-confirm-bodyTextContent">이름</span>
                    </div>
                    <div className="popup-confirm-bodyPartnerBox">
                        <img className="popup-confirm-bodyPartnerImg"></img>
                        <span className="popup-confirm-bodyTextContent">이름</span>
                    </div>
                </div>
                <span className="popup-confirm-bodyText">메모 사항</span>
                <span className="popup-confirm-bodyTextContent">메모 내용</span>
            </div>
            <div className="popup-confirm-btns">
                <button className="popup-confirm-btnUpdat">
                    <span className="popup-confirm-btnUpdatText">수정</span>
                </button>
                <button className="popup-confirm-btnDelet">
                    <span className="popup-confirm-btnDeletText">삭제</span>
                </button>
            </div>
        </div>
    }
    // 수정 버튼을 눌렀을 시 수정용 스태이트 값 변환
    async popupUpdate(data) {
        console.log(data)
        await this.setState({
            updateData : data,
            updateTF : true,
        })
        await this.setState({
            popupInv : "flex",
            popupInvSchedule : "none",
        })
    }
    // ------------------------------ 렌더링 ------------------------------ //
    render() {
        // 팝업 창 처음부터 렌더
        const popupmini = this.popupCreate();
        const popupschedule = this.popupSchedule();
        const { calendarDate } = this.state;
        return (
            <div className="tui-div">
                <div>
                    <button onClick={this.handleClickPrevButton}>이전 달</button>
                    <button onClick={this.handleClickNextButton}>다음 달</button>
                    <button onClick={this.todayButton}>오늘</button>
                    <span>{calendarDate}</span> {/** 달력 현재 월 표시 */}
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