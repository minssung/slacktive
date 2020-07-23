import React from 'react';
import CloseIcon from '@material-ui/icons/Close';

export default function Mypopup(props) {
    const { open, cardClick,
        viewData
    } = props;
    return (
        <div className="mypopup-main" style={{display : open ? "flex" : "none"}}>
            <div className="mypopup-div">
                <div className="mypopup-title-div">
                    <div className="mypopup-title-text">{"야근 내역"}</div>
                    <div className="mypopup-title-close"><CloseIcon onClick={() => cardClick(false, false)} style={{cursor:"pointer"}} /></div>
                </div>
                <div className="mypopup-title-guide">
                    <div className="mypopup-title-guide-date">{"날짜"}</div>
                    <div className="mypopup-title-guide-text">{"초과 근무시간"}</div>
                </div>
                <div className="mypopup-lines">
                    <div className="mypopup-line1"></div>
                    <div className="mypopup-line2"></div>
                    <div className="mypopup-line3"></div>
                </div>
            </div>
        </div>
    );
}