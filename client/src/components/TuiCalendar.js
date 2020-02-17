import React from "react";
import axios from 'axios';
import moment from "moment";
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';    // 캘린더 css 적용
import configs from '../client_config'; // config 파일

class TestCal extends React.Component {
    constructor(props) {
        super(props);
        this.calendarRef = React.createRef();   // 캘린더 인스턴스용 Ref
        this.state = {
            scheduleArray : [], // 캘린터 아이템에 넣기 전 푸시용
            scheduleItem : null,    // 캘린더에 표시되는 아이템들
            usertoken : "", // 유저 토큰 값
            user : [],  // 유저 데이터 정보 디비
            // token state
            tokenexpire : "",
        }
    }
    // 초기 마운트
    async componentDidMount(){
        // token verify
        await this.setState({
            usertoken : await this.usersTokenChecked()
        })
        const { usertoken } = this.state;
        // user Db setting
        await this.setState({
            user : await axios.get(`http://localhost:5000/user/one?userid=${usertoken}`)
        })
        // calendar init moubt
        await this.scheduleInitMount()
        const { scheduleArray } = this.state;
        // calendar create mount
        await this.scheduleCreateMount(scheduleArray);
    }
    // 유저 토큰 확인
    async usersTokenChecked(){
        try {
            const result = await axios("http://localhost:5000/verify",{
                method : "get",
                headers : {
                    'content-type' : 'text/json',
                    'x-access-token' : localStorage.getItem("usertoken")
                }
            });
            if(result.data === "err"){
                console.log("calendar jwt token verify err : tokenExpired -> remove token");
                localStorage.removeItem("usertoken");
                await this.setState({ tokenexpire : "off" });
                return null;
            }
            await this.setState({ tokenexpire : "on" });
            return result.data.userid;
        } catch(err){
            console.log("Tui calendar jwt token verify err : " + err);
        }
    }
    // ------------------------------ Instance method ------------------------------ //
    // 이전 달로 이동하는 버튼
    handleClickPrevButton = async() => {
        const calendar = this.calendarRef.current.getInstance();
        calendar.prev();
    };
    // 다음 달로 이동하는 버튼
    handleClickNextButton = async() => {
        const calendar = this.calendarRef.current.getInstance();
        calendar.next();
    };
    // 오늘 날짜로 돌아오기
    todayButton = async() => {
        const calendar = this.calendarRef.current.getInstance();
        calendar.today();
    }
    // ------------------------------ Event ------------------------------ //
    // 새로운 일정 생성 시 동작
    // 생성 시 슬랙에도 메시지 출력
    // 캘린더 상에서 일정 등록 시 필요 양식 => 예) oo 휴가/반차
    beforeCreateSchedule = async(data) => {
        const calendar = this.calendarRef.current.getInstance();
        let dataText = configs.dataTitleReg.exec(data.title)
        let timeText = "";
        if(moment(data.end._date).diff(data.start._date, "days") >= 1){
            timeText = "["+dataText[1]+"] "+ moment(data.start._date).format("YYYY[년] MM[월] DD") + "~" + moment(data.end._date).format("DD") + " " + dataText[2]
        } else {
            timeText = "["+dataText[1]+"] "+ moment(data.start._date).format("YYYY[년] MM[월] DD[일] ") + dataText[2]
        }
        try {
            const { user } = this.state;
            await axios.post("http://localhost:5000/slackapi/messagePost",{
                channel : configs.channel_calendar,
                p_token : user.data.p_token,
                text : timeText
            })
            let result = await axios.post("http://localhost:5000/slackapi/channelHistoryCal")
            calendar.createSchedules([{
                id: result.data[0].id,
                calendarId: '0',
                title: result.data[0].textTitle,
                category: 'time',
                isAllDay: configs.dataCateReg.exec(result.data[0].textTitle) ? true : data.isAllDay,
                start : data.start._date,
                end : data.end._date
            }])
        } catch(err) {
            console.log("before create scd err : " + err);
        }
    }
    // 일정 수정 시
    // 수정 시 슬랙의 메시지도 수정
    // 수정 시에도 생성 시와 같은 양식 준수 필요
    beforeUpdateSchedule = async(data) => {
        const calendar = this.calendarRef.current.getInstance();
        let dataText = "";
        let dbTimeText = "";
        let timeText = "";
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
        calendar.updateSchedule(data.schedule.id, data.schedule.calendarId, {
            title : data.changes.title  && data.changes.title,
            start : data.changes.start && data.changes.start._date,
            end : data.changes.end && data.changes.end._date,
            isAllDay : data.changes.isAllDay && data.changes.isAllDay,
        });
        try {
            const { user } = this.state;
            let result = axios.get(`http://localhost:5000/calendar/one?id=${data.schedule.id}`);
            let updateRe = axios.put("http://localhost:5000/calendar/update",{
                id : data.schedule.id,
                userId : user.data.id,
                text : timeText,
                cate : dataText[2],
                textTime : dbTimeText,
                textTitle : data.changes.title
            });
            await result;
            await updateRe;
            await axios.post("http://localhost:5000/slackapi/messageUpdate",{
                p_token : user.data.p_token,
                channel : configs.channel_calendar,
                text : timeText,
                time : (await result).data.ts
            })
        } catch(err){
            console.log("before scd update err : " + err);
        }
    }
    // 일정 삭제 시
    // 삭제 시 메시지 또한 삭제 됨
    beforeDeleteSchedule = async(data) => {
        const calendar = this.calendarRef.current.getInstance();
        calendar.deleteSchedule(data.schedule.id, data.schedule.calendarId);
        try {
            let deleteRe = axios.delete(`http://localhost:5000/calendar/delete?id=${data.schedule.id}`);
            let result = axios.get(`http://localhost:5000/calendar/one?id=${data.schedule.id}`);
            await deleteRe;
            await result;
            const { user } = this.state;
            await axios.post("http://localhost:5000/slackapi/messageDelete",{
                p_token : user.data.p_token,
                channel : configs.channel_calendar,
                time : (await result).data.ts,
            })
        } catch(err) {
            console.log("before scd delete err : " + err)
        }
    }

