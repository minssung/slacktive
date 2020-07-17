import React, { Component } from 'react';
import axios from 'axios';
import moment from "moment";
import Calendar from '@toast-ui/react-calendar';
import CircularProgress from '@material-ui/core/CircularProgress';

import Popup from './popup';
import Confirm from './confirm';

import 'tui-calendar/dist/tui-calendar.css';    // 캘린더 css 적용
import 'moment/locale/ko'       // 한글로 불러오기

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../../devClient_config') : configs = require('../../../client_config');

class Tui extends Component {
    constructor(props) {
        super(props);
        this.calendarRef = React.createRef();   // 캘린더 인스턴스용 Ref
        this.state = {
            resultData : [],

            open : false,    // 팝업 오픈
            click : false,   // 상세 팝업 오픈

            id : 0,
            cid : "99",
            state : false,
            // 데이터 스태이트들
            title : "",
            startDate : new Date(),
            endDate : new Date(),
            startTime : "12:00",
            endTime : "12:00",
            ingCheck : false,
            cate : { color : "#d6ff98", text : "출장/미팅" },
            partnerInput : "",
            partners : [],
            content : "",

            load : false,
        }
    }

    // 초기 데이터 마운트
    componentDidMount() {
        const { holidayData, generalData } = this.props;
        this.scheduleMount(holidayData, generalData);
    }

    // 초기 데이터 세팅
    scheduleMount(holidayData, generalData) {
        let result = [];

        // 휴가 내역 아이템 생성
        holidayData.forEach((data,i) => {
            const isAll = !/반차/g.test(data.cate);
            // 날짜 갯수 기준으로 한번 더 반복문 수행
            data.textTime.forEach(time => {
                result.push({
                    id : data.id,
                    calendarId : "99",
                    title : data.user.username + " " + data.cate,
                    category : "time",
                    isAllDay : isAll,
                    start : time.startDate,
                    end : time.endDate,
                    bgColor : "#fff598",
                })
            });
        });

        // 일정 내역 아이템 생성
        generalData.forEach((data,i) => {
            let color = "";
            switch(data.tag) {
                case "출장/미팅" : color = "#d6ff98"; break;
                case "회의" : color = "#87dffa"; break;
                case "생일" : color = "#b0c0ff"; break;
                case "기타" : color = "#ff98c3"; break;
                default : color = "#d6ff98"; break;
            }
            result.push({
                id : data.id,
                calendarId : "98",
                title : (data.location ? (data.location + " / ") : "") + data.title,
                category : "time",
                isAllDay : false,
                start : data.startDate,
                end : data.endDate,
                bgColor : color,
                body : data.content,
            })
        });

        this.setState({ resultData : result, load : true });
    }

    // 일정 등록 팝업 오픈
    open(e) { 
        this.setState({ 
            open : { view : true, create : true },
            startDate : e.start._date,
            endDate : e.end._date,
        }); 
    }

    // 일정 확인 창에서 수정 버튼 누를 시
    openChange() { this.setState({ open : { view : true, create : false }, click : false }); }

    // 팝업 닫기
    close() { 
        this.setState({ 
            open : false,
            click : false,
            title : "",
            startDate : new Date(),
            endDate : new Date(),
            startTime : moment(new Date()).format("HH:mm"),
            endTime : moment(new Date()).format("HH:mm"),
            ingCheck : false,
            cate : { color : "#d6ff98", text : "출장/미팅" },
            partnerInput : "",
            partners : [],
            content : "",
        });
    }

    // 기본 스태이트 변경 함수
    onChange(e) { this.setState({ [e.target.name] : e.target.value }); }

    onChangeCheck(e) { this.setState({ ingCheck : e }); }

    // 카테고리 선택의 경우
    cateChange(text, color) { this.setState({ cate : { text, color } }); }

    // 날짜 선택의 경우
    onChangeDate(cate, e) { this.setState({ [cate] : e }); }

    // 참여인원 추가의 경우
    onAddPartner(data) { this.setState({ partners : this.state.partners.concat(data)}); }

