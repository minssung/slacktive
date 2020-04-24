import React , {Component} from 'react';
import moment from 'moment';
import axios from 'axios';
import loadMask from '../../resource/loadmaskTest.gif';
import './css/Employee.css';
import TableInfo from './TableInfo';
import Pagination from './Pagination';
import { Paginate } from './utils/Paginate';
import _ from 'lodash';

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../devClient_config') : configs = require('../../client_config');

class Employee extends Component {
    constructor(props){
        super(props);
        this.state = {
            container : [],     // 직원 데이터
            pageSize : 11,       // 한 페이지당 들어가는 직원 데이터 수 (테스트용, 원래는 12로 해야함)
            currentPage : 1,    // 현재 보고있는 페이지
            loading : ''
        }
    }

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    }

    async componentDidMount(){
        // 직원 근태 현황 데이터 호출
        await this.allUser();
        // 로드 마스크
        this.setState({
            loading : "Loading",
        });
    }

    // 직원 근태 현황 불러오기
    async allUser() {
        const result = await axios.get(configs.domain+"/user/all");
        // console.log(result.data);

        const today = moment(new Date()).format('YYYY-MM');
        // 현재 날짜에서 다음 달 구하기
        const date = new Date();
        const onePlusMonth = date.setMonth(date.getMonth() + 1);
        const today2 = moment(onePlusMonth).format('YYYY-MM');

        let array = [];

        const apiStart = async() => {
            for (const data of result.data) {
                let vacationApi = axios.get(`${configs.domain}/calendar/vacation?cate=휴가&userid=${data.id}&time=${today}&time2=${today2}`);
                let halfVacationApi = axios.get(`${configs.domain}/calendar/halfVacation?userid=${data.id}&time=${today}&time2=${today2}`);
                let tardyApi = axios.get(`${configs.domain}/slack/stateload?state=지각&userid=${data.id}&time=${today}&time2=${today2}`);
                let onworkApi = axios.get(`${configs.domain}/slack/onwork?userid=${data.id}&time=${today}&time2=${today2}`);
                let NightShiftApi = axios.get(`${configs.domain}/slack/stateload?state=야근&userid=${data.id}&time=${today}&time2=${today2}`);
    
                await Promise.all([vacationApi,halfVacationApi,tardyApi,onworkApi,NightShiftApi]).then(val=>{
                    halfVacationApi = val[1].data.length/2;
                    vacationApi = val[0].data.length + halfVacationApi;
                    tardyApi = val[2].data.length;
                    onworkApi = val[3].data.length;
                    NightShiftApi = val[4].data.length;
                })
    
                array.push({
                    username : data.username,
                    vac : vacationApi,
                    tardy : tardyApi,
                    onworktime : onworkApi,
                    nightshift : NightShiftApi
                });
            }
            this.setState({container : array});
        }
        apiStart();
    }

    render() {
        const { loading, container, pageSize, currentPage } = this.state;
        const { length: personCount } = this.state.container;

        const personData = Paginate(container, currentPage, pageSize);
        console.log('현재 페이지의 배열', personData);

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
                                personData.map((data, i) => {
                                    return (
                                        <TableInfo key={i} 
                                            index={i+1} name={data.username} useVac={data.vac} tardy={data.tardy}
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