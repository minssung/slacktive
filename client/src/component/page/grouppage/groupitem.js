import React from 'react';

export default function Groupitem(props) {
    const { id, name, holiday, tardy, overtime, total, atten } = props;
    return (
        <>
            <tr className="grouppage-table-data">
                <td>{id}</td>
                <td style={{ textAlign: "left" }}>{name}</td>
                <td style={{ color:"#4ea9ff" }}>{holiday}</td>
                <td style={{ color:"#ff4d4d" }}>{tardy}</td>
                <td style={{ color: overtime ? "#f2994a" : "black" }}>{overtime}</td>
                <td>{total}</td>
                <td>{atten}</td>
            </tr>
            <tr className="grouppage-table-data-line-tr">
                <td colSpan="7" className="grouppage-table-data-line-td">
                    <div className="grouppage-table-data-line"></div>
                </td>
            </tr>
        </>
    )
}