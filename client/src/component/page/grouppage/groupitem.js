import React from 'react';

export default function Groupitem(props) {
    const { id, name, holiday, tardy, overtime, total, atten } = props;
    return (
        <div className="groupitem-main">
            <div className="groupitem-id">{id}</div>
            <div className="groupitem-name">{name}</div>
            <div className="groupitem-holiday">{holiday}</div>
            <div className="groupitem-tardy">{tardy}</div>
            <div className="groupitem-overtime">{overtime}</div>
            <div className="groupitem-total">{total}</div>
            <div className="groupitem-atten">{atten}</div>
        </div>
    )
}