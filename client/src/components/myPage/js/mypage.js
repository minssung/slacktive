import React , {Component} from 'react';
import '../css/mypage.css';
import moment from 'moment';
import axios from 'axios';
import MyDashboard from './My_Dashboard/MyDashboard';

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../../devClient_config') : configs = require('../../../client_config');

class mypage extends Component {
    constructor(props){
        super(props);
        this.state = {
            // user token & user data
            usertoken : null,
            user : [],
            // today date
            today : moment(new Date()).format("YYYY-MM"),  // 오늘 년,월
            toYear : moment(new Date()).format("YYYY"),     // 이번년도
            // api datas
            tardys : "",    // 지각
            tardysSub : "",
            atten : "",     // 출근
            avgAtten : [],  // 평균 출근
            avgAttenSub : [],
            nightShift : "",// 야근
            nightShiftSub : "",
            holidayHistorys : [],   // 휴가 내역
            holidayCount : 0,
            // modal
            modalOnOff : "none",
            modalDb : [],
            modalDbAten : [],
            modalDbAvg : [],
            modalDbNit : [],
            modalState : "",
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
            user : await axios.get(`${configs.domain}/user/one?userid=${usertoken}`)
        })
        // 동시에 처리
        const tardy = this.tardyApi();   // 지각
        const avgAten = this.avgAttenTimeApi();    // 평균 출근 시간
        const aten = this.attenApi();   // 출근
        const nigSft = this.nightShiftApi();  // 야근
        const holidays = this.holidayUsageHistoryApi();  // 휴가
        const modalApiTardy = this.modalApi();
        const modalApiAtten = this.modalApi("출근");
        // 전부 값이 처리 될때까지 대기
        await Promise.all([tardy,avgAten,aten,nigSft,holidays,modalApiTardy,modalApiAtten]);
    }
    // ------------------------------ Api & Contents ------------------------------
    // 지각 횟 수 api ------------------------------
    async tardyApi(){
        const { user, today } = this.state;
        try {
            const result = axios.get(`${configs.domain}/slack/state?state=${"지각"}&userid=${user.data.id}&time=${today}&stateSub=${"null"}`)
            const resultSub = axios.get(`${configs.domain}/slack/state?state=${"지각"}&userid=${user.data.id}&time=${today}&sub=${true}&stateSub=${"null"}`)
            await Promise.all([result, resultSub]).then((val)=>{
                this.setState({
                    tardys : val[0].data,
                    tardysSub : (val[1].data - val[0].data),
                })
            })
        } catch(err) {
            console.log("tardy Api err : " + err)
        }
    }
    tardyContents(){
        const { tardys,tardysSub } = this.state;
        return <div className="mypage-dashNumDiv" onClick={this.modalCancel.bind(this,"","tardy")}>
            <span className="mypage-numSpan">지각 횟수</span>
            <img className="mypage-numImgStart" alt="err" src="img/stars.png"></img>
            <img className="mypage-numImg" alt="err" src="img/run.png"></img>
            <span className="mypage-numMainSpan">{tardys ? tardys + "회" : "없음"}</span>
            <span className="mypage-numSpan">지난달보다 {tardysSub}회 감소</span>
        </div>
    }
    // 평균 출근 시간 api ------------------------------
    async avgAttenTimeApi(){
        const { user,today } = this.state;
        try {
            let diffTime = [];
            let result = axios.get(`${configs.domain}/slack/time?state=${"출근"}&userid=${user.data.id}&time=${today}&stateSub=${"지각"}`)
            let resultSub = axios.get(`${configs.domain}/slack/time?state=${"출근"}&userid=${user.data.id}&time=${today}&stateSub=${"지각"}&sub=${true}`)
            await Promise.all([result, resultSub]).then(val =>{
                this.setState({
                    avgAtten : /^(\d{2}):(\d{2})/.exec(val[0].data),
                    avgAttenSub : /^(\d{2}):(\d{2})/.exec(val[1].data),
                })
                diffTime = /^(\d{2}):(\d{2})/.exec(val[0].data)
            })
            diffTime[0] = moment(new Date()).format("YYYY-MM-DD ") + diffTime[0];
            diffTime[1] = moment(new Date()).format("YYYY-MM-DD ") + this.state.avgAttenSub[0];
            this.setState({
                avgAttenSub : diffTime
            })
        } catch(err) {
            console.log("tardy Api err : " + err)
        }
    }
    avgAttenTimeContents(){
        const { avgAtten,avgAttenSub } = this.state
        return <div className="mypage-dashNumDiv" onClick={this.modalCancel.bind(this,"","avg")}>
            <span className="mypage-numSpan">평균 출근시간</span>
            <img className="mypage-numImgStart" alt="err" src="img/stars.png"></img>
            <img className="mypage-numImg" alt="err" src="img/clock.png"></img>
            <span className="mypage-numMainSpan">{avgAtten ? avgAtten[1] : "00"}시 {avgAtten ? avgAtten[2] : "00"}분</span>
            <span className="mypage-numSpan">지난달보다&nbsp;
                {
                    moment.duration(moment(avgAttenSub[1]).diff(avgAttenSub[0])).asMinutes() >= 0 ? 
                    moment.duration(moment(avgAttenSub[1]).diff(avgAttenSub[0])).asMinutes() + "분 빠름" 
                    : 
                    moment.duration(moment(avgAttenSub[1]).diff(avgAttenSub[0])).asMinutes() + "분 느림"
                }
            </span>
        </div>
    }
    // 출근 횟 수 api ------------------------------
    async attenApi(){
        const { user, today } = this.state;
        try {
            const result = await axios.get(`${configs.domain}/slack/state?state=${"출근"}&userid=${user.data.id}&time=${today}&stateSub=${"지각"}`)
            this.setState({
                atten : result.data,
            })
        } catch(err) {
            console.log("tardy Api err : " + err)
        }
    }
    attenContents(){
        const { atten,holidayCount } = this.state;
        return <div className="mypage-dashNumDiv" onClick={this.modalCancel.bind(this,"","atten")}>
            <span className="mypage-numSpan">출근 일수</span>
            <img className="mypage-numImgStart" alt="err" src="img/stars.png"></img>
            <img className="mypage-numImg" alt="err" src="img/workplace.png"></img>
            <span className="mypage-numMainSpan">{atten}일</span>
            <span className="mypage-numSpan">이번달 연차 {holidayCount}개 사용</span>
        </div>
    }
    // 야근 일 수 api ------------------------------
    async nightShiftApi(){
        const { user, today } = this.state;
        let text = "야근";
        try {
            const result = axios.get(`${configs.domain}/slack/state?state=${text}&userid=${user.data.id}&time=${today}`)
            const resultSet = axios.get(`${configs.domain}/slack/state?state=${text}&userid=${user.data.id}&time=${today}&sub=${true}`)
            await Promise.all([result,resultSet]).then(val=>{
                this.setState({
                    nightShift : val[0].data,
                    nightShiftSub : (val[1].data) - (val[0].data),
                })
            })
        } catch(err) {
            console.log("tardy Api err : " + err)
        }
    }
    nightShiftContents(){
        const { nightShift,nightShiftSub } = this.state;
        return <div className="mypage-dashNumDiv" onClick={this.modalCancel.bind(this,"","night")}>
            <span className="mypage-numSpan">야근 일수</span>
            <img className="mypage-numImgStart" alt="err" src="img/stars.png"></img>
            <img className="mypage-numImg" alt="err" src="img/overtime.png"></img>
            <span className="mypage-numMainSpan">{nightShift ? nightShift + "일" : "없음"}</span>
            <span className="mypage-numSpan">지난달보다 {nightShiftSub ? nightShiftSub : "0"}회 증가</span>
        </div>
    }
    // 휴가 사용 내역 및 갯수 api ------------------------------
    async holidayUsageHistoryApi() {
        const { toYear,user } = this.state;
        try {
            const result = axios.get(`${configs.domain}/calendar/getTime?textTime=${toYear}&userId=${user.data.id}`)
            const resultSet = axios.get(`${configs.domain}/calendar/getTimeSetHoliday?textTime=${toYear}&userId=${user.data.id}`)
            await Promise.all([result,resultSet]).then(val=>{
                this.setState({
                    holidayHistorys : val[0].data,
                    holidayCount : parseFloat(val[1].data),
                });
            })
        } catch(err) {
            console.log("Holiday Usage History err : " + err);
        }
    }
    // 각 모달에 대한 api ------------------------------
    async modalApi(stateSub) {
        const { user } = this.state;
        let state = `state=${"지각"}`;
        if(stateSub === "출근") {
            state = `state=${"지각"}&stateSub=${stateSub}`;
        } else if(stateSub === "야근") {
            state = `state=${stateSub}`;
        }
        try {
            const result = await axios.get(`http://localhost:5000/slack/stateAll?userId=${user.data.id}&${state}`)
            if(stateSub === "출근") {
                this.setState({ modalDbAten : result.data })
            } else if(stateSub === "야근") {
                this.setState({ modalDbNit : result.data })
            } else {
                this.setState({ modalDb : result.data });
            }
        } catch (err) {
            console.log("modal api err : " +  err)
        }
    }
    modalCancel(bool, state) {
        switch(state) {
            case "tardy" : this.setState({
                modalState : {
                    title : "지각 횟수",
                    month : "월 구분",
                    count : "지각 횟수",
                    num : 0,
                }
            }); break;
            case "avg" :  this.setState({
                modalState : {
                    title : "평균 출근 시간",
                    month : "월 구분",
                    count : "평균 시간",
                    num : 1,
                }
            }); break;
            case "atten" :  this.setState({
                modalState : {
                    title : "출근 일수",
                    month : "월 구분",
                    count : "출근 일수",
                    num : 2,
                }
            }); break;
            case "night" :  this.setState({
                modalState : {
                    title : "야근 내역",
                    month : "날짜",
                    count : "초과 근무시간",
                    num : 3,
                }
            }); break;
            default : break;
        }
        this.setState({ modalOnOff : bool })
    }
    modalContents() {
        const { modalOnOff,modalState,
            modalDb,modalDbAten 
        } = this.state;
        return <div className="mypage-modal" style={{ display : modalOnOff }}>
            <div className="mypage-modal-title">
                <span className="mypage-modal-titleText">{modalState.title}</span>
                <span className="mypage-modal-cancel" onClick={this.modalCancel.bind(this, "none")}>x</span>
            </div>
            <div className="mypage-modal-tag">
                <span className="mypage-modal-month">{modalState.month}</span>
                <span className="mypage-modal-count">{modalState.count}</span>
            </div>
            <div className="mypage-modal-lines"></div>
            <div className="mypage-modal-subLine"></div>
            <div className="mypage-modal-body">
                <div className="mypage-modal-main">
                    {
                        modalState.num === 0 ?
                        modalDb && modalDb.map((data,i)=>{
                            let timeSet = /^(\d{4})-(\d{2})/.exec(data.date);
                            return <div key={i} className="mypage-modal-index">
                                <div className="mypage-modal-indexDiv1">
                                    <span className="mypage-modal-indexMonth">{timeSet[1]+"년 " + timeSet[2] + "월"}</span>
                                </div>
                                <div className="mypage-modal-indexDiv2">
                                    <span className="mypage-modal-indexCount">{data.state === 0 ? "없음" : <span className="mypage-modal-indexCountRed">{data.state + "번"}</span>}</span>
                                </div>
                            </div>
                        })
                        : modalState.num === 1 ?  
                        modalDbAten && modalDbAten.map((data,i)=>{
                            let timeSet = /^(\d{4})-(\d{2})/.exec(data.date);
                            return <div key={i} className="mypage-modal-index">
                                <div className="mypage-modal-indexDiv1">
                                    <span className="mypage-modal-indexMonth">{timeSet[1]+"년 " + timeSet[2] + "월"}</span>
                                </div>
                                <div className="mypage-modal-indexDiv2">
                                    <span className="mypage-modal-indexCount">{data.state === 0 ? "없음" : <span className="mypage-modal-indexCountRed">{data.state + "번"}</span>}</span>
                                </div>
                            </div>
                        })
                        : modalState.num === 2 ?
                        modalDbAten && modalDbAten.map((data,i)=>{
                            let timeSet = /^(\d{4})-(\d{2})/.exec(data.date);
                            return <div key={i} className="mypage-modal-index">
                                <div className="mypage-modal-indexDiv1">
                                    <span className="mypage-modal-indexMonth">{timeSet[1]+"년 " + timeSet[2] + "월"}</span>
                                </div>
                                <div className="mypage-modal-indexDiv2">
                                    <span className="mypage-modal-indexCount">{data.state === 0 ? "없음" : <span className="mypage-modal-indexCountRed">{data.state + "번"}</span>}</span>
                                </div>
                            </div>
                        })
                        : ""
                    }
                </div>
                <div className="mypage-modal-btns">
                    <span className="mypage-modal-left">&larr;</span>
                    <button className="mypage-modal-btnNumsSelt">
                        <span className="mypage-modal-btnSelt">1</span>
                    </button>
                    <span className="mypage-modal-right">&rarr;</span>
                </div>
            </div>
        </div>
    }
    // ------------------------------ rendering ------------------------------
    render() {
        const { holidayHistorys,holidayCount } = this.state;        // 로드 마스크, 휴가 사용 내역, 오늘 날짜
        let setTimes = "";       // 휴가 사용 내역 중 오늘 날짜와 계산용
        const modals = this.modalContents();
        return (
            <div className="mypage-mainDiv">
                {
                    <div className="mypage-modal-parents">{modals}</div>
                }
                <div className="mypage-upDiv">
                    <div className="mypage-progDiv">
                        <span className="mypage-progSpan">내 현황</span>
                        <div className="mypage-progressBarDiv">
                            <div className="mypage-progressBarInner">
                                <img src="img/usa.png" alt="err" className="mypage-usa"></img>
                                <img src="img/usabottle.png" alt="err" className="mypage-usabottle"></img>
                                <span className="mypage-progressCountPlus">{}</span>
                                <span className="mypage-progressCount">{20-holidayCount}</span>
                                <span className="mypage-progressTopText">내 휴가</span>
                                <div className="mypage-progressMid">
                                    <span className="mypage-progressMidText1">{20-holidayCount}</span>
                                    <span className="mypage-progressMidText2">{}</span>
                                    <span className="mypage-progressMidText3"> /20</span>
                                    <div className="mypage-progressMidBottom"></div>
                                </div>
                                <span className="mypage-progressBotText">{holidayCount}번 사용했고 <b>{20-holidayCount}번{}</b> 남아있어요</span>
                            </div>
                        </div>
                    </div>
                    <div className="mypage-spans">
                        <span className="mypage-DashSpan">이번달에 나는 ... </span>
                        <div className="mypage-monthBtn">
                            <div className="mypage-circle"></div>
                            <span className="mypage-circleSpan">월평균</span>
                        </div>
                    </div>
                    <div className="mypage-DashDiv">
                        <MyDashboard classNameDash={"mypage-Dash1"} contents={this.tardyContents.bind(this)}/>
                        <MyDashboard classNameDash={"mypage-Dash2"} contents={this.avgAttenTimeContents.bind(this)}/>
                        <MyDashboard classNameDash={"mypage-Dash3"} contents={this.attenContents.bind(this)}/>
                        <MyDashboard classNameDash={"mypage-Dash4"} contents={this.nightShiftContents.bind(this)}/>
                    </div>
                </div>
                <div className="mypage-imgDiv">
                    <img src="img/ground.png" alt="err" className="mypage-imgNum3"></img>
                    <img src="img/cang.png" alt="err" className="mypage-imgNum2"></img>
                    <img src="img/castle.png" alt="err" className="mypage-imgNum1"></img>
                </div>
                <div className="mypage-downDiv">
                    <div className="mypage-downSpans">
                        <div className="mypage-downCircle"></div>
                        <span className="mypage-downSpan">휴가 사용 내역</span>
                    </div>
                    <div className="mypage-downDashDiv">
                        {   // 휴가 사용 내역 표시
                            holidayHistorys.map((data,i)=>{
                                setTimes = /(\d{4}-\d{2}-\d{2})/.exec(data.textTime);
                                return <div key={i} className="mypage-downDashNum">
                                    <div className="mypage-downDashBox"></div>
                                    <span className="mypage-downDashNumCate">{/반차/.test(data.cate) ? (/(반차)/.exec(data.cate))[1] : data.cate}</span>
                                    <span>
                                        {
                                            moment(moment(new Date())).startOf('day').diff(moment(setTimes[1]).startOf('day'), 'days') < 0 ? 
                                            <span className="mypage-downDashNumBool">[예정]&nbsp;&nbsp;{data.textTime}</span> 
                                            : 
                                            <span className="mypage-downDashNumTime">{data.textTime}</span>
                                        }
                                    </span>
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default mypage;