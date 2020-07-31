import React, { useState } from 'react';
import moment from 'moment';
import CloseIcon from '@material-ui/icons/Close';
import Pagination from '@material-ui/lab/Pagination';

import Row from './row';

export default function Mypopup(props) {
    const item = 10;
    const [ page, setPage ] = useState(1);

    const { open, cardClick, num, data
    } = props;
    return (
        <div className="mypopup-main" style={{display : open.num === num && open.view ? "flex" : "none"}}>
            <div className="mypopup-div">
                <div className="mypopup-title-div">
                    <div className="mypopup-title-text">{data.title || "제목없음"}</div>
                    <div className="mypopup-title-close"><CloseIcon onClick={() => cardClick(false, false)} style={{cursor:"pointer"}} /></div>
                </div>
                <div className="mypopup-title-guide">
                    <div className="mypopup-title-guide-date">{"날짜(월)"}</div>
                    <div className="mypopup-title-guide-text">{data.text || "구분없음"}</div>
                </div>
                <div className="mypopup-lines">
                    <div className="mypopup-line1"></div>
                    <div className="mypopup-line2"></div>
                    <div className="mypopup-line3"></div>
                </div>

                <div className="mypopup-content">
                    {
                        data.row[0] ? data.row.map((value,i) => {
                            if(((page - 1) * item) <= i && i < item * page) {
                                const _data = value.date ? moment(value.date).format("YYYY년 M월") : moment(value.time).format("YYYY. M. D (ddd)");
                                const _row = value.date ? value.state + "회" : moment(value.time).format("HH시 mm분");
                                return <Row 
                                    key={i} 
                                    date={_data} 
                                    rowData={_row} 
                                    notData={"없음"} 
                                />
                            } else return null;
                        }) 
                        :
                        <div className="mypopup-null">데이터가 없습니다.</div>
                    }
                </div>

                <div className="mypopup-pagination">
                    <Pagination count={Math.ceil(data.row.length / 10)} color="primary" onChange={(e, n) => setPage(n) } />
                </div>
            </div>
        </div>
    );
}