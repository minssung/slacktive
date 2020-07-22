import React from 'react';

export default function Card(props) {
    return (
        <div className="card-index">
            <div className="card-border"></div>
            <div className="card-box">
                <div className="card-top">
                    <div className="card-title">{props.title || "제목이 없습니다."}</div>
                    <div>
                        <img src={props.src || "/img/developer.png"} alt="img" className="card-img"></img>
                    </div>
                </div>
                <div className="card-member">
                    {
                        props.partner ? props.partner[0] &&
                        props.partner.map((data,i) => {
                            let array = data.username;
                            return <span key={i}>{array}&nbsp;</span>
                        })
                        :
                        "참여인원이 없습니다."
                    }
                </div>
                <div className="card-date">{props.date || "날짜가 없습니다."}</div>
            </div>
        </div>
    );
}