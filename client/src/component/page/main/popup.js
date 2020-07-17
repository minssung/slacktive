import React, { Component } from 'react';
import moment from 'moment';
import CloseIcon from '@material-ui/icons/Close';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { KeyboardDatePicker } from '@material-ui/pickers';
import SearchIcon from '@material-ui/icons/Search';

import Partner from './partner';
import PartnerList from './partnerList';
import Cate from './cate';

class Popup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cateClick : false,
            cateList : [
                { color : "#d6ff98", text : "출장/미팅" },
                { color : "#87dffa", text : "회의" },
                { color : "#b0c0ff", text : "생일" },
                { color : "#fff598", text : "휴가" },
                { color : "#ff98c3", text : "기타" },
            ],

            partnerArr : [],
        }
    }

    // 카테고리 클릭 시
    cateClick(text, color) {
        const { cateClick } = this.state;
        if(cateClick) { this.props.cateChange(text, color); }
        this.setState({ cateClick : cateClick ? false : true });
    }

    // 생성 혹은 업뎃 버튼 클릭 시
    btnClick() {
        const { title, endDate, startDate } = this.props;
        if(moment(endDate).diff(startDate, "days") <= -1) {
            alert("종료날짜는 시작날짜보다 앞에 있을 수 없습니다."); return;
        }
        if(!title) {
            alert("제목을 입력해주세요."); return;
        }
        if(this.props.open.create) {
            this.props.create();
        } else {
            this.props.update();
        }
    }

    // 파트너 인풋 값 변경 시
    onChangePartner(e) {
        const { partnerList, onChange } = this.props;
        onChange(e);
        if(!e.target.value) {
            this.setState({ partnerArr : [] });
            return;
        }

        this.setState({ partnerArr : partnerList.filter(data => {
            let regExp = new RegExp(`[${data.username}]`);
            return regExp.test(e.target.value) && data;
        })});
    }

    // 파트너 클릭 시
    onAddPartnerValue(e) {
        const { onAddPartner, onChangeDate } = this.props;
        onAddPartner(e);
        onChangeDate("partnerInput", "");
        this.setState({ partnerArr : [] });
    }

    render() { 
        const { 
            title,
            startDate, startTime, endDate, endTime, ingCheck,
            cate,
            partnerInput,
            partners,
            content,
            onChange, onChangeDate, onChangeCheck, onRemovePartner, 
            close, open
        } = this.props;
        const { cateClick, cateList, partnerArr } = this.state;
        return (
            <div className="popup-main" style={{display: open.view ? "flex" : "none"}}>
                <div className="popup-div">
                    <div className="popup-title">
                        <div className="popup-title-text">{"일정 등록하기"}</div>
                        <div className="popup-title-close"><CloseIcon onClick={() => close() } style={{cursor:"pointer", width:"30px", height:"30px"}} /></div>
                    </div>
                    <div className="popup-line"></div>
                    <div className="popup-box">

                        {/* 제목 라인 */}
                        <div className="popup-box-title">제목</div>
                        <input placeholder={cate.text === "휴가" ? "휴가/오후반차/병가 등 해당 내용만 적어주세요." : ""} name="title" value={title} onChange={(e) => onChange(e)} onPaste={(e) => onChange(e)} type="text" className="popup-box-title-input"></input>

                        {/* 날짜 입력 라인 */}
                        <div className="popup-box-date">
                            <div className="popup-box-date-start">시작일</div>
                            <div className="popup-box-date-start-time">시작 시간</div>
                        </div>
                        <div className="popup-box-date-div">
                            <KeyboardDatePicker
                                disableToolbar
                                format="yyyy. MM. dd"
                                margin="normal"
                                value={moment(startDate || new Date()).format()}
                                onChange={(e) => onChangeDate("startDate", e)}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                                style={{width:"160px", marginRight:"20px", marginTop: "-10px"}}
                            />
                            <TextField
                                type="time"
                                name="startTime"
                                onChange={(e) => onChange(e)}
                                value={startTime}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                style={{width:"160px", marginRight:"20px", marginTop: "-10px"}}
                            />
                            <div className="popup-box-date-none">
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            name="ingCheck" checked={ingCheck}
                                            onChange={((e) => onChangeCheck(e.target.checked))}
                                            style={{ width:"10px"}} color="primary" />
                                    }
                                    style={{marginTop: "-30px"}}
                                    label="종료일과 같음"
                                />
                            </div>
                        </div>
                        <div className="popup-box-date">
                            <div className="popup-box-date-start">종료일</div>
                            <div className="popup-box-date-start-time">종료 시간</div>
                        </div>
                        <div className="popup-box-date-div">
                            <KeyboardDatePicker
                                disableToolbar
                                disabled={ingCheck ? true : false}
                                format="yyyy. MM. dd"
                                margin="normal"
                                value={moment(endDate || new Date()).format()}
                                onChange={(e) => onChangeDate("endDate", e)}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                                style={{width:"160px", marginRight:"20px", marginTop: "-10px"}}
                            />
                            <TextField
                                disabled={ingCheck ? true : false}
                                type="time"
                                name="endTime"
                                onChange={(e) => onChange(e)}
                                value={endTime}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                style={{width:"160px", marginRight:"20px", marginTop: "-10px"}}
                            />
                        </div>

                        {/* 카테고리 라인 */}
                        <div className="popup-box-cate">카테고리</div>
                        <div className="popup-box-ab">
                            <div className="popup-box-cate-select">
                                {
                                    cateClick && open.create ?
                                    cateList.map((data,i) => {
                                        let size = !i ? "18px" : "15px";
                                        return <Cate 
                                            key={i} 
                                            color={data.color}
                                            text={data.text}
                                            size={size}
                                            first={!i ? true : false}
                                            click={this.cateClick.bind(this)}
                                        />
                                    })
                                    :
                                    <Cate 
                                        color={cate.color}
                                        text={cate.text}
                                        size={"18px"}
                                        first={true}
                                        click={this.cateClick.bind(this)}
                                    />
                                }
                            </div>
                        </div>

                        {/* 참여인원 라인 */}
                        <div className="popup-box-partner">참여인원</div>
                        <TextField
                            value={partnerInput}
                            name="partnerInput"
                            onChange={this.onChangePartner.bind(this)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                            style={{marginTop:"16px", width:"200px"}}
                        />
                        <div className="popup-box-partner-select">
                            <div className="popup-box-partner-list">
                                {
                                    partnerArr && partnerArr.map((data,i) => {
                                        return <PartnerList src={false} data={data} onClick={this.onAddPartnerValue.bind(this)} name={data.username} key={i} />
                                    })
                                }
                            </div>
                        </div>
                        <div className="popup-box-partner-box">
                            {
                                partners && partners.map((data,i) => {
                                    return <Partner  onRemovePartner={(e) => onRemovePartner(e)} data={data} key={i} name={data.username} src={false} />
                                })
                            }
                        </div>

                        {/* 메모 사항 라인 */}
                        <div className="popup-box-content">메모 사항</div>
                        <textarea name="content" value={content} onChange={(e) => onChange(e)} onPaste={(e) => onChange(e)} className="popup-box-textarea"></textarea>

                        <div className="popup-box-btn-div">
                            <button className="popup-box-btn" onClick={this.btnClick.bind(this)}>등록</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default Popup;