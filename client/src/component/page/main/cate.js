import React, { Component } from 'react';

class Cate extends Component {
    render() { 
        const { color, size, text, first, click } = this.props;
        return (
            <div className="popup-box-cate-box" onClick={() => click(text, color) }>
                <div className="popup-box-cate-circle" style={{backgroundColor: color }}></div>
                <div className="popup-box-cate-text" style={{fontSize: size }}>{text}</div>
                { first && <img src="/img/arrow.png" alt="img" className="popup-box-cate-arrow"></img> }
            </div>
        );
    }
}
 
export default Cate;