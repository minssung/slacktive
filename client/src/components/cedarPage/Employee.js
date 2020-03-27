import React , {Component} from 'react';
// import moment from 'moment';
import axios from 'axios';
import loadMask from '../../resource/loadmaskTest.gif'

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../devClient_config') : configs = require('../../client_config');

class Employee extends Component {
    constructor(props){
        super(props);
        this.state = {
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
        // 로드 마스크
        await this.setState({
            loading : "Loading",
        })
    }

    render() {
        const { loading } = this.state;           // 로드 마스크, 휴가 사용 내역, 오늘 날짜                                             // 휴가 사용 내역 중 오늘 날짜와 계산용
        return (
            <div className="Employee-mainDiv">
                {
                    // 로드 마스크
                    !loading && <div className="loadMaskDiv">
                        <img alt="Logind~" src={loadMask} className="loadMask"></img>
                    </div>
                }
                <div>
                    <h1>직원현황</h1>
                </div>
                <div className="container">

                </div>
                
            </div>
        );
    }
}

export default Employee;