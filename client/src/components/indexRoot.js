import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import SlackLoginBtn from './loginPage/js/SlackLoginBtn';
import TuiCalendar from './mainPage/js/TuiCalendar';
import SlackDash from './mainPage/js/Slack_Dashboard';
import Mypage from './myPage/js/mypage'

class IndexRoot extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            usertoken : this.usersTokenChecked(),
            userinfoSet : true,
            userinfo : {
                color : "",
                tag : "",
            },
            preColor : "#ff0000",
        }
        this.tag = React.createRef();
        this.color = React.createRef();
    }
    async componentDidMount(){
        if(localStorage.getItem("usertoken")){
            try {
                await this.setState({
                    usertoken : await this.usersTokenChecked()
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
    // 유저 정보 등록
    async clickUserInfoSave() {
        try {
            await axios.put("http://localhost:5000/user/update",{
                userid : this.state.usertoken,
                usertag : this.tag.current.value,
                usercolor : this.color.current.value,
            });
            console.log("user info set success : " + this.color.current.value, this.tag.current.value, this.state.usertoken)
            await this.setState({
                userinfoSet : true,
            })
            window.location.href = "/"
        } catch(err) {
            console.log("user Info set err : " + err);
        }
    }
    // 컬러 변경 여부 체크용    
    async colorChange(e) {
        this.setState({
            preColor : e.target.value,
        })
    }
    render() {
        const { usertoken,userinfoSet,preColor } = this.state;
        return (
            <div className="app-firstDiv">
                <Router>
                    <div className="app-mainDiv">
                            {
                            !localStorage.getItem("usertoken") ? 
                            <Route exact path="/"><SlackLoginBtn /></Route> 
                            :
                            <div className="app-contentDiv">
                                <div className="app-leftDiv">
                                    <Link to="/">Calendar</Link>
                                    <Link to="/my">my</Link>
                                    <Link to="/cedar">Cedar</Link>
                                    <Link to="/etc">...</Link>
                                </div>
                                <div className="app-rightDiv">
                                    <Route exact path="/">
                                        {
                                            !userinfoSet &&
                                            <div className="app-userInfoDiv">
                                                <div className="app-userInfo">
                                                    <div className="userInfo-colorDiv">
                                                        <span className="userInfo-colorText">당신의 일정에 표시할 색을 선택하세요.</span>
                                                        <input type="color" ref={this.color} onChange={this.colorChange.bind(this)} value={preColor} className="userInfo-colorInput"></input>
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
                            }
                    </div>
                </Router>
            </div>
        );
    }
}

export default IndexRoot;