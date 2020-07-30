import React, { Component } from 'react';

// modules
import axios from 'axios';
import moment from 'moment';
import { BrowserRouter as Router, Route, Switch  } from 'react-router-dom';

// css
import '../css/layout.css'
import '../css/mypage.css';
import '../css/login.css';
import '../css/main.css';
import '../css/tui.css';
import '../css/grouppage.css';
import '../css/etc.css';
import '../css/popup.css';
import '../css/confirm.css';
import '../css/mypopup.css';

// layout
import NotFound from './notFound';
import Leftmenu from './leftmenu';

// page
import Login from '../page/login/login';
import Main from '../page/main/main';
import Mypage from '../page/mypage/mypage';
import Grouppage from '../page/grouppage/grouppage';
import Etc from '../page/etcpage/etc';

// config
let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../devClient_config') : configs = require('../../client_config');

class Base extends Component {
    constructor(props) {
        // 초기 urll에 따라 사이드 메뉴의 선택지와 배경색의 변경
        let url = new URL(window.location);
        url = url.pathname.split("/");
        url = url[1];
        let backgound = null;
        let bar = "0";
        switch(url) {
            case "" : bar = "0"; backgound = { top : "#94d0f2", bottom : "#7ea4ef" }; break;
            case "mypage" : bar = "1"; backgound = { top : "#d3968e", bottom : "#6879d0" }; break;
            case "grouppage" : bar = "2"; backgound = { top : "#bca8c3", bottom : "#266197" }; break;
            case "etc" : bar = "3"; backgound = { top : "#4e4376", bottom : "#2b5876" }; break;
            default: backgound = { top : "#94d0f2", bottom : "#7ea4ef" }; break;           
        }
        super(props);
        this.state = {
            user : null,    // 초기 사용자 로그인 데이터
            userList : [],    // 초기 유저 목록 데이터

            holidayHistoryData : [],
            holidayAdd : 0,
            holidayUse : 0,

            tardyCount : [],
            attenAvg : [],
            attenCount : [],
            overTimeCount : [],

            backgound,  // 전체 배경색
            bar,    // 사이드 메뉴의 테두리

            load : false,
            aa : false,

            container : [],     // 초기 직원 데이터
            attenTime : null,   // 출근 시간
            special : null,     // 지각자, 휴가자 객체
            todayCard : [],     // 오늘의 카드
        }
    }

