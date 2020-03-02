import React from 'react';
import axios from 'axios';
import Dashboard from './Dashboard/Dashboard';
import moment from 'moment';

import loadMask from '../../../resource/loadmaskTest.gif'

class Slack_Dashboard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            // users list - state
            usersalldb : [],
            usertoken : [],
            spanText : [],
            // time contents
            todayTimes : "",
            // load mask
            loading : "",
        }
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- user Token verify & Mount & axios ---------- 
    async componentDidMount(){
        await this.clockBtnApi();
        await this.setState({
            usertoken : await this.props.Token
        })
        await this.userListApi();   // user List Api
        await this.setState({
            loading : "Loading",
        })
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- user List Api & Render----------
    async userListApi(){
        try {
            const result = await axios.get(`http://localhost:5000/user/all`);
            const stateText = await axios.get("http://localhost:5000/user/state");
            await this.setState({
                usersalldb : result.data,
                spanText : stateText.data
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
    async clockBtnApi(reroad) {
        try {
            const result = await axios.get("http://localhost:5000/updateHistorys");
            await this.setState({
                todayTimes : result.data
            })
        } catch(err) {
            console.log("click btn clock updat err : " + err)
        }
        if(reroad){
            window.location.href = "/"
        }
    }
    clockContents() {
        const { todayTimes } = this.state;
        return <div className="slack-dash">
            <span>마지막 업데이트 날짜</span><br></br>
            <span>{moment(todayTimes).format("YYYY-MM-DD HH:mm:ss")}</span>
            <button type="button" onClick={this.clockBtnApi.bind(this, "reroad")}>갱신</button>
        </div>
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- rendering ---------- 
    render () {
        const { spanText, loading } = this.state;
        return (
            <div className="dash-boardDiv">
                {
                    !loading && <div className="loadMaskDiv">
                        <img alt="Logind~" src={loadMask} className="loadMask"></img>
                    </div>
                }
                <Dashboard contents={this.clockContents.bind(this)} />
                {
                    spanText.map((data,i)=>{
                        return <Dashboard key={i} contents={this.usersListBoard.bind(this, data.state)}/>
                    })
                }
            </div>
        );
    }
}

export default Slack_Dashboard;