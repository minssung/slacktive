import React, { Component } from 'react';
// import axios from 'axios';

import Card from './card';
import Tui from './tui';

import axios from 'axios';

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../../devClient_config') : configs = require('../../../client_config');

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    async componentDidMount() {
        try {

        } catch(err) {
            console.log("main mount err : ", err);
        }
    }
    
    render() {
        // const { user } = this.props;
        return (
            <div className="main-main">
                <div className="main-top">

                    {/* 타이틀과 옆에 이미지 박스 */}
                    <div className="main-title">
                        <div className="main-title-text">
                            {"조준명"}님, 좋은아침!<br></br>
                            {"9시 45분"}에 출근하셨네요.
                            <img src="/img/cloud.png" alt="cloud" className="main-img-cloud1"></img>
                            <button onClick={() => axios.post(configs.domain+"/slackapi/channelhistory")} style={{marginLeft: 100}}>갱신</button>
                        </div>
                        <div style={{position:"relative"}}>
                            <img src="/img/developer.png" alt="cloud" className="main-img"></img>
                            <img src="/img/cloud3.png" alt="cloud" className="main-img-cloud3"></img>
                        </div>
                    </div>

                    {/* 지각자와 휴가자 표시 바 */}
                    <div className="main-bar">
                        <div className="main-bar-tardyList">
                            <span className="main-bar-textTitle">지각자</span>
                            <span className="main-bar-text">{"가을"}</span>
                        </div>
                        <div className="main-bar-holidayList">
                            <span className="main-bar-textTitle">휴가자</span>
                            <span className="main-bar-text">{"가을,"}</span>
                            <span className="main-bar-text">{"지혜"}</span>
                        </div>
                        <img src="/img/cloud2.png" alt="cloud" className="main-img-cloud2"></img>
                    </div>

                    {/* 캘린더 버튼과 영역 */}
                    <div className="main-tui-calneder">
                        <Tui />
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
                            <Card />
                            <Card />
                            <Card />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default Main;