    // 처음 로드할 시에 로컬 스토리지에 로그인 데이터가 있다면, 유저에 데이터 입력 없거나 에러 시 로컬 스토리지 삭제
    async componentDidMount() {
        try {
            if(localStorage.getItem("slacklogin")) {
                // 토큰 조회
                let result = axios(configs.domain+"/verify",{
                    method : "get",
                    headers : {
                        'content-type' : 'text/json',
                        'x-access-token' : localStorage.getItem("slacklogin")
                    }
                });

                // 사용자 전체 조회
                let users = axios.get(`${configs.domain}/user/all`);
                
                await Promise.all([result, users]).then(data => {
                    result = data[0].data;
                    users = data[1].data;
                });

                // 토큰 만료시
                if(result === "err") {
                    localStorage.removeItem("slacklogin");
                    alert("로그인 시간이 만료되었습니다. 재로그인 해주세요.");
                    window.location.href = "/";
                }

                // 입력용 날짜값
                let toYear = moment(new Date()).format("YYYY");
                let preYear = moment(new Date()).subtract(1, 'year').format("YYYY");
                let toMonth = moment(new Date()).format("YYYY-MM");

                // 사용자 정보
                let userInfo = axios.get(`${configs.domain}/user/one?userid=${result.userid}`);

                // 휴가 내역
                let holidayHistory = axios.get(`${configs.domain}/holiday/gettime?textTime=${toYear}&userId=${result.userid}`);

                // 옵션 값
                let attenData = axios.get(`${configs.domain}/slack/userall?preTime=${preYear}&toTime=${toYear}&userId=${result.userid}&state=${"출근"}`)
                let tardyData = axios.get(`${configs.domain}/slack/monthall?state=${"지각"}&userId=${result.userid}`)
                let overTimeData = axios.get(`${configs.domain}/slack/userall?preTime=${preYear}&toTime=${toYear}&userId=${result.userid}&state=${"야근"}`)
                let overTimeMonth = axios.get(`${configs.domain}/slack/monthall?state=${"야근"}&userId=${result.userid}`)
                let attenDataMonth = axios.get(`${configs.domain}/slack/monthall?state=${"출근"}&userId=${result.userid}`)
                let avgToTime = axios.get(`${configs.domain}/slack/avgtime?userId=${result.userid}&time=${toMonth}`)

                await Promise.all([userInfo, holidayHistory, attenData, tardyData, overTimeData, attenDataMonth, avgToTime, overTimeMonth]).then(data => {
                    userInfo = data[0].data;
                    holidayHistory = data[1].data;
                    attenData = data[2].data;
                    tardyData = data[3].data;
                    overTimeData = data[4].data;
                    attenDataMonth = data[5].data;
                    avgToTime = data[6].data;
                    overTimeMonth = data[7].data;
                });

                // 출근 일수
                attenData = attenData.map(data => {
                    return {
                        id : data.id,
                        text : data.text,
                        state : data.state,
                        time : moment(data.time).format("YYYY-MM-DD") + " " + data.textTime,
                        ts : data.ts,
                    }
                });

                // 평균 출근 시간 변환
                let filterTime_to = avgToTime.split(":");
                let toSplit = filterTime_to && filterTime_to[0] + filterTime_to[1];
                toSplit = moment(toSplit, "hmm").format("HH시 mm분")

                let addCount = 0;
                let useCount = 0.0;

                // 대휴 및 휴가 사용량
                holidayHistory.forEach(data => {
                    if(/반차/.test(data.cate)) useCount += 0.5;
                    if(/휴가/.test(data.cate)) useCount += 1.0;
                    if(/대휴/.test(data.cate)) {
                        addCount += 1.0;
                        useCount += 1.0;
                    }
                });

                // 이번달 연차 사용량
                let historyCount = 0.0;
                holidayHistory.forEach(data => {
                    let days = moment(new Date()).format("YYYY-MM");
                    let reg = new RegExp(`${days}`);
                    if(reg.test(data.textTime[0].startDate)) {
                        if(/반차/.test(data.cate)) {
                            historyCount += 0.5;
                        } else if(/휴가/.test(data.cate)) {
                            historyCount += 1;
                        }
                    }
                });

                // 모든 값 적용
                this.setState({ userList : users });
                this.setState({ user : {
                        userid : result.userid,
                        username : userInfo.username,
                        usertag : userInfo.usertag,
                        p_token : userInfo.p_token,
                        userchannel : userInfo.userchannel,
                        holidaycount : userInfo.holidaycount,
                    }, 
                    holidayHistoryData : holidayHistory,    // 휴가 내역
                    tardyCount : { 
                        row : tardyData.reverse() || [], 
                        to : tardyData ? tardyData[0] ? tardyData[tardyData.length -1].state || null : null : null, 
                        pre : tardyData ? tardyData[0] ? tardyData[tardyData.length -2].state || null : null : null ,
                        title : "지각 횟수",
                        text : "지각 횟수",
                    }, 
                    attenAvg : { 
                        to : toSplit || null, 
                        pre : null, 
                        row : attenData.reverse() || [],
                        title : "출근 시간 내역",
                        text : "출근 시각",
                    },
                    attenCount : { 
                        row : attenDataMonth.reverse() || [], 
                        to : attenDataMonth ? attenDataMonth[0] ? attenDataMonth[attenDataMonth.length -1].state : null : null,
                        pre : historyCount || null,
                        title : "출근 일수",
                        text : "출근 일수",
                    }, 
                    overTimeCount : { 
                        to : overTimeMonth ? overTimeMonth[0] ? overTimeMonth[overTimeMonth.length -1].state : null : null,  
                        pre : overTimeMonth ? overTimeMonth[overTimeMonth.length -2] || null : null, 
                        row :overTimeData.reverse() || [],
                        title : "야근 내역",
                        text : "초과 근무시간",
                    },
                    holidayAdd : addCount,
                    holidayUse : useCount,
                });

                // 직원 정보 호출
                const employee = await axios.post(configs.domain+"/employee/status");
                this.setState({ container: employee.data });

                // 출근 시간 체크
                const attenTime = await axios.post(configs.domain+"/slack/onworktime", {userid : this.state.user.userid});
                let timeArray =  attenTime.data.textTime.split(':');
                let editTime = timeArray[0] + '시 ' + timeArray[1] + '분';
                if (timeArray[1] === '00') editTime = timeArray[0] + '시';
                else if (timeArray[1].substring(0, 1) === '0') editTime = timeArray[0] + '시 ' + timeArray[1].substring(1, 2) + '분';
                this.setState({ attenTime : editTime });

                // 휴가 상태 처리
                await axios.get(configs.domain+"/holiday/alltime");

                // 지각자 체크
                const tardyApi = await axios.get(configs.domain+`/user/stateall?state=${'지각'}`);
                const tardyArray = tardyApi.data.map( data => data.username );
                const newTardyArray = tardyArray.join(', ');

                // 휴가자 체크
                const holidayCheckApi = await axios.get(configs.domain+`/user/stateall?state=${'휴가'}`);
                const holidayArray = holidayCheckApi.data.map( data => data.username );
                const newHolidayArray = holidayArray.join(', ');
                this.setState({ special : {
                    tardyList : newTardyArray,
                    holidayList : newHolidayArray
                } });

                // 오늘의 카드에 들어갈 일정 데이터
                const todayCardApi = await axios.get(configs.domain+`/generals/alltime?startDate=${moment().format('MM/DD')}`);
                this.setState({ todayCard : todayCardApi.data });
            }
        } catch(err) {
            console.log("first mount err : ", err);
            localStorage.removeItem("slacklogin");
            alert("에러가 발생했습니다. 다시 시도해 주세요.");
        }
        this.setState({ load : true });
    }