    // 참여인원 삭제의 경우
    onRemovePartner(data) { this.setState({ partners : this.state.partners.filter(value => { return value !== data })})}

    // 월 변경의 경우
    nextPre(cate) {
        const calendar = this.calendarRef.current.getInstance();
        if(!cate) calendar.prev();
        else calendar.next();
    }

    // 카테 컬러 변경
    cateColor(cate) {
        let color = "";
        switch(cate) {
            case "출장/미팅" : color = "#d6ff98"; break;
            case "회의" : color = "#87dffa"; break;
            case "생일" : color = "#b0c0ff"; break;
            case "휴가" : color = "#fff598"; break;
            case "기타" : color = "#ff98c3"; break;
            default : color = "#d6ff98"; break;
        }
        return color;
    }
    
    /* =============================================== 캘린더 CRUD ============================================ */
    // 생성 시
    async create() {
        this.close();
        this.setState({ load : false });

        const { title, startDate, startTime, endDate, endTime, ingCheck, cate, partners, content } = this.state;
        const { user } = this.props;

        try {
            let start = moment(startDate).format("YYYY/MM/DD") + " " + startTime;
            let end = moment(endDate).format("YYYY/MM/DD") + " " + endTime;

            if(cate.text !== "휴가") {
                const result = await axios.post(`${configs.domain}/general/create`, {
                    title, content, tag : cate.text, partner : partners, 
                    startDate : start,
                    endDate : (ingCheck ? start : end),
                    userId : user.userid,
                });

                if(!result.data) { alert("일정 등록 중 에러가 발생했습니다. 다시 시도해주세요."); return; }

                axios.post(configs.domain+"/slackapi/messagePost",{
                    channel : user.userchannel,
                    p_token : user.p_token,
                    text : `
                        제목: [${title}] / 
                        ${content && `메모사항: [${content}] /`} 
                        ${startDate + " " + startTime}~
                        ${endDate + " " + endTime} / 
                        ${partners && partners[0] && `참여자: ${partners}`}`
                })
            } else {
                let timeText = "";

                if(moment(endDate).diff(startDate, "days") >= 1) {
                    timeText = "["+user.username+"] "+ moment(startDate).format("YYYY[년] MM[월] DD[일]") + "~" + moment(endDate).format("YYYY[년] MM[월] DD[일]") + " " + title
                } else {
                    timeText = "["+user.username+"] "+ moment(startDate).format("YYYY[년] MM[월] DD[일] ") + title
                }

                await axios.post(configs.domain+"/slackapi/messagePost",{
                    channel : configs.channel_calendar,
                    p_token : user.p_token,
                    text : timeText
                });

                const update = await axios.get(`${configs.domain}/update`);
                if(!update.data) { alert("휴가 정보 새로고침을 실패하였습니다. 다시 시도해주세요."); return; }
            }

            this.mountCalendar();
        } catch(err) {
            console.log("일정 등록 에러 발생 : ", err);
        }
        this.setState({ load : true });
    }

