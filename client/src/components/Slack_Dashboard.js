import React from 'react';
import axios from 'axios';
import Dashboard from './Dashboard/Dashboard';
import './css/Contents.css';
const moment = require('moment');

class Slack_Dashboard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            // users list - state
            usersalldb : [],
            usertoken : [],
            // time contents
            todayTimes : "",
        }
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- user Token verify & Mount & axios ---------- 
    async componentDidMount(){
        await this.clockBtnApi();
        await this.setState({
            usertoken : await this.usersTokenChecked()
        })
        const { usertoken } = this.state;
        if(usertoken !== null){
            await this.userListApi();   // user List Api
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
            return result.data.userid;
        } catch(err){
            console.log("dashboard jwt token verify err : " + err);
        }
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- user List Api & Render----------
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
    usersListBoard(spanText){
        const { usersalldb } = this.state;
        return <div className="slack-dash">
            <span>{spanText}</span>
            {
                usersalldb.map((data,i)=>{
                    return <span key={i}>
                        {
                            data.state === spanText && data.username
                        }
                    </span>
                })
            }
        </div>
    }
    // ---------- clock Api & Render ----------
    async clockBtnApi() {
        try {
            const result = await axios.get("http://localhost:5000/updateHistorys");
            await this.setState({
                todayTimes : result.data
            })
        } catch(err) {
            console.log("click btn clock updat err : " + err)
        }
    }
    clockContents() {
        const { todayTimes } = this.state;
        return <div className="slack-dash">
            <span>마지막 업데이트 날짜</span><br></br>
            <span>{moment(todayTimes).format("YYYY-MM-DD")}</span>
            <button type="button">갱신</button>
        </div>
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- rendering ---------- 
    render () {
        const { usersalldb } = this.state;
        return (
            <div>
                <Dashboard contents={this.clockContents.bind(this)} />
                {
                    usersalldb.map((data,i)=>{
                        return <Dashboard key={i} contents={this.usersListBoard.bind(this, data.state)}/>
                    })
                }
            </div>
        );
    }
}

export default Slack_Dashboard;