import React, { Component } from 'react';
import moment from 'moment';

import Mycard from './mycard';
import History from './history';
import Mypopup from './mypopup';

class Mypage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open : { view : false, num : 0 },

            viewCount : 5,
        }
    }

    // 팝업 띄우기 위한 카드 클릭 시
    async cardClick(bool, num) { 
        this.setState({ open : { view : bool, num } }); 
    }

    render() { 
        const { holidayHistoryData, tardyCount, attenAvg, attenCount, overTimeCount, holidayUse, holidayAdd, user } = this.props;
        const { open, viewCount } = this.state;

        return (
            <div className="mypage-main">
                <div className="mypage-top">
                    <Mypopup num={0} data={tardyCount} cardClick={this.cardClick.bind(this)} open={open} />
                    <Mypopup num={1} data={attenAvg} cardClick={this.cardClick.bind(this)} open={open} />
                    <Mypopup num={2} data={attenCount} cardClick={this.cardClick.bind(this)} open={open} />
                    <Mypopup num={3} data={overTimeCount} cardClick={this.cardClick.bind(this)} open={open} />

                    {/* 타이틀과 휴가 갯수 박스 */}
                    <div className="mypage-title">내 현황</div>
                    <div className="mypage-holiday-box">
                        <div className="mypage-holiday-left">
                            <div className="mypage-holiday-title">내 휴가</div>
                            <div className="mypage-holiday-count">
                                <div className="mypage-holiday-count-current">{holidayUse ? (user.holidaycount - holidayUse) : user.holidaycount}</div>
                                <div className="mypage-holiday-count-add">{`${holidayAdd ? `(+${holidayAdd})` : ""}`}</div>
                                <div className="mypage-holiday-count-total">/{user.holidaycount}</div>
                                <div className="mypage-holiday-count-deco"></div>
                            </div>
                            <div className="mypage-holiday-text">
                                {`${holidayUse || 0}`}번 사용했고, <strong>{holidayUse ? (user.holidaycount - holidayUse) : user.holidaycount}번{`${holidayAdd ? `(+${holidayAdd})` : ""}`}</strong> 남아있어요.
                            </div>
                        </div>
                        <div className="mypage-holiday-right">
                            <div className="mypage-holiday-right-images">
                                <img src="/img/usa.png" alt="holidayimg" className="mypage-holiday-usa"></img>
                                <img src="/img/usabottle.png" alt="holidayimg" className="mypage-holiday-bottle"></img>
                            </div>
                            <div className="mypage-holiday-right-counts">
                                <div className="mypage-holiday-right-counts-top">{`${holidayAdd ? `(+${holidayAdd})` : ""}`}</div>
                                <div className="mypage-holiday-right-counts-bot">{holidayUse ? (user.holidaycount - holidayUse) : user.holidaycount}</div>
                            </div>
                        </div>
                    </div>

                    {/* 나의 이번달 타이틀, 셀렉트 박스, 카드 목록들 */}
                    <div className="mypage-mycard-title">
                        <div className="mypage-mycard-title-text">이번달에 나는 ...</div>
                        <div className="mypage-mycard-filter-box" onClick={() => alert("추후 추가 예정입니다.")}>
                            <div className="mypage-mycard-circle"></div>
                            <div className="mypage-mycard-filter">월평균</div>
                        </div>
                    </div>
                    <div className="mypage-mycard-div">
                        <Mycard 
                            num={0} 
                            cardClick={this.cardClick.bind(this)} 
                            img="/img/run.png" 
                            result={`지난달보다 ${(tardyCount.to - tardyCount.pre) || 0}회 증가`} 
                            data={`${tardyCount.to ? tardyCount.to + "회" : "없음"}`} 
                            label="지각 횟수" 
                            color="linear-gradient(to top, #a665e5, #ff92eb)" 
                        />
                        <Mycard 
                            num={1} 
                            cardClick={this.cardClick.bind(this)} 
                            img="/img/clock.png" 
                            result={`${attenAvg.pre ? `지난달보다  ${attenAvg.pre} 빠름` : `추후 추가 예정`}`} 
                            data={`${attenAvg.to || "없음"}`} 
                            label="평균 출근시간" 
                            color="linear-gradient(to top, #988ffe, #988ffe, #9cd5ff)" 
                        />
                        <Mycard 
                            num={2} 
                            cardClick={this.cardClick.bind(this)} 
                            img="/img/workplace.png" 
                            result={`이번달 연차 ${attenCount.pre || 0}개 사용`} 
                            data={`${attenCount.to ? attenCount.to + "일" : "없음"}`} 
                            label="출근 일수" 
                            color="linear-gradient(to top, #6b59cf, #b47eff)" 
                        />
                        <Mycard 
                            num={3} 
                            cardClick={this.cardClick.bind(this)} 
                            img="/img/overtime.png" 
                            result={`지난달보다 ${overTimeCount.pre || 0}회 증가`} 
                            data={`${(overTimeCount.to || 0) + "일"}`} 
                            label="야근 일수" 
                            color="linear-gradient(to top, #ffd15b, #ff8e3d)" 
                        />
                    </div>
                </div>
                <div className="mypage-bot">

                    {/* 이미지들 */}
                    <div className="mypage-images-box">
                        <img src="/img/ground.png" alt="img" className="mypage-img-ground"></img>
                        <img src="/img/cang.png" alt="img" className="mypage-img-cang"></img>
                        <img src="/img/castle.png" alt="img" className="mypage-img-castle"></img>
                    </div>

                    {/* 휴가 사용 내역 */}
                    <div className="mypage-history-main">
                        <div className="mypage-history-title">
                            <div className="mypage-history-title-box">
                                <div className="mypage-history-circle"></div>
                                <div className="mypage-history-text">휴가 사용 내역</div>
                            </div>
                            <div className="mypage-history-box">
                                {
                                    holidayHistoryData && holidayHistoryData[0] &&
                                    holidayHistoryData.map((data, i) => {
                                        if(i >= viewCount) return null;
                                        let timeText = "";
                                        data.textTime.forEach((data,i) => {
                                            if(data.startDate === data.endDate) {
                                                timeText += moment(data.startDate).format("YYYY. M. D. (ddd)")
                                            } else {
                                                timeText += moment(data.startDate).format("YYYY. M. D. (ddd)") + " ~ " + moment(data.endDate).format("M. D. (ddd)") + (i !== 0 ? " / " : "")
                                            }
                                        })
                                        const state = moment(moment(new Date())).startOf('day').diff(moment(data.textTime[0].startDate).startOf('day'), 'days') < 0;
                                        return <History key={data.id} label={data.cate} data={timeText} state={state} />
                                    })
                                }
                            </div>
                            {
                                viewCount <= holidayHistoryData.length && 
                                <div className="mypage-history-add-view" onClick={() => this.setState({ viewCount : viewCount * 2 })}>더 보기</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default Mypage;