    // 수정 시
    async update() {
        this.close();
        this.setState({ load : false });

        const calendar = this.calendarRef.current.getInstance();

        const { title, startDate, endDate, startTime, endTime, cate, partners, content, id, cid } = this.state;
        const { user } = this.props;

        let result = null;
        let textTime = "";

        let updat = null;
        let postUpdat = null;

        calendar.updateSchedule(id, cid, {
            title : (cid === "98" ? title : `${user.username} ${title}`),
            start : startDate,
            end : endDate,
            bgColor : cate.color,
            body : content,
        });

        try {
            if(cid === "98") {
                result = await axios.get(`${configs.domain}/general/one?id=${id}`);

                let start = "";
                let end = "";

                start = moment(startDate).format("YYYY/MM/DD") + " " + startTime;
                end = moment(endDate).format("YYYY/MM/DD") + " " + endTime;

                let dbTextTime = start + " " + end;
                
                updat = axios.put(configs.domain+"/general/update",{
                    id,
                    title : title,
                    startDate : start,
                    endDate : end,
                    content : content,
                    partner : partners,
                    tag : cate.text,
                });

                postUpdat = axios.post(configs.domain+"/slackapi/messagePost",{
                    channel : user.userchannel,
                    p_token : user.p_token,
                    text : `이전에 등록한 일정 -> 제목 : [(수정전)${result.data.title} (수정후)${title}] / 날짜 : (수정전)${result.data.textTime} (수정후)${dbTextTime}이 캘린더에서 수정되었습니다.`
                });
            } else {
                result = await axios.get(`${configs.domain}/holiday/one?id=${id}`);

                if(moment(endDate).diff(startDate, "days") >= 1){
                    textTime = `[${user.username}] ${moment(startDate).format("YYYY[년] MM[월] DD[일]")}~${moment(endDate).format("YYYY[년] MM[월] DD[일]")} ${title}`
                } else {
                    textTime = `[${user.username}] ${moment(startDate).format("YYYY[년] MM[월] DD[일]")} ${title}`
                }

                let dbTextTime = [];
                dbTextTime.push({
                    startDate : moment(startDate).format("YYYY-MM-DD"),
                    endDate : moment(endDate).format("YYYY-MM-DD")
                });

                updat = axios.put(configs.domain+"/holiday/update",{
                    id,
                    userId : user.userid,
                    text : textTime,
                    cate : title,
                    textTime : dbTextTime,
                });

                postUpdat = axios.post(configs.domain+"/slackapi/messageUpdate",{
                    p_token : user.p_token,
                    channel : configs.channel_calendar,
                    text : textTime,
                    time : result.data.ts
                });
            }

            await Promise.all([updat,postUpdat]);

            this.mountCalendar();
        } catch(err) {
            console.log("캘린더 업데이트 에러 발생 : ", err);
        }
        this.setState({ load : true });
    }

    // 드래그 수정의 경우
    async drag(data) {
        console.log(data);
    }

    // 삭제 시
    async deleted(id, cid) {
        this.setState({ load : false });
        const calendar = this.calendarRef.current.getInstance();
        const { user } = this.props;

        let result = null;
        let post = null;
        let delt = null;

        calendar.deleteSchedule(id, cid);
        this.close();

        try {
            if(cid === "98") {
                result = await axios.get(`${configs.domain}/general/one?id=${id}`);
    
                delt = axios.delete(`${configs.domain}/general/delete?id=${id}`);
                post = axios.post(configs.domain+"/slackapi/messagePost",{
                    channel : user.userchannel,
                    p_token : user.p_token,
                    text : `이전에 등록한 일정 -> 제목 : [${result.data.title}] / 날짜 : ${result.data.startDate + " ~ " + result.data.endDate}이 캘린더에서 삭제되었습니다.`
                });
            } else {
                result = await axios.get(`${configs.domain}/holiday/one?id=${id}`);
    
                delt = axios.delete(`${configs.domain}/holiday/delete?id=${id}`);
                post = axios.post(configs.domain+"/slackapi/messageDelete",{
                    p_token : user.p_token,
                    channel : configs.channel_calendar,
                    time : result.data.ts,
                });
            }
            await Promise.all([delt, post]);

            let holidayResult = axios.get(`${configs.domain}/holiday/all`);
            let calendarResult = axios.get(`${configs.domain}/general/all`);

            await Promise.all([holidayResult, calendarResult]).then(data => {
                holidayResult = data[0].data;
                calendarResult = data[1].data;
            });

            this.mountCalendar();
        } catch(err) {
            console.log("유저 일정/휴가 삭제 에러 발생 : ", err);
            alert("삭제 도중 에러가 발생했습니다. 새로고침 하여주세요.");
        }
        this.setState({ load : true });
    }