    // 배경색을 사이드 메뉴 누를 시에 변경
    backgoundChange(top, bottom, num) { this.setState({ backgound : { top, bottom }, bar : num }); }

    async resetTodayCard() {
        const todayCardApi = await axios.get(configs.domain+`/generals/alltime?startDate=${moment().format('MM/DD')}`);
        this.setState({ todayCard : todayCardApi.data });
    }

    render() { 
        const { backgound, bar, load, 
            user, userList, container, holidayHistoryData, attenTime, special, todayCard,
            tardyCount, attenAvg, attenCount, overTimeCount, holidayAdd, holidayUse
        } = this.state;
        return (
            <div className="base-main" style={user ? {backgroundImage:`linear-gradient(to top, ${backgound.top}, ${backgound.bottom}`} : {}}>
                <Router>
                    { user ? <Leftmenu bar={bar} backgoundChange={this.backgoundChange.bind(this)} /> : "" }
                    {
                        load ? 
                        <div className="base-right">
                            <Switch>
                                {/* 초기 유저 데이터가 없을 시 로그인 화면, 있다면 메인 페이지부터 시작  */}
                                <Route exact path="/" render={() => user ? <Main resetTodayCard={this.resetTodayCard.bind(this)} userList={userList} user={user} attenTime={attenTime} special={special} todayCard={todayCard} />  : <Login />} />
                                <Route path="/mypage" render={() => user ? <Mypage holidayAdd={holidayAdd} holidayUse={holidayUse} overTimeCount={overTimeCount} attenCount={attenCount} attenAvg={attenAvg} tardyCount={tardyCount} user={user} holidayHistoryData={holidayHistoryData} /> : <Login />} />
                                <Route path="/grouppage" render={() => user ? <Grouppage user={user} container={container} /> : <Login />} />
                                <Route path="/etc" render={() => user ? <Etc user={user} /> : <Login />} />

                                {/* 비로그인 상태에서 잘못된 주소 접근 시 처리 - not found */}
                                <Route render={() => user ? <Main resetTodayCard={this.resetTodayCard.bind(this)} userList={userList} user={user} attenTime={attenTime} special={special} todayCard={todayCard} /> : load ? <NotFound /> : "" } />
                            </Switch>
                        </div>
                        :
                        <div className="base-right"></div>
                    }
                </Router>
            </div>
        )
    }
}
 
export default Base;