import React , {Component} from 'react';
import '../css/mypage.css';
import moment from 'moment';
import axios from 'axios';
import loadMask from '../../../resource/loadmaskTest.gif'
import MyDashboard from './My_Dashboard/MyDashboard';

class mypage extends Component {
    constructor(props){
        super(props);
        this.state = {
            // user token & user data
            usertoken : null,
            user : [],
            // today date
            today : moment(new Date()).format("YYYY-MM-"),  // 오늘 년,월
            toYear : moment(new Date()).format("YYYY"),     // 이번년도
            // api datas
            tardys : [],
            atten : [],
            avgAtten : [],
            nightShift : [],
            holidayHistorys : [],
            // load mask
            loading : "",
        }
    }
    async componentDidMount(){
        // 유저 토큰 값
        await this.setState({
            usertoken : await this.props.Token
        })
        const { usertoken } = this.state;
        // user Db setting
        await this.setState({
            user : await axios.get(`http://localhost:5000/user/one?userid=${usertoken}`)
        })
        // 동시에 처리
        const tardy = this.tardyApi();   // 지각
        const avgAten = this.avgAttenTimeApi();    // 평균 출근 시간
        const aten = this.attenApi();   // 출근
        const nigSft = this.nightShiftApi();  // 야근
        const holidays = this.holidayUsageHistoryApi()  // 휴가
        // 전부 값이 처리 될때까지 대기
        await tardy; await avgAten; await aten; await nigSft; await holidays;
        // 로드 마스크
        await this.setState({
            loading : "Loading",
        })
    }
    // ------------------------------ Api & Contents ------------------------------
    // 지각 횟 수 api ------------------------------
    async tardyApi(){
        const { user, today } = this.state;
        let text = "지각";
        try {
            const result = await axios.get(
                `http://localhost:5000/slack/state?state=${text}&userid=${user.data.id}&time=${today}
            `)
            await this.setState({
                tardys : result.data,
            })
        } catch(err) {
            console.log("tardy Api err : " + err)
        }
    }
    tardyContents(){
        const { tardys } = this.state;
        return <div>
            지각 횟 수 : {tardys}
        </div>
    }
    // 평균 출근 시간 api ------------------------------
    async avgAttenTimeApi(){
        const { user,today } = this.state;
        let text = "출근";
        let times = [];
        try {
            let result = await axios.get(
                `http://localhost:5000/slack/time?state=${text}&userid=${user.data.id}&time=${today}`)
            times = /(\d{2}):(\d{2})/.exec(result.data)
            await this.setState({
                avgAtten : times,
            })
            
        } catch(err) {
            console.log("tardy Api err : " + err)
        }
    }
    avgAttenTimeContents(){
        const { avgAtten} = this.state
        
        return <div>
        평균 출근 시간 : {avgAtten[1]}시{avgAtten[2]}분
    </div>
    }
    // 출근 횟 수 api ------------------------------
    async attenApi(){
        const { user, today } = this.state;
        let text = "출근";
        try {
            const result = await axios.get(
                `http://localhost:5000/slack/state?state=${text}&userid=${user.data.id}&time=${today}
            `)
            await this.setState({
                atten : result.data,
            })
        } catch(err) {
            console.log("tardy Api err : " + err)
        }
    }
    attenContents(){
        const { atten } = this.state;
        return <div>
        평균 출근 횟 수 : {atten}
    </div>
    }
    // 야근 일 수 api ------------------------------
    async nightShiftApi(){
        const { user, today } = this.state;
        let text = "야근";
        try {
            const result = await axios.get(
                `http://localhost:5000/slack/state?state=${text}&userid=${user.data.id}&time=${today}
            `)
            await this.setState({
                nightShift : result.data,
            })
        } catch(err) {
            console.log("tardy Api err : " + err)
        }
    }
    nightShiftContents(){
        const { nightShift } = this.state;
        return <div>
        야근 횟 수 : {nightShift}
    </div>
    }
    // 휴가 사용 내역 api ------------------------------
    async holidayUsageHistoryApi() {
        const { toYear,user } = this.state;
        try {
            const result = await axios.get(`http://localhost:5000/calendar/getTime?textTime=${toYear}&userId=${user.data.id}`)
            await this.setState({
                holidayHistorys : result.data,
            });
            console.log(result.data)
        } catch(err) {
            console.log("Holiday Usage History err : " + err);
        }
    }
    // ------------------------------ rendering ------------------------------
    render() {
        const { loading,holidayHistorys,today } = this.state;           // 로드 마스크, 휴가 사용 내역, 오늘 날짜
        let setTimes = "";                                              // 휴가 사용 내역 중 오늘 날짜와 계산용
        return (
            <div className="mypage-mainDiv">
                {
                    // 로드 마스크
                    !loading && <div className="loadMaskDiv">
                        <img alt="Logind~" src={loadMask} className="loadMask"></img>
                    </div>
                }
                <div className="mypage-upDiv">
                    <div className="mypage-progDiv">
                        <span>내 현황</span>
                        <div className="mypage-progressBarDiv">프로그레스 바 영역</div>
                    </div>
                    <span>이번달에 나는 ... </span>
                    <div className="mypage-DashDiv">
                        <MyDashboard contents={this.tardyContents.bind(this)}/>
                        <MyDashboard contents={this.avgAttenTimeContents.bind(this)}/>
                        <MyDashboard contents={this.attenContents.bind(this)}/>
                        <MyDashboard contents={this.nightShiftContents.bind(this)}/>
                    </div>
                </div>
                <div className="mypage-downDiv">
                    {   // 휴가 사용 내역 표시
                    holidayHistorys.map((data,i)=>{
                        setTimes = /(\d{4}-\d{2}-\d{2})/.exec(data.textTime);
                        return <div key={i}>
                            <span>{data.cate}</span>
                            <span>{moment(today).diff(setTimes[1], 'days') < 0 && <span>[예정]</span>}</span>
                            <span>{data.textTime}</span>
                        </div>
                    })
                    }
                </div>
            </div>
        );
    }
}

export default mypage;