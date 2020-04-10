import React , {Component} from 'react';
import moment from 'moment';
import axios from 'axios';
import loadMask from '../../resource/loadmaskTest.gif';
import './css/Employee.css';
import TableInfo from './TableInfo';

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../devClient_config') : configs = require('../../client_config');

class Employee extends Component {
    constructor(props){
        super(props);
        this.state = {
            container : [],
        }
    }
    async componentDidMount(){
        // 유저 토큰 값
        await this.setState({
            usertoken : await this.props.Token
        })
        const { usertoken } = this.state;
        // 로드 마스크
        await this.setState({
            loading : "Loading",
        });
        this.allUser();
    }
    // 직원 근태 현황 불러오기
    async allUser() {
        const result = await axios.get(configs.domain+"/user/all");
        const today = moment(new Date()).format('YYYY-MM');
        // 현재 날짜에서 다음 달 구하기
        const date = new Date();
        const onePlusMonth = date.setMonth(date.getMonth() + 1);
        const today2 = moment(onePlusMonth).format('YYYY-MM');

        let array = [];
        
        result.data.forEach(async(data)=>{
            let vacationApi = axios.get(`${configs.domain}/calendar/vacation?cate=휴가&userid=${data.id}&time=${today}&time2=${today2}`);
            let halfVacationApi = axios.get(`${configs.domain}/calendar/halfVacation?userid=${data.id}&time=${today}&time2=${today2}`);
            let tardyApi = axios.get(`${configs.domain}/slack/tardy?userid=${data.id}&time=${today}&time2=${today2}`);
            let onworkApi = axios.get(`${configs.domain}/slack/onwork?userid=${data.id}&time=${today}&time2=${today2}`);

            await Promise.all([vacationApi,halfVacationApi,tardyApi,onworkApi]).then(val=>{
                halfVacationApi = val[1].data.length/2;
                vacationApi = val[0].data.length + halfVacationApi;
                tardyApi = val[2].data.length;
                onworkApi = val[3].data.length;
            })

            array.push({
                username : data.username,
                vac : vacationApi,
                tardy : tardyApi,
                onworktime : onworkApi
            });
        })
        console.log(array);

        await this.setState({container : array})
        
        // const resultUser = await Promise.all(result.data.map(async(data, i) => {
        //     const today = moment(new Date()).format('YYYY-MM');
        //     const vacationApi = await axios.get(`${configs.domain}/calendar/vacation?cate=휴가&userid=${data.id}&time=${today}`);
        //     const halfVacationApi = await axios.get(`${configs.domain}/calendar/halfVacation?userid=${data.id}&time=${today}`);
        //     const tardyApi = await axios.get(`${configs.domain}/slack/tardy?userid=${data.id}&time=${today}`);
        //     const onworkApi = await axios.get(`${configs.domain}/slack/onwork?userid=${data.id}&time=${today}`);

        //     // 사용 휴가 체크
        //     const halfVac = halfVacationApi.data.length/2;
        //     const vac = vacationApi.data.length+halfVac;
        //     // 지각 체크
        //     const tardy = tardyApi.data.length;
        //     // 출근 체크
        //     const onwork = onworkApi.data.length;

        //     // const plus = [data].concat(vac,tardy,onwork)

        //     return (
        //         // plus
        //         // console.log(plus)
        //         // console.log(data),
        //         // console.log(data.username, '사용 휴가', vac),
        //         // console.log(data.username, '지각', tardy),
        //         // console.log(data.username, '출근', onwork)
        //         null
        //     )
        // }));
        // await this.setState({
        //     container : resultUser
        // })

        // console.log('resultUser', resultUser);
    }

    render() {
        const { loading, container } = this.state;           // 로드 마스크
        // console.log('container', container);
        return (
            <div className="Employee-mainDiv">
                {
                    // 로드 마스크
                    !loading && <div className="loadMaskDiv">
                        <img alt="Logind~" src={loadMask} className="loadMask"></img>
                    </div>
                }
                <div>
                    <h1 className="Employee_title">직원현황</h1>
                </div>

                <table className="container">
                    <thead>
                        <tr>
                            <td>순번</td>
                            <td>이름</td>
                            <td>사용 휴가</td>
                            <td>지각</td>
                            <td>야근</td>
                            <td>총 휴가</td>
                            <td>출근</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            container.map((data, i) => {
                                    console.log(data)
                                    return <TableInfo key={i} 
                                    index={i+1} name={data.username} useVac={data.vac} tardy={data.tardy}
                                    onWork={data.onworktime}></TableInfo>
                            })
                        }
                    </tbody>
                        
                </table>
                
                
            </div>
        );
    }
}

export default Employee;