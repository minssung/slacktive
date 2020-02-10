import React from 'react';
import Clock from 'react-live-clock';
import axios from 'axios';
import Dashboard from './Dashboard/Dashboard';
import moment from 'moment';

class Slack_Dashboard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            // token state
            tokenexpire : "",
            // user info
            userinfo : [],
            userprofile : [],
            // users list - state
            usersalldb : [],
            statearray : ['대기','출근','외근','지각','휴가'],
        }
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // user Token verify & Mount & axios
    async componentDidMount(){
        const usertoken = await this.usersTokenChecked();
        if(usertoken !== null){
            await this.userInfoApi(usertoken);   // user Info Api
            await this.userListApi();   // user List Api
            await this.holidayApi(usertoken);    // holiday Api
        } else {
            window.location.href = "/";
        }
    }
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
                console.log("dashboard jwt token verify err : tokenExpired -> remove token");
                localStorage.removeItem("usertoken");
                await this.setState({ tokenexpire : "off" });
                return null;
            }
            console.log("jwt token verifyed result : " + result.data.userid);
            await this.setState({ tokenexpire : "on" });
            return result.data.userid;
        } catch(err){
            console.log("dashboard jwt token verify err : " + err);
        }
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // user Info Api & Render
    async userInfoApi(usertoken){
        try {
            const userdb = await axios.get(`http://localhost:5000/user/one?userid=${usertoken}`);
            const result = await axios.post("http://localhost:5000/slackapi/usersInfo",{
                p_token : userdb.data.p_token,
                user : userdb.data.id
            });
            await this.setState({
                userinfo : result.data,
                userprofile : result.data.profile
            })
        } catch(err) {
            console.log("user Info Lookup err : " + err);
        }
    }
    userInfoContents(){
        const { userinfo,userprofile } = this.state;
        return <div className="slack-dash">
            {userinfo.id}<br></br>
            {userinfo.name}<br></br>
            {userinfo.r_name}<br></br>
            {userprofile.phone}<br></br>
            {userprofile.email}<br></br>
        </div>
    }
    // user List Api & Render
    async userListApi(){
        try {
            const result = await axios.get(`http://localhost:5000/user/all`);
            await this.setState({
                usersalldb : result.data
            });
        } catch(err){
            console.log("user List Api err : " + err);
        }
    }
    userListContents(){
        const { usersalldb, statearray } = this.state;
        return <div className="slack-dash-userlistdiv">
            {
                statearray.map((dataS,i)=>{
                    return <div key={i} className="slack-dash-userlist-cate">
                        <span>{dataS}</span>
                        {
                            usersalldb.map((dataU, j)=>{
                                return <span key={j}>
                                    {
                                        dataU.state === dataS &&
                                        dataU.username
                                    }
                                </span>
                            })
                        }
                    </div>
                })
            }
        </div>
    }
    // clock Api & Render
    clockContents() {
        return <span>
            <Clock format={'YYYY년 MM월 DD일'} ticking={true} timezone={'Asia/Seoul'} /><br></br>
            <Clock format={'HH:mm:ss'} ticking={true} timezone={'Asia/Seoul'} />
        </span>
    }
    // hoilday Api & Render
    async holidayApi(usertoken){
        try {
            //const userdb = await axios.get(`http://localhost:5000/user/one?userid=${usertoken}`);
        } catch(err){
            console.log("holiday Api err : " + err);
        }
    }
    holidayContents(){
        return <span>
            다가오는 휴가 : 0000년 00월 00일 [ 휴가/반차 ]
        </span>
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // rendering
    render () {
        const { tokenexpire } = this.state
        return (
            <div className="slack-mainDiv">
                <div className="slack-dashboardDiv">
                    <span className="tokenprops">{this.props.tokenstate(tokenexpire)}</span>
                    <Dashboard contents={this.clockContents.bind(this)}/>
                    <Dashboard contents={this.userInfoContents.bind(this)}/>
                    <Dashboard contents={this.userListContents.bind(this)}/>
                    <Dashboard contents={this.holidayContents.bind(this)}/>
                </div>
            </div>
        );
    }
}

export default Slack_Dashboard;