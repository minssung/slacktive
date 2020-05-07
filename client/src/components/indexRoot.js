import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import SlackLoginBtn from './loginPage/js/SlackLoginBtn';
import TuiCalendar from './mainPage/js/TuiCalendar';
import SlackDash from './mainPage/js/Slack_Dashboard';
import Mypage from './myPage/js/mypage';
import Employee from './cedarPage/Employee';
import moment from 'moment';

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../devClient_config') : configs = require('../client_config');

class IndexRoot extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            usertoken : this.usersTokenChecked(),
            username : '',
            onWorkTime : '',
            vacationUser : [],
            bgcolor: 'bg_1',
            userinfoSet : true, // 사용자 추가 설정 여부
            userinfo : {
                color : "", // 사용자 컬러
                tag : "",   // 사용자 부서
                prvCh : "", // 사용자 채널
            },
            task : '',
            dashDb : [],
        }
        this.tag = React.createRef();
        this.color = React.createRef();
        this.prvCh = React.createRef();
    }

    async componentDidMount() {
        let pathname = "";
        switch(window.location.pathname) {
            case "/" : pathname = "bg_1"; break;
            case "/my" : pathname = "bg_2"; break;
            case "/cedar" : pathname = "bg_3"; break;
            case "/etc" : pathname = "bg_4"; break;
            default : break;
        }
        this.setState({ bgcolor : pathname });
        if(localStorage.getItem("usertoken")) {
            try {
                await this.setState({
                    usertoken : await this.usersTokenChecked()
                });
                // API 동시 호출을 위한 Promiss.all 패턴
                const promiseArray = [this.usernameCheck(), this.onWorkTimeCheck(), this.tardyUser(), this.vacationUser()];
                await Promise.all(promiseArray).then((values) => {
                    this.setState({
                        username: values[0],
                        onWorkTime: values[1],
                        tardyUser: values[2],
                        vacationUser: values[3]
                    })
                }, (err) => {
                    console.log("indexRoot promise all err : " + err);
                })
                const userOne = await axios.get(`${configs.domain}/user/one?userid=${this.state.usertoken}`);
                if(!userOne.data.usertag){
                    this.setState({
                        userinfoSet : false
                    })
                } else {
                    this.setState({
                        userinfoSet : true
                    })
                }
            } catch (err){
                console.log("usertoken create or userinfo err : " + err)
            }
            
        }
    }

    // 지각자 체크
    async tardyUser() {
        const result = await axios.get(configs.domain+"/user/tardyall");
        const userCheck = result.data;
        const tardyArray = userCheck.map((data) => {
            return data.username
        })
        const newArray = tardyArray.join(', ');
        return newArray
    }

    // 휴가자 체크
    async vacationUser() {
        const result = await axios.get(configs.domain+"/user/vacationall");
        const userCheck = result.data;
        const vacationArray = userCheck.map((data) => {
            return data.username
        })
        const newArray = vacationArray.join(', ');
        return newArray
    }

    // 유저 이름 확인
    async usernameCheck() {
        const usertoken = this.state.usertoken;
        const userCheck = await axios.get(`${configs.domain}/user/one?userid=${usertoken}`);
        this.setState({
            task : userCheck.data.usertag
        });
        return userCheck.data.username
    }

    // 유저 마지막 출근 시간 확인
    async onWorkTimeCheck() {
        const usertoken = this.state.usertoken;
        const TimeCheck = await axios.get(`${configs.domain}/slack/onworktime?userid=${usertoken}`);
        let time = (TimeCheck.data.time).substring(11, 16);
        let timeArray = time.split(':');
        let editTime = timeArray[0] + '시 ' + timeArray[1] + '분';
        
        if(moment(TimeCheck.data.time).startOf('day').diff(moment(new Date()).startOf('day'), 'days') !== 0) {
            return null;
        }
        if (TimeCheck.data.state === '출근') {
            time = /^([0-9]{1,})?시?\s*([0-9]{1,})?분?\s*\W*?\s*(출근|ㅊㄱ|퇴근|ㅌㄱ|외근|ㅇㄱ)/.exec(TimeCheck.data.text);
            time.shift();
            editTime = (time[0] ? time[0] : timeArray[0]) + "시 " + (time[1] ? time[1] : timeArray[1]) + "분";
        }
        return editTime;
    }

    // 유저 토큰 확인
    async usersTokenChecked(){
        if(localStorage.getItem("usertoken")){
            try {
                const result = await axios(configs.domain+"/verify",{
                    method : "get",
                    headers : {
                        'content-type' : 'text/json',
                        'x-access-token' : localStorage.getItem("usertoken")
                    }
                });
                if(result.data === "err"){
                    console.log("calendar jwt token verify err : tokenExpired -> remove token");
                    localStorage.removeItem("usertoken");
                    window.location.href = "/"
                    return null;
                }
                return result.data.userid; 
                
            } catch(err){
                console.log("client jwt token verify err : " + err);
            }
        }
        return null;
    }
    // 배경 변경
    bgBtn(num) {
        this.setState({ bgcolor : 'bg_'+num})
    };
    // 유저 정보 등록
    async clickUserInfoSave() {
        if(!this.tag.current.value) {
            alert("부서를 선택하세요.")
            return;
        }
        if(!this.prvCh.current.value) {
            alert("개인 슬랙 채널 ID를 입력하세요.")
            return;
        }
        try {
            await axios.put(configs.domain+"/user/update",{
                userid : this.state.usertoken,
                usertag : this.tag.current.value,
                userchannel : this.prvCh.current.value,
            });
            this.setState({
                userinfoSet : true,
            })
            window.location.href = "/"
        } catch(err) {
            console.log("user Info set err : " + err);
        }
    }
    // 컬러 및 채널 아이디 입력 인풋 변경 감지용  
    inputChange(e) {
        this.setState({
            prvCh : e.target.value,
        })
    }
    // 대시보드에 들어갈 데이터
    changeDashDb(data){
        this.setState({
            dashDb: data
        })
    }
    render() {
        const { usertoken, userinfoSet, username, onWorkTime, tardyUser, vacationUser, bgcolor, prvCh, task, vertical, dashDb } = this.state;
        return (
            <div className="app-firstDiv">
                <Router>
                    <div className="app-mainDiv">
                            {
                            !localStorage.getItem("usertoken") ? 
                            <Route exact path="/"><SlackLoginBtn /></Route> 
                            :
                            <div className={bgcolor}>
                                <div className="app-contentDiv">
                                    <div className="app-leftDiv">
                                        <Link to="/" onClick={this.bgBtn.bind(this,1)}>
                                            <img src="img/Menu1.png" className="main-menu-1" alt="Calendar"/>
                                        </Link>
                                        <Link to="/my" onClick={this.bgBtn.bind(this,2)}>
                                            <img src="img/Menu2.png" className="main-menu-2" alt="My"/>
                                        </Link>
                                        <Link to="/cedar" onClick={this.bgBtn.bind(this,3)}>
                                            <img src="img/Menu3.png" className="main-menu-3" alt="Cedar"/>
                                        </Link>
                                        <Link to="/etc" onClick={this.bgBtn.bind(this,4)}>
                                            <img src="img/Menu4.png" className="main-menu-4" alt="Etc"/>
                                        </Link>
                                    </div>
                                    <div className={vertical}></div>
                                    <div className="vertical"></div>
                                    <div className="app-rightDiv">
                                        <Switch>
                                            <Route exact path="/">
                                                {
                                                    !userinfoSet &&
                                                    <div className="app-userInfoDiv">
                                                        <div className="app-userInfo">
                                                            <div className="userInfo-colorDiv">
                                                                <span className="userInfo-colorText">당신만의 메시지를 받을 슬랙 본인 채널ID를 입력하세요.</span>
                                                                <input type="text" name="prvCh" ref={this.prvCh} onChange={this.inputChange.bind(this)} value={prvCh} className="userInfo-colorInput"></input>
                                                            </div>
                                                            <div className="userInfo-TagDiv">
                                                                <span className="userInfo-TagText">당신의 부서를 선택하세요.</span>
                                                                <select ref={this.tag}>
                                                                    <option>개발팀</option>
                                                                    <option>디자인팀</option>
                                                                    <option>전략기획팀</option>
                                                                </select>
                                                            </div>
                                                            <button className="userInfo-button" type="button" onClick={this.clickUserInfoSave.bind(this)}>
                                                                <span className="userInfo-buttonText">등록</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                }
                                                <div className="intro">
                                                    {username}님, &nbsp;좋은아침!{<br></br>}
                                                    {onWorkTime ? onWorkTime + "에 출근하셨네요" : "아직 출근 전 이시네요"}
                                                </div>
                                                <div className="design">
                                                    <img className="cloud_1" src="img/cloud.png" alt="cloud_1"/>
                                                    <img className="cloud_2" src="img/cloud2.png" alt="cloud_2"/>
                                                    <img className="cloud_3" src="img/cloud3.png" alt="cloud_3"/>
                                                    {
                                                        task === '개발팀' &&
                                                        <img className="task" src="img/developer.png" alt="task"/>
                                                    }
                                                </div>
                                                <div className="people">
                                                    <span className="tardy">지각자&nbsp;&nbsp;&nbsp;{tardyUser}</span>
                                                    <span className="vacation">휴가자&nbsp;&nbsp;&nbsp;{vacationUser}</span>
                                                </div>
                                                <TuiCalendar Token={usertoken} changeDashDb={this.changeDashDb.bind(this)} />
                                                <div className="design_2">
                                                    <img className="zandi" src="img/zandi.png" alt="zandi" />
                                                    <img className="tree" src="img/tree.png" alt="tree" />
                                                    <img className="cat" src="img/cat.png" alt="cat" />
                                                    <img className="Todaycard" src="img/Todaycard.png" alt="Todaycard" />
                                                </div>
                                                <div className="app-dash">
                                                    {
                                                        dashDb[0] ? 
                                                        <SlackDash Token={usertoken} dashData={dashDb}></SlackDash>
                                                        :
                                                        <div className="dash-empty">
                                                            <span className="dash-emptyText">오늘의 일정이 없습니다.</span>
                                                        </div>
                                                    }
                                                </div>
                                            </Route>
                                            <Route path="/my"><Mypage Token={usertoken}></Mypage></Route>
                                            <Route path="/cedar"><Employee Token={usertoken}></Employee></Route>
                                            <Route path="/etc"></Route>
                                        </Switch>
                                    </div>
                                </div>
                            </div>
                            }
                    </div>
                </Router>
            </div>
        );
    }
}

export default IndexRoot;
