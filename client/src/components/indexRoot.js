import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import SlackLoginBtn from './loginPage/js/SlackLoginBtn';
import TuiCalendar from './mainPage/js/TuiCalendar';
import SlackDash from './mainPage/js/Slack_Dashboard';
import Mypage from './myPage/js/mypage';

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
            preColor : "#ff0000",
        }
        this.tag = React.createRef();
        this.color = React.createRef();
        this.prvCh = React.createRef();
    }

    async componentDidMount(){
        if(localStorage.getItem("usertoken")){
            try {
                await this.setState({
                    usertoken : await this.usersTokenChecked()
                });

                // API 동시 호출을 위한 Promiss.all 패턴
                const promiseArray = [this.usernameCheck(), this.onWorkTimeCheck(), this.tardyUser(), this.vacationUser()];
                Promise.all(promiseArray).then((values) => {
                    this.setState({
                        username: values[0],
                        onWorkTime: values[1],
                        tardyUser: values[2],
                        vacationUser: values[3]
                    })
                }, (err) => {
                    console.log("promise all err : " + err);
                })
                const userOne = await axios.get(`http://localhost:5000/user/one?userid=${this.state.usertoken}`);
                if(!userOne.data.usertag){
                    await this.setState({
                        userinfoSet : false
                    })
                } else {
                    await this.setState({
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
        const result = await axios.get('http://localhost:5000/user/tardyall');
        const userCheck = result.data;
        const tardyArray = userCheck.map((data) => {
            return data.username
        })
        const newArray = tardyArray.join(', ');
        return newArray
    }

    // 휴가자 체크
    async vacationUser() {
        const result = await axios.get('http://localhost:5000/user/vacationall');
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
        const userCheck = await axios.get(`http://localhost:5000/user/one?userid=${usertoken}`);
        return userCheck.data.username
    }

    // 유저 마지막 출근 시간 확인
    async onWorkTimeCheck() {
        const usertoken = this.state.usertoken;
        const TimeCheck = await axios.get(`http://localhost:5000/slack/onworktime?userid=${usertoken}`);
        const time = (TimeCheck.data.time).substring(11, 16);
        const timeArray = time.split(':');
        const editTime = timeArray[0]+'시 '+timeArray[1]+'분';
        
        // 마지막 출근 기록에 지각이 아닌 출근으로 저장되어 있을 경우
        // 슬랙에 출근을 늦게 입력했을 때를 위해
        // 문제점 : 아래 정규식 처리과정에서 시, 분 모두 처리할 경우 시 만 처리하는 부분에서 에러가 발생. ( 예외처리하여 실질적 문제는 없음 )
        // 의문점 : Promise.all 패턴으로 하면 조건에 안맞더라도 무조건 순서대로 처리하는가?
        if (TimeCheck.data.state === '출근') {
            // 시 만 입력 되었을 때
            try {
                if (TimeCheck.data.text === (/(\d*시)\s*(출근|ㅊㄱ|퇴근|ㅌㄱ)/.exec(TimeCheck.data.text))[0]) {
                    const time = (TimeCheck.data.text)
                    const timeArray = time.split(' ');
                    const editTime = timeArray[0];
                    return editTime
                }
            } catch (err) {
                console.log(err);
            }
            // 시, 분 모두 입력되었을 때
            try {
                if (TimeCheck.data.text === (/(\d*시)\s*(\d*분)\s*(출근|ㅊㄱ|퇴근|ㅌㄱ)/.exec(TimeCheck.data.text))[0]) {
                    const time = (TimeCheck.data.text)
                    const timeArray = time.split(' ');
                    const editTime = timeArray[0] + ' ' + timeArray[1];
                    return editTime
                }
            } catch (err) {
                console.log(err);
            }
        }
        return editTime
    }

    // 유저 토큰 확인
    async usersTokenChecked(){
        if(localStorage.getItem("usertoken")){
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

    bgBtn_1() {
        this.setState({ bgcolor : 'bg_1' })
    };

    bgBtn_2() {
        this.setState({ bgcolor : 'bg_2' })
    };

    bgBtn_3() {
        this.setState({ bgcolor : 'bg_3' })
    };

    bgBtn_4() {
        this.setState({ bgcolor : 'bg_4' })
    };

    // 유저 정보 등록
    async clickUserInfoSave() {
        if(!this.tag.current.value) {
            alert("부서를 선택하세요.")
            return;
        }
        if(!this.color.current.value) {
            alert("색상을 선택하세요.")
            return;
        }
        if(!this.prvCh.current.value) {
            alert("개인 슬랙 채널 ID를 입력하세요.")
            return;
        }
        try {
            await axios.put("http://localhost:5000/user/update",{
                userid : this.state.usertoken,
                usertag : this.tag.current.value,
                usercolor : this.color.current.value,
                userchannel : this.prvCh.current.value,
            });
            console.log("user info set success : " + this.color.current.value, this.tag.current.value, this.state.usertoken, this.prvCh.current.value)
            await this.setState({
                userinfoSet : true,
            })
            window.location.href = "/"
        } catch(err) {
            console.log("user Info set err : " + err);
        }
    }
    // 컬러 및 채널 아이디 입력 인풋 변경 감지용  
    async inputChange(e) {
        if(e.target.name === "color"){
            this.setState({
                preColor : e.target.value,
            })
        } else {
            this.setState({
                prvCh : e.target.value,
            })
        }
    }
    render() {
        const { usertoken, userinfoSet, preColor, username, onWorkTime, tardyUser, vacationUser, bgcolor, prvCh } = this.state;
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
                                        <Link to="/" onClick={this.bgBtn_1.bind(this)}>
                                            <img src="img/Menu1.png" className="main-menu-1" alt="Calendar"/>
                                        </Link>
                                        <Link to="/my" onClick={this.bgBtn_2.bind(this)}>
                                            <img src="img/Menu2.png" className="main-menu-2" alt="My"/>
                                        </Link>
                                        <Link to="/cedar" onClick={this.bgBtn_3.bind(this)}>
                                            <img src="img/Menu3.png" className="main-menu-3" alt="Cedar"/>
                                        </Link>
                                        <Link to="/etc" onClick={this.bgBtn_4.bind(this)}>
                                            <img src="img/Menu4.png" className="main-menu-4" alt="Etc"/>
                                        </Link>
                                    </div>
                                    <div className="vertical"></div>
                                    <div className="app-rightDiv">
                                        <Route exact path="/">
                                        {
                                            !userinfoSet &&
                                            <div className="app-userInfoDiv">
                                                <div className="app-userInfo">
                                                    <div className="userInfo-colorDiv">
                                                        <span className="userInfo-colorText">당신의 일정에 표시할 색을 선택하세요.</span>
                                                        <input type="color" name="color" ref={this.color} onChange={this.inputChange.bind(this)} value={preColor} className="userInfo-colorInput"></input>
                                                    </div>
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
                                                {onWorkTime}에 출근하셨네요
                                            </div>
                                            <div className="design">
                                                <img className="cloud_1" src="img/cloud.png" alt="cloud_1"/>
                                                <img className="cloud_2" src="img/cloud2.png" alt="cloud_2"/>
                                                <img className="cloud_3" src="img/cloud3.png" alt="cloud_3"/>
                                                <img className="task" src="img/developer.png" alt="task"></img>
                                            </div>
                                            <div className="people">
                                                <span className="tardy">지각자&nbsp;&nbsp;&nbsp;{tardyUser}</span>
                                                <span className="vacation">휴가자&nbsp;&nbsp;&nbsp;{vacationUser}</span>
                                            </div>
                                            <TuiCalendar Token={usertoken}/>
                                            <div className="app-dash">
                                                <SlackDash Token={usertoken}></SlackDash>
                                            </div>
                                        </Route>
                                        <Route path="/my"><Mypage Token={usertoken}></Mypage></Route>
                                        <Route path="/cedar"></Route>
                                        <Route path="/etc"></Route>
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