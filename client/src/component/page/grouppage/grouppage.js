import React, { Component } from 'react';
import Pagination from '@material-ui/lab/Pagination';
import moment from 'moment';
import Item from './groupitem';

class Grouppage extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    render() { 
        return (
            <div className="grouppage-main">
                <div className="grouppage-top">

                    {/* 타이틀과 박스 영역 */}
                    <div className="grouppage-title">직원 현황</div>
                    <div className="grouppage-box">
                        {/* 타이틀고 필터 */}
                        <div className="grouppage-box-title">
                            <div className="grouppage-box-title-text">근태 현황</div>
                            <div className="grouppage-box-title-filter">
                                <div className="grouppage-filter-circle"></div>
                                <div className="grouppage-filter-text">월통계</div>
                            </div>
                        </div>
                        {/* 헤더라인 */}
                        <div className="grouppage-box-header">
                            <div className="grouppage-box-header-text" style={{marginRight:"20px", marginLeft:"40px"}}>순번</div>
                            <div className="grouppage-box-header-text" style={{marginRight:"102px"}}>이름</div>
                            <div className="grouppage-box-header-text" style={{marginRight:"20px"}}>사용 휴가</div>
                            <div className="grouppage-box-header-text" style={{marginRight:"50px"}}>지각</div>
                            <div className="grouppage-box-header-text" style={{marginRight:"59px"}}>야근</div>
                            <div className="grouppage-box-header-text" style={{marginRight:"33px"}}>총 휴가</div>
                            <div className="grouppage-box-header-text" style={{marginRight:"50px"}}>출근</div>
                        </div>
                        {/* 라인들 */}
                        <div className="grouppage-box-lines">
                            <div className="grouppage-box-line1"></div>
                            <div className="grouppage-box-line2"></div>
                            <div className="grouppage-box-line3"></div>
                        </div>
                        {/* 데이터 로우들 */}
                        {/* id, name, holiday, tardy, overtime, total, atten */}
                        <div className="grouppage-box-items">
                            <Item id={"1"} name={"조가을"} holiday={"20.5"} tardy={"20.5"} overtime={"1"} total={"20.5"} atten={"20.5"} />
                            <Item id={"2"} name={"조가을"} holiday={"20.5"} tardy={"20.5"} overtime={"1"} total={"20.5"} atten={"20.5"} />
                            <Item id={"3"} name={"조가을"} holiday={"20.5"} tardy={"20.5"} overtime={"1"} total={"20.5"} atten={"20.5"} />
                            <Item id={"4"} name={"조가을"} holiday={"20"} tardy={"20.5"} overtime={"1"} total={"20.5"} atten={"20.5"} />
                            <Item id={"5"} name={"조가을"} holiday={"2"} tardy={"20.5"} overtime={"0"} total={"20.5"} atten={"20"} />
                            <Item id={"6"} name={"조가을"} holiday={"2"} tardy={"20.5"} overtime={"1"} total={"20.5"} atten={"20.5"} />
                            <Item id={"7"} name={"조가을"} holiday={"20"} tardy={"20.5"} overtime={"1"} total={"20"} atten={"20.5"} />
                            <Item id={"8"} name={"조가을"} holiday={"20.5"} tardy={"2"} overtime={"1"} total={"20"} atten={"20"} />
                            <Item id={"9"} name={"조가을"} holiday={"20.5"} tardy={"20.5"} overtime={"1"} total={"20.5"} atten={"20.5"} />
                            <Item id={"10"} name={"조가을"} holiday={"20.5"} tardy={"20.5"} overtime={"1"} total={"20.5"} atten={"20.5"} />
                            <Item id={"11"} name={"조가을"} holiday={"20.5"} tardy={"20.5"} overtime={"1"} total={"20.5"} atten={"20.5"} />
                            <Item id={"12"} name={"조가을"} holiday={"20.5"} tardy={"20.5"} overtime={"1"} total={"20.5"} atten={"20.5"} />
                        </div>
                        {/* 페이지네이션 번호 박스 */}
                        <div className="grouppage-box-btn-nums">
                            <Pagination count={10} color="primary" />
                        </div>
                    </div>
                </div>

                <div className="grouppage-bot">
                    
                    {/* 하단 그림 영역 */}
                    <div className="grouppage-image-div">
                        <img src="/img/groundh.png" alt="img" className="grouppage-image-ground"></img>
                        <img src="/img/item.png" alt="img" className="grouppage-image-item"></img>
                        <img src="/img/alpaca.png" alt="img" className="grouppage-image-alpaca"></img>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default Grouppage;