    // 일정 또는 휴가 클릭 시
    async itemClick(e) {
        const { user } = this.props;
        let data = e.schedule;
        let result = null;
        
        if(data.calendarId === "98") {
            result = await axios.get(`${configs.domain}/general/one?id=${data.id}`);
        } else {
            result = await axios.get(`${configs.domain}/holiday/one?id=${data.id}`);
        }

        let ing = data.start._date.toString() === data.end._date.toString()
        let cate = result.data.tag || "휴가";
        let color = this.cateColor(cate);

        this.setState({
            open : false,
            click : true,

            id : result.data.id,
            cid : data.calendarId,
            state : result.data.userId === user.userid ? true : false,
            title : result.data.title || result.data.cate,
            startDate : data.start._date,
            endDate : data.end._date,
            startTime : moment(data.start._date).format("HH:mm"),
            endTime : moment(data.end._date).format("HH:mm"),
            ingCheck : ing,
            cate : { text : cate, color },
            partners : data.calendarId === "99" ? [] : result.data.partner,
            content : data.body
        });
    }

    // 캘린더 내용 전체 마운트 새롭게
    async mountCalendar() {
        let holidayResult = axios.get(`${configs.domain}/holiday/all`);
        let calendarResult = axios.get(`${configs.domain}/general/all`);

        await Promise.all([holidayResult, calendarResult]).then(data => {
            holidayResult = data[0].data;
            calendarResult = data[1].data;
        });

        if(!holidayResult ||  !calendarResult) {
            alert("캘린더를 새로 고침 하는 중 에러가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        this.scheduleMount(holidayResult, calendarResult)
    }
    /* =============================================== 캘린더 CRUD ============================================ */

    render() {
        const { resultData, id, cid, state,
            title,
            startDate, endDate, ingCheck,
            startTime, endTime,
            cate,
            partnerInput,
            partners,
            content,
            open, click, load
        } = this.state;
        const { userList } = this.props;
        return (
            <div className="tui-main">

                {
                    !load && <div className="tui-load">
                        <CircularProgress />
                    </div>
                }

                {/* 버튼 영역 */}
                <div className="tui-arrow">
                    <div onClick={this.nextPre.bind(this, false)} className="tui-text">{" < "}&nbsp;이전달</div>
                    <div onClick={this.nextPre.bind(this, true)} className="tui-text">다음달&nbsp;{" > "}</div>
                </div>
                
                {/* 팝업 창 */}
                <Popup 
                    id={id}
                    cid={cid}
                    open={open}
                    title={title}
                    startDate={startDate}
                    endDate={endDate}
                    startTime={startTime}
                    endTime={endTime}
                    ingCheck={ingCheck}
                    cate={cate}
                    partnerInput={partnerInput}
                    partnerList={userList}
                    partners={partners}
                    content={content}
                    onChangeCheck={this.onChangeCheck.bind(this)}
                    onChange={this.onChange.bind(this)}
                    cateChange={this.cateChange.bind(this)}
                    onChangeDate={this.onChangeDate.bind(this)}
                    onRemovePartner={this.onRemovePartner.bind(this)}
                    onAddPartner={this.onAddPartner.bind(this)}
                    create={this.create.bind(this)}
                    update={this.update.bind(this)}
                    close={this.close.bind(this)} 
                />

                {/* 확인창 */}
                <Confirm 
                    id={id}
                    cid={cid}
                    state={state}
                    click={click}
                    title={title}
                    startDate={startDate}
                    endDate={endDate}
                    startTime={startTime}
                    endTime={endTime}
                    cate={cate}
                    partners={partners}
                    content={content}
                    openChange={this.openChange.bind(this)}
                    deleted={this.deleted.bind(this)}
                    close={this.close.bind(this)} 
                />

                {/* 캘린더 영역 */}
                <Calendar 
                    height="610px"
                    ref={this.calendarRef}
                    disableDblClick={true}
                    disableClick={false}
                    isReadOnly={false}
                    schedules={resultData}
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
                    onBeforeCreateSchedule={this.open.bind(this)}
                    onBeforeUpdateSchedule={this.drag.bind(this)}
                    onClickSchedule={this.itemClick.bind(this)}
                />
            </div>
        );
    }
}
 
export default Tui;