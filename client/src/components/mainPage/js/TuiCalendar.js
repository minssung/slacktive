import React from "react";
import axios from 'axios';
import moment from "moment";
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';    // 캘린더 css 적용
import configs from '../../../client_config'; // config 파일

class TestCal extends React.Component {
    constructor(props) {
        super(props);
        this.calendarRef = React.createRef();   // 캘린더 인스턴스용 Ref
        this.state = {
            scheduleArray : [], // 캘린터 아이템에 넣기 전 푸시용
            scheduleItem : null,    // 캘린더에 표시되는 아이템들
            usertoken : "", // 유저 토큰 값
            user : [],  // 유저 데이터 정보 디비
            calendarDate : 'default' // 달력 월 표시
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
        const { scheduleArray } = this.state;
        // calendar create mount
        await this.scheduleCreateMount(scheduleArray);
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
    // 새로운 일정 생성 시 동작
    // 생성 시 슬랙에도 메시지 출력
    // 캘린더 상에서 일정 등록 시 필요 양식 => 예) oo 휴가/반차
    beforeCreateSchedule = async(data) => {
        const calendar = this.calendarRef.current.getInstance();
        let dataText = configs.dataTitleReg.exec(data.title)
        let timeText = "";
        let color = this.randomColors();
        
        console.log(dataText);
        

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
                end : data.end._date,
                bgColor : color,
            }])
        // calendar init moubt
        await this.scheduleInitMount()
        const { scheduleArray } = this.state;
        // calendar create mount
        await this.scheduleCreateMount(scheduleArray);
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
                isAllDay : data.changes.isAllDay && data.changes.isAllDay,
            });
        } catch(err){
            console.log("before scd update err : " + err);
        }
    }
    // 일정 삭제 시
    // 삭제 시 메시지 또한 삭제 됨
    beforeDeleteSchedule = async(data) => {
        const calendar = this.calendarRef.current.getInstance();
        try {
            let result = await axios.get(`http://localhost:5000/calendar/one?id=${data.schedule.id}`);
            await axios.delete(`http://localhost:5000/calendar/delete?id=${data.schedule.id}`);
            const { user } = this.state;
            await axios.post("http://localhost:5000/slackapi/messageDelete",{
                p_token : user.data.p_token,
                channel : configs.channel_calendar,
                time : result.data.ts,
            })
            calendar.deleteSchedule(data.schedule.id, data.schedule.calendarId);
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
        let color = "";
        try {
            scheduleArray.forEach(data => {
                color = this.randomColors();
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
                        end : endDate,
                        bgColor : color,
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
                        title: data.textTitle,
                        category: 'time',
                        isAllDay: isAll,
                        start : startDate,
                        end : endDate,
                        bgColor : color,
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
    // 랜덤 컬러 생성 함수
    randomColors() {
        let num = Math.floor(Math.random() * 11);
        let color = configs.colorArray[num]
        return color;
    }
    // ------------------------------ 렌더링 ------------------------------ //
    render() {
        const { calendarDate } = this.state;

        return (
            <div className="tui-div">
                <div>
                    <button onClick={this.handleClickPrevButton}>이전 달</button>
                    <button onClick={this.handleClickNextButton}>다음 달</button>
                    <button onClick={this.todayButton}>오늘</button>
                    <span>{calendarDate}</span> {/** 달력 현재 월 표시 */}
                </div>
                <Calendar
                    height="100%"
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