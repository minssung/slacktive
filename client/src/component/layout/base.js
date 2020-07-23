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
            userList : null,    // 초기 유저 목록 데이터

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
                let result = axios(configs.domain+"/verify",{
                    method : "get",
                    headers : {
                        'content-type' : 'text/json',
                        'x-access-token' : localStorage.getItem("slacklogin")
                    }
                });

                let users = axios.get(`${configs.domain}/user/all`);
                
                await Promise.all([result, users]).then(data => {
                    result = data[0].data;
                    users = data[1].data;
                })

                const userInfo = await axios.get(`${configs.domain}/user/one?userid=${result.userid}`)
                

                this.setState({ userList : users });
                this.setState({ user : {
                    userid : result.userid,
                    username : userInfo.data.username,
                    p_token : userInfo.data.p_token,
                    userchannel : userInfo.data.userchannel,
                } });

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

                // 지각자 체크
                const tardyApi = await axios.get(configs.domain+`/user/stateall?state=${'지각'}`);
                const tardyArray = tardyApi.data.map( data => data.username );
                const newTardyArray = tardyArray.join(', ');

                // 휴가자 체크
                const holidayApi = await axios.get(configs.domain+`/user/stateall?state=${'휴가'}`);
                const holidayArray = holidayApi.data.map( data => data.username );
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

    render() { 
        const { user, backgound, bar, load, userList, container, attenTime, special, todayCard } = this.state;
        return load ? (
            <div className="base-main" style={user ? {backgroundImage:`linear-gradient(to top, ${backgound.top}, ${backgound.bottom}`} : {}}>
                <Router>
                    { user ? <Leftmenu bar={bar} backgoundChange={this.backgoundChange.bind(this)} /> : "" }
                    <div className="base-right">
                        <Switch>
                            {/* 초기 유저 데이터가 없을 시 로그인 화면, 있다면 메인 페이지부터 시작  */}
                            <Route exact path="/" render={() => user ? <Main userList={userList} user={user} attenTime={attenTime} special={special} todayCard={todayCard} />  : <Login />} />
                            <Route path="/mypage" render={() => user ? <Mypage user={user} /> : <Login />} />
                            <Route path="/grouppage" render={() => user ? <Grouppage user={user} container={container} /> : <Login />} />
                            <Route path="/etc" render={() => user ? <Etc user={user} /> : <Login />} />

                            {/* 비로그인 상태에서 잘못된 주소 접근 시 처리 - not found */}
                            <Route render={() => user ? <Main userList={userList} user={user} /> : load ? <NotFound /> : "" } />
                        </Switch>
                    </div>
                </Router>
            </div>
        ) : <div></div>
    }
}
 
export default Base;