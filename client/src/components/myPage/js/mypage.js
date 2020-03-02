import React , {Component} from 'react';
import '../css/mypage.css';

class mypage extends Component {
    constructor(props){
        super(props);
        this.state = {
            usertoken : null,
            late : []
        }
    }
    async componentDidMount(){
        await this.setState({
            usertoken : await this.props.Token
        })
    }

    render() {
        return (
            <div className="mypage-mainDiv">
                <div className="mypage-upDiv">
                    <div className="mypage-progDiv">
                        <span>내 현황</span>
                        <div></div>
                    </div>
                    <div className="mypage-DashDiv">
                        <div className="mypage-Dash">
                            <div>지각 횟수</div>
                            <div>없음</div>
                            <div>지난달보다 2회 감소</div>
                        </div>
                        <div className="mypage-Dash">c</div>
                        <div className="mypage-Dash">d</div>
                        <div className="mypage-Dash">e</div>
                    </div>
                </div>
                <div className="mypage-downDiv">
                    asd
                </div>
            </div>
        );
    }
}

export default mypage;