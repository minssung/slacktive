import React from 'react';
import axios from 'axios';
import Dashboard from './Dashboard/Dashboard';
import moment from 'moment';
import loadMask from '../../../resource/loadmaskTest.gif'

class SlackDashboard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            // users list - state
            usersalldb : [],
            usertoken : [],
            // time contents
            //todayTimes : "",
            // load mask
            loading : "",
            // caeldnar  % general db
            dashDb : [],
            // today date
            toDate : new Date(),
        }
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- user Token verify & Mount & axios ---------- 
    async componentDidMount(){
        await this.setState({
            usertoken : await this.props.Token
        })
        await this.userListApi();   // user List Api
        await this.dashDbApi();     // cal & gnr Api
        this.setState({
            loading : "Loading",
        })
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- user List Api ----------
    async userListApi(){
        try {
            const result = await axios.get(`http://localhost:5000/user/all`);
            this.setState({
                usersalldb : result.data,
            });
            
        } catch(err){
            console.log("user List Api err : " + err);
        }
    }
    // ---------- calendar / general Api & Render----------
    async dashDbApi() {
        try {
            const result = await axios.get("http://localhost:5000/updatState");
            await this.setState({ dashDb : result.data })
        } catch(err) {
            console.log("calendar api err : " + err);
        }
    }
    dataTextTime(time) {
        let userTime
        let dayArr = [];
        if(/~/.test(time)) {
            dayArr = time.split("~")
            if(moment(dayArr[1]).diff(dayArr[0], "days") === 0) {
                dayArr[0] = moment(moment(dayArr[0], "YYYY-MM-DD")).format("M. D(ddd)")
                userTime = dayArr[0]
            } else {
                dayArr[0] = moment(moment(dayArr[0], "YYYY-MM-DD")).format("M. D(ddd)~")
                dayArr[1] = moment(moment(dayArr[1], "YYYY-MM-DD")).format("M. D(ddd)")
                userTime = dayArr[0] + dayArr[1]
            }
        } else if(/,/.test(time)) {
            dayArr = /\d{4}-\d{2}-(\d{2}(,?\d{2}?)+)/.exec(time);
            userTime = dayArr[1];
        } else {
            userTime = moment(time).format("M. D(ddd)")
        }
        return userTime;
    }
    dataStateSwich(state) {
        let userState = "";
        switch(state) {
            case "휴가관련" : userState = "gold"; break;
            case "출장 / 미팅" : userState = "greenyellow"; break;
            case "회의" : userState = "turquoise"; break;
            case "생일" : userState = "violet"; break;
            case "기타" : userState = "thistle"; break;
        }
        return userState;
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- rendering ---------- 
    render () {
        const { loading,dashDb } = this.state;
        return (
            <div className="dash-boardDiv">
                {
                    !loading && <div className="loadMaskDiv">
                        <img alt="Logind~" src={loadMask} className="loadMask"></img>
                    </div>
                }
                {
                    dashDb.map((data,i)=>{
                        return <Dashboard key={i}
                            title={data.title ? data.title : data.user.username + " " + data.cate}
                            partner={data.partner[0] ? data.user.username + "," + data.partner.map((data,i)=>{ return data.username }) : data.user.username}
                            textTime={this.dataTextTime.bind(this,data.time)}
                            color={this.dataStateSwich.bind(this,data.state)}
                        />
                    })
                }
            </div>
        );
    }
}

export default SlackDashboard;