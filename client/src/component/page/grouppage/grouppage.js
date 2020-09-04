import React, { Component } from 'react';
import Pagination from '@material-ui/lab/Pagination';
// import axios from 'axios';
import Item from './groupitem';
import { Paginate } from './utils/Paginate';

// let configs = {};
// process.env.NODE_ENV === 'development' ? configs = require('../../../devClient_config') : configs = require('../../../client_config');

class Grouppage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            container : [],     // 직원 데이터
            pageSize : 12,      // 한 페이지당 들어가는 직원 데이터 수
            currentPage : 1,    // 현재 보고있는 페이지
        }
    }

    async componentDidMount() {

    }

    render() { 
        const { container } = this.props
        const { pageSize, currentPage } = this.state;
        const { length: personCount } = this.props.container;

        // 페이지 갯수
        let totalPage = (personCount / pageSize);
        totalPage = Math.ceil(totalPage);

        // 페이지네이션 외부 컴포넌트 사용
        const personArray = Paginate(container, currentPage, pageSize);

        return (
            <div className="grouppage-main">
                <div className="grouppage-top">

                    {/* 타이틀과 박스 영역 */}
                    <div className="grouppage-title">직원 현황</div>
                    <div className="grouppage-box">
                        {/* 타이틀고 필터 */}
                        <div className="grouppage-box-title">
                            <div className="grouppage-box-title-text">근태 현황</div>
                            <div className="grouppage-box-title-filter" onClick={() => alert("추후 업데이트 예정입니다.")}>
                                <div className="grouppage-filter-circle"></div>
                                <div className="grouppage-filter-text">월통계</div>
                            </div>
                        </div>
                        <div className="grouppage-lines">
                            <div className="grouppage-line1"></div>
                            <div className="grouppage-line2"></div>
                            <div className="grouppage-line3"></div>
                        </div>
                        {/* 헤더라인 */}
                        <table className="grouppage-table">
                            <thead>
                                <tr className="grouppage-table-thead-tr">
                                    <td style={{ width: "10%" }}>순번</td>
                                    <td style={{ textAlign: "left", width: "15%" }}>이름</td>
                                    <td>사용휴가</td>
                                    <td>지각</td>
                                    <td>야근</td>
                                    <td>총 휴가</td>
                                    <td>출근</td>
                                </tr>
                                <tr className="grouppage-table-line"></tr>
                            </thead>
                            <tbody>
                                {
                                    personArray.map((data, i) => {
                                        return (
                                            <Item key={i} 
                                                id={(i+1) + (currentPage-1) * pageSize} name={data.username} holiday={data.vac} tardy={data.tardy}
                                                overtime={data.nightshift} total='20' atten={data.onworktime}>
                                            </Item>
                                        )
                                    })
                                }
                            </tbody>
                        </table>

                        {/* 페이지네이션 번호 박스 */}
                        <div className="grouppage-box-btn-nums">
                            <Pagination count={totalPage} color="primary" page={currentPage} onChange={(event, page) => this.setState({ currentPage : page })} />
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