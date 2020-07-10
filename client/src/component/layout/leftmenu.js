import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class Leftmenu extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() { 
        const { backgoundChange, bar } = this.props;
        return (
            <div className="left-main">
                <div style={{marginTop:"71px"}}></div>
                <Link to="/" onClick={() => backgoundChange("#94d0f2", "#7ea4ef", "0")} >
                    <div style={bar === "0" ? {borderRight:"5px solid white", backgroundColor:"rgba(119, 117, 117, 0.2)"} : {}} className="left-img-div"><img src="/img/Menu1.png" alt="menu"></img></div>
                </Link>
                <Link to="/mypage" onClick={() => backgoundChange("#d3968e", "#6879d0", "1")} >
                    <div style={bar === "1" ? {borderRight:"5px solid white", backgroundColor:"rgba(119, 117, 117, 0.3)"} : {}} className="left-img-div"><img src="/img/Menu2.png" alt="menu"></img></div>
                </Link>
                <Link to="/grouppage" onClick={() => backgoundChange("#bca8c3", "#266197", "2")} >
                    <div style={bar === "2" ? {borderRight:"5px solid white", backgroundColor:"rgba(119, 117, 117, 0.4)"} : {}} className="left-img-div"><img src="/img/Menu3.png" alt="menu"></img></div>
                </Link>
                <Link to="/etc" onClick={() => backgoundChange("#4e4376", "#2b5876", "3")} >
                    <div style={bar === "3" ? {borderRight:"5px solid white", backgroundColor:"rgba(119, 117, 117, 0.3)"} : {}} className="left-img-div"><img src="/img/Menu4.png" alt="menu"></img></div>
                </Link>
            </div>
        );
    }
}
 
export default Leftmenu;