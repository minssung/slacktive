import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import moment from 'moment';

export default function Confirm(props) {
    const { click, title, startDate, startTime, endDate, endTime, cate, partners, content, openChange, close, deleted, id, cid, state } = props;
    return (
        <div className="confirm-main" style={{display : click ? "flex" : "none"}}>
            <div className="confirm-box">
                <div className="confirm-box-top">
                    <div className="confirm-box-top-text">일정 확인</div>
                    <div className="confirm-box-close"><CloseIcon onClick={() => close()} style={{}} /></div>
                </div>
                <div className="confirm-box-line"></div>
                <div className="confirm-margin">
                    <div className="confirm-box-title">제목</div>
                    <div className="confirm-box-title-text">{title}</div>
                    <div className="confirm-box-title">시간</div>
                    <div className="confirm-box-title-text">{
                        moment(startDate).format("YYYY. M. D (ddd) ") +
                        (startTime && startTime) + " ~ " +
                        moment(endDate).format("YYYY. M. D (ddd) ") + 
                        (endTime && endTime)
                    }</div>
                    <div className="confirm-box-title">카테고리</div>
                    <div className="confirm-box-cate-div">
                        <div className="confirm-box-cate-circle" style={{backgroundColor: cate.color}}></div>
                        <div className="confirm-box-cate-text">{cate.text}</div>
                    </div>
                    <div className="confirm-box-title">참여인원</div>
                    <div className="popup-box-partner-box">
                        {
                            partners && partners.map((data,i) => {
                                return <div className="confirm-box-partner-div" key={i}>
                                    <img src={"/img/developer.png"} alt="img" className="confirm-box-partner-img"></img>
                                    <div className="confirm-box-partner-name">{data.username}</div>
                                </div>
                            })
                        }
                    </div>
                    <div className="confirm-box-title" style={{marginTop:"12px"}}>메모 사항</div>
                    <div className="confirm-box-title-text-pre">{content}</div>
                    {
                        state &&
                        <div className="confirm-box-btns">
                            <div className="confirm-box-update" onClick={() => openChange()}>수정</div>
                            <div className="confirm-box-delete" onClick={() => deleted(id, cid)}>삭제</div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}