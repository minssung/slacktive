import React from 'react';

export default function ParnterList(props) {

    const onClickParnter = () => {
        props.onClick(props.data);
    }

    return (
        <div className="parnterlist-main" onClick={() => onClickParnter()}>
            <img className="partnerlist-img" src={props.src || "/img/developer.png"} alt="partner-list-img"></img>
            <div className="partnerlist-name">{props.name || "Empty User"}</div>
        </div>
    );
}