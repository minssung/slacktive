import React, { Component } from 'react';
import Card from './etccard';

class Etc extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }

    logout() {
        localStorage.removeItem("slacklogin");
        alert("로그아웃 되었습니다.");
        window.location.href = "/";
    }

    render() { 
        return (
            <div className="etc-main">
                <div className="etc-div">
                    <div className="etc-title">기타</div>
                    <div className="etc-boxs">
                        <Card color="linear-gradient(to top, #9fd3e3, #4484ff)" title="투표" content="참여하기" date={"마감일: 20-03-20 15:00"} />
                        <Card color="linear-gradient(to top, #b2a6ff, #7482ff)" title="주변 편의정보" content="보기" date={"마지막 업데이트: 20-03-01"} />
                    </div>
                    <div className="etc-guide">내 계정 및 앱 정보</div>
                    <div className="etc-guide-box">
                        <div className="etc-guide-margin">
                            <div className="etc-guide-title">
                                <div className="etc-guide-title-text">모바일 푸시알람 설정</div>
                                <div className="etc-guide-filter">
                                    <div className="etc-guide-circle"></div>
                                    <div className="etc-guide-filter-text">{"꺼짐"}</div>
                                </div>
                            </div>
                            <div className="etc-guide-version">
                                <div className="etc-guide-version-text">버전</div>
                                <div className="etc-guide-version-text">{"ver 1.5"}</div>
                            </div>
                            <div className="etc-guide-line"></div>
                            <div className="etc-guide-logout" onClick={this.logout.bind(this)}>로그아웃 하기</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default Etc;