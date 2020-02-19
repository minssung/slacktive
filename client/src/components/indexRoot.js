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
        }
    }
    async componentDidMount(){
        if(localStorage.getItem("usertoken")){
            try {
                await this.setState({
                    usertoken : await this.usersTokenChecked()
                })
            } catch (err){
                console.log("usertoken create err : " + err)
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
    render() {
        const { usertoken } = this.state;
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