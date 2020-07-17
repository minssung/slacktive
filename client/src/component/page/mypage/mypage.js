import React, { Component } from 'react';

import Mycard from './mycard';
import History from './history';

class Mypage extends Component {
    render() { 
        return (
            <div className="mypage-main">
                <div className="mypage-top">

                    {/* 타이틀과 휴가 갯수 박스 */}
                    <div className="mypage-title">내 현황</div>
                    <div className="mypage-holiday-box">
                        <div className="mypage-holiday-left">
                            <div className="mypage-holiday-title">내 휴가</div>
                            <div className="mypage-holiday-count">
                                <div className="mypage-holiday-count-current">{"15"}</div>
                                <div className="mypage-holiday-count-add">{"(+1)"}</div>
                                <div className="mypage-holiday-count-total">{"20"}</div>
                                <div className="mypage-holiday-count-deco"></div>
                            </div>
                            <div className="mypage-holiday-text">
                                {"5"}번 사용했고, <strong>{"15"}번{"(+1)"}</strong> 남아있어요.
                            </div>
                        </div>
                        <div className="mypage-holiday-right">
                            <div className="mypage-holiday-right-images">
                                <img src="/img/usa.png" alt="holidayimg" className="mypage-holiday-usa"></img>
                                <img src="/img/usabottle.png" alt="holidayimg" className="mypage-holiday-bottle"></img>
                            </div>
                            <div className="mypage-holiday-right-counts">
                                <div className="mypage-holiday-right-counts-top">{"+1"}</div>
                                <div className="mypage-holiday-right-counts-bot">{"15"}</div>
                            </div>
                        </div>
                    </div>

                    {/* 나의 이번달 타이틀, 셀렉트 박스, 카드 목록들 */}
                    <div className="mypage-mycard-title">
                        <div className="mypage-mycard-title-text">이번달에 나는 ...</div>
                        <div className="mypage-mycard-filter-box">
                            <div className="mypage-mycard-circle"></div>
                            <div className="mypage-mycard-filter">월평균</div>
                        </div>
                    </div>
                    <div className="mypage-mycard-div">
                        <Mycard img="/img/run.png" result={"지난달보다 2회 감소"} data={"없음"} label="지각 횟수" color="linear-gradient(to top, #a665e5, #ff92eb)" />
                        <Mycard img="/img/clock.png" result={"지난달보다 20분 빠름"} data={"9시 40분"} label="평균 출근시간" color="linear-gradient(to top, #988ffe, #988ffe, #9cd5ff)" />
                        <Mycard img="/img/workplace.png" result={"이번달 연차 0.5개 사용"} data={"20일"} label="출근 일수" color="linear-gradient(to top, #6b59cf, #b47eff)" />
                        <Mycard img="/img/overtime.png" result={"지난달보다 1회 증가"} data={"1일"} label="야근 일수" color="linear-gradient(to top, #ffd15b, #ff8e3d)" />
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
                                <History label="반차" data={"2020. 3. 20 (수)"} state={true} />
                                <History label="휴가" data={"2020. 3. 02 (월) ~ 3. 6 (금)"} state={true} />
                                <History label="대휴" data={"2020. 3. 20 (수)(2020. 1. 8 (일) 근무)"} state={false} />
                                <History label="병가" data={"2020. 3. 20 (수)"} state={false} />
                                <History label="휴가" data={"2020. 3. 20 (수)"} state={false} />
                                <History label="휴가" data={"2020. 3. 20 (수)"} state={false} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default Mypage;