    // 캘린더 스케줄 초기 마운트 시 생성 설정
    async scheduleInitMount() {
        // calendar db select all -> init
        let schedulesDB = await axios.get("http://localhost:5000/calendar/all");
        await this.setState({
            scheduleArray : schedulesDB.data
        })
    }
    // 캘린더 스케줄 마운트 및 정규식 표현 처리
    async scheduleCreateMount(scheduleArray) {
        let scheduleItem = [];
        let startDate = "";
        let endDate = "";
        let regDays = [];
        try {
            scheduleArray.forEach(data => {
                regDays = configs.dataTimeReg.exec(data.textTime)
                let days = [];
                let scheduleObj = {};
                let isAll = configs.dataCateReg.exec(data.cate) ? true : false
                let timeAm = isAll ? " 00:00" : " 09:00"
                let timePm = isAll ? " 23:59" : " 19:00"
                timeAm = configs.dataCateTimeReg.exec(data.cate) ? " 11:59" : timeAm
                // regDays : 2020-02-02-
                // 물결을 사용한 다수 일정 등록 시
                if(/~/.exec(data.textTime)){
                    days = data.textTime.split(/~/)
                    if(days.length > 1){
                        for (let index = 0; index < days.length; index++) {
                            if(days[index].length < 3)
                                days[index] = regDays[0] + days[index]
                        }
                    }
                    if(!/\d{2}/.exec(days[days.length -1])){
                        days[days.length -1] = "0" + days[days.length -1]
                    }
                    startDate = moment(days[0] + timeAm).format()
                    endDate = moment(days[days.length -1] + timePm).format()
                    scheduleObj = {
                        id: data.id,
                        calendarId: '0',
                        title: data.textTitle,
                        category: 'time',
                        isAllDay: isAll,
                        start : startDate,
                        end : endDate
                    };
                    scheduleItem.push(scheduleObj)
                // 컴마를 사용한 다수 일정 등록 시
                } else if(/,/.exec(data.textTime)){
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
                                title: data.textTitle,
                                category: 'time',
                                isAllDay: isAll,
                                start : startDate,
                                end : endDate
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
                        title: data.textTitle,
                        category: 'time',
                        isAllDay: isAll,
                        start : startDate,
                        end : endDate
                    };
                    scheduleItem.push(scheduleObj)
                }
            })
            await this.setState({
                scheduleItem
            })
        } catch(err) {
            console.log("TUI Mount init Schedule err : " + err)
        }
    }
    // ------------------------------ 렌더링 ------------------------------ //
    render() {
        const { tokenexpire } = this.state
        return (
            <div className="app-centerDiv">
                <div>
                    <span className="tokenprops">{this.props.tokenstate(tokenexpire)}</span>
                    <button onClick={this.handleClickPrevButton}>Prev</button>
                    <button onClick={this.handleClickNextButton}>Next</button>
                    <button onClick={this.todayButton}>Today</button>
                    <span id="renderRange" className="render-range"></span> {/** 달력 현재 월 표시 */}
                </div>
                <Calendar
                    height="700px"
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
                    useDetailPopup
                    useCreationPopup
                    view={"month"}
                    month={{
                        daynames: ['일', '월', '화', '수', '목', '금', '토'],
                        narrowWeekend : true,
                        isAlways6Week : true
                    }}
                />
            </div>
        );
    }
}

export default TestCal;