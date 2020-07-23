import React from 'react';
import { Link } from 'react-router-dom';

export default function Leftmenu(props) {
    // () => backgoundChange("#d3968e", "#6879d0", "1")
    const { backgoundChange, bar } = props;
    return (
        <div className="left-main">
            <div className="left-margin"></div>
            <Link to="/" onClick={() => backgoundChange("#94d0f2", "#7ea4ef", "0")} className="left-link">
                <div className={bar === "0" ? "left-bar left-img-div" : "left-img-div"}><img src="/img/Menu1.png" alt="menu"></img></div>
            </Link>
            <div to="/mypage" onClick={() => alert("추후 업데이트 예정입니다.")} className="left-link">
                <div className={bar === "1" ? "left-bar left-img-div" : "left-img-div"}><img src="/img/Menu2.png" alt="menu"></img></div>
            </div>
            <Link to="/grouppage" onClick={() => backgoundChange("#bca8c3", "#266197", "2")} className="left-link">
                <div className={bar === "2" ? "left-bar left-img-div" : "left-img-div"}><img src="/img/Menu3.png" alt="menu"></img></div>
            </Link>
            <Link to="/etc" onClick={() => backgoundChange("#4e4376", "#2b5876", "3")} className="left-link">
                <div className={bar === "3" ? "left-bar left-img-div" : "left-img-div"}><img src="/img/Menu4.png" alt="menu"></img></div>
            </Link>
        </div>
    );
}