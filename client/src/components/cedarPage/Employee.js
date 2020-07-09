import React , {Component} from 'react';
import axios from 'axios';
import loadMask from '../../resource/loadmaskTest.gif';
import './css/Employee.css';
import TableInfo from './TableInfo';
import Pagination from './Pagination';
import { Paginate } from './utils/Paginate';

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../devClient_config') : configs = require('../../client_config');

class Employee extends Component {
    constructor(props){
        super(props);
        this.state = {
            container : [],     // 직원 데이터
            pageSize : 12,       // 한 페이지당 들어가는 직원 데이터 수 (테스트용, 원래는 12로 해야함)
            currentPage : 1,    // 현재 보고있는 페이지
            loading : '',
            // personCount: 14
        }
    }
    handlePageChange = (page) => {
        this.setState({ currentPage: page }, async() => await this.allUser());
        
    }

    async componentDidMount(){
        // 직원 근태 현황 데이터 호출
        await this.allUser();

        // await this.initCount();
        // 로드 마스크
        this.setState({
            loading : "Loading",
        });
    }

    async initCount() {
        const result = await axios.get(configs.domain+"/employee/dataCount");
        this.setState({ personCount: result.data });
    }

    // 직원 근태 현황 불러오기
    async allUser() {
        const result = await axios.post(configs.domain+"/employee/status", {
            pageSize: this.state.pageSize,
            currentPage: this.state.currentPage
        });
        this.setState({ container: result.data });

        console.log('allUser run', this.state.container)
    }

    render() {
        const { loading, container, pageSize, currentPage } = this.state;
        // console.log('currentPage', currentPage)
        const { length: personCount } = this.state.container;

        const personArray = Paginate(container, currentPage, pageSize);
        return (
            <div className="Employee_mainDiv">
                {
                    // 로드 마스크
                    !loading && <div className="loadMaskDiv">
                        <img alt="Logind~" src={loadMask} className="loadMask"></img>
                    </div>
                }
                <div className="TopMiddle_div">
                    <div>
                        <h1 className="Employee_title">직원 현황</h1>
                    </div>

                    <div className="table_container">
                        <div className="status_row">
                            <span className="status_text">근태 현황</span>
                            <span className="status_MonthOrYear">
                                <span className="status_MonthOrYear_oval"></span>
                                <span className="status_MonthOrYear_text">월통계</span>
                            </span>
                        </div>
                        <div className="top_row">
                            <span style={{width: '9%'}}>순번</span>
                            <span style={{width: '21%'}}>이름</span>
                            <span style={{width: '12%'}}>사용 휴가</span>
                            <span style={{width: '12%'}}>지각</span>
                            <span style={{width: '12%'}}>야근</span>
                            <span style={{width: '12%'}}>총 휴가</span>
                            <span style={{width: '9%'}}>출근</span>
                        </div>
                        <div className="employee_vertical"></div>
                        <div className="employee_vertical-bold"></div>
                        <div>
                            {
                                personArray.map((data, i) => {
                                    return (
                                        <TableInfo key={i} 
                                            index={(i+1) + (currentPage-1) * pageSize} name={data.username} useVac={data.vac} tardy={data.tardy}
                                            onWork={data.onworktime} nightShift={data.nightshift} allVac='20'>
                                        </TableInfo>
                                    )
                                })
                            }
                        </div>
                        <Pagination 
                            personCount={personCount}   // 직원 수
                            pageSize={pageSize}         // 한 페이지당 최대 직원 수
                            currentPage={currentPage}   // 현재 페이지 번호
                            onPageChange={this.handlePageChange} // 페이지 변경 이벤트
                        ></Pagination>
                    </div>
                </div>
                <footer>
                    <img className="ground" src="/img/page3_bottom_ground.png" alt="ground"></img>
                    <img className="item1" src="/img/page3_bottom_item1.png" alt="item1"></img>
                    <img className="item2" src="/img/page3_bottom_item2.png" alt="item2"></img>
                </footer>
            </div>
        );
    }
}

export default Employee;