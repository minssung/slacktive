import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';

import Card from './card';
import Tui from './tui';

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../../devClient_config') : configs = require('../../../client_config');

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            calenderData : [],
            generalData : [],

            load : false,
        }
    }

    // 데이터 콘캣으로 새롭게 렌더링
    // data : 데이터, cate : 종류 : ( true = 휴가 ), init : 덮어씌우는 여부
    calendarConcat(data, cate, init) {
        if(init) {
            if(cate) {
                this.setState({ calenderData : data });
            } else {
                this.setState({ generalData : data });
            }
        } else {
            const { calenderData, generalData } = this.state;
            if(cate) {
                this.setState({ calenderData : calenderData.concat(data) });
            } else {
                this.setState({ calenderData : generalData.concat(data) });
            }
        }
    }

    async componentDidMount() {
        try {
            let calender = axios.get(`${configs.domain}/holiday/all`);
            let general = axios.get(`${configs.domain}/general/all`);

            await Promise.all([calender, general]).then(data => {
                calender = data[0].data;
                general = data[1].data;
            })

            this.setState({ calenderData : calender });
            this.setState({ generalData : general });
        } catch(err) {
            console.log("정보를 불러오는데 실패하였습니다.", err);
        }
        this.setState({ load : true });
    }

    render() {
        const { user, userList, attenTime, special, todayCard } = this.props;
        const { calenderData, generalData, load } = this.state;
        return (
            <div className="main-main">
                <div className="main-top">

                    {/* 타이틀과 옆에 이미지 박스 */}
                    <div className="main-title">
                        <div className="main-title-text">
                            {user.username ? user.username + '님, 좋은아침!' : '다시 로그인을 해주세요.'}<br></br>
                            {attenTime ? attenTime + '에 출근하셨네요.' : ''}
                            <img src="/img/cloud.png" alt="cloud" className="main-img-cloud1"></img>

                            {/* 갱신 버튼 (임시) */}
                            <button onClick={() => {
                                axios.post(configs.domain+"/slackapi/channelhistory");
                                alert('갱신 완료');
                                window.location.reload();
                            }} style={{marginLeft: 100}}>갱신</button>
                            
                        </div>
                        <div className="main-img-layout" style={{position:"relative"}}>
                            <img src="/img/developer.png" alt="cloud" className="main-img"></img>
                            <img src="/img/cloud3.png" alt="cloud" className="main-img-cloud3"></img>
                        </div>
                    </div>

                    {/* 지각자와 휴가자 표시 바 */}
                    <div className="main-bar">
                        <div className="main-bar-tardyList">
                            <span className="main-bar-textTitle">지각자</span>
                            <span className="main-bar-text">{special.tardyList}</span>
                        </div>
                        <div className="main-bar-holidayList">
                            <span className="main-bar-textTitle">휴가자</span>
                            <span className="main-bar-text">{special.holidayList}</span>
                        </div>
                        <img src="/img/cloud2.png" alt="cloud" className="main-img-cloud2"></img>
                    </div>

                    {/* 캘린더 버튼과 영역 */}
                    <div className="main-tui-calneder">
                        {
                            load && <Tui userList={userList} user={user} holidayData={calenderData} generalData={generalData} calendarConcat={this.calendarConcat.bind(this)} />
                        }
                    </div>
                </div>
                <div className="main-bot">

                    {/* 이미지 영역 */}
                    <div className="main-images">
                        <div className="main-images-line">
                            <img src="/img/zandi.png" alt="img" className="main-imges-zandi"></img>
                            <img src="/img/tree.png" alt="img" className="main-imges-tree"></img>
                            <img src="/img/cat.png" alt="img" className="main-imges-cat"></img>
                        </div>
                        <div className="main-images-guide">
                            <img src="/img/Todaycard.png" alt="img" className="main-imges-today"></img>
                        </div>
                    </div>

                    {/* 오늘의 카드 영역 */}
                    <div className="main-cards">
                        <div className="main-cards-paading">
                            {
                                todayCard.length ?
                                todayCard.map((data, i) => {
                                    return <Card key={i}
                                    title={data.title} partner={data.partner} date={moment(data.startDate).format('MM월 DD일 hh시 mm분')} />
                                })
                                :
                                <div className="main-cards-non">
                                    등록된 오늘의 일정이 없습니다.
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default Main;