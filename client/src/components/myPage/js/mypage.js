import React , {Component} from 'react';
import '../css/mypage.css';

class mypage extends Component {
    constructor(props){
        super(props);
        this.state = {
            usertoken : null,
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
                        <div className="mypage-progressBarDiv">a</div>
                    </div>
                    <div className="mypage-DashDiv">
                        <div className="mypage-Dash">b</div>
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