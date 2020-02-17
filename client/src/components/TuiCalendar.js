import React from "react";
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

const moment = require('moment');

class TestCal extends React.Component {
    constructor(props) {
        super(props);
        this.calendarRef = React.createRef();
        this.state = {
            calendarDate : 'default'
        }
    }
  
    // ---------- Instance method ---------- //

    // 이전 달로 이동하는 버튼
    handleClickPrevButton = () => {
        const calendar = this.calendarRef.current.getInstance();
  
        calendar.prev();
        this.nowDate();
    };

    // 다음 달로 이동하는 버튼
    handleClickNextButton = () => {
        const calendar = this.calendarRef.current.getInstance();
  
        calendar.next();
        this.nowDate();
    };

    // 한 달 스케줄 보기
    monthChangeButton = () => {
        const calendar = this.calendarRef.current.getInstance();

        calendar.changeView('month', true);
    }

    // 한 주 스케줄 보기
    weekChangeButton = () => {
        const calendar = this.calendarRef.current.getInstance();

        calendar.changeView('week', true);
    }

    // 하루 스케줄 보기
    dayChangeButton = () => {
        const calendar = this.calendarRef.current.getInstance();

        calendar.changeView('day', true);
    }

    // 오늘 날짜로 돌아오기
    todayButton = () => {
        const calendar = this.calendarRef.current.getInstance();

        calendar.today();
        this.nowDate();
    }

    // 달력 현재 날짜 표시
    nowDate = () => {
        const calendar = this.calendarRef.current.getInstance();

        const date = calendar.getDate();
        const momentdate = moment(date._date).format('YYYY.MM')
        
        this.setState({
            calendarDate : momentdate
        })
        
    }


    // ---------- Event ---------- //

    // week 상태에서 요일 클릭
    handleClickDayname = (ev) => {
        console.group('onClickDayname');
        console.log(ev.date);
        console.groupEnd();
    };

    // 새로운 일정 생성 시 동작
    beforeCreateSchedule = (ev) => {
        console.log(ev);
    }

    componentDidMount() {
        this.nowDate();
    }

    render() {
        const { calendarDate } = this.state;
        //const selectedView = 'month';     // default view
          
        return (
            <>
                <div>
                    <button onClick={this.handleClickPrevButton}>Prev</button>
                    <button onClick={this.handleClickNextButton}>Next</button>
                    <button onClick={this.todayButton}>Today</button>
                    <button onClick={this.monthChangeButton}>Month</button>
                    <button onClick={this.weekChangeButton}>Week</button>
                    <button onClick={this.dayChangeButton}>Daily</button>
                    <span>{calendarDate}</span> {/** 달력 현재 월 표시 */}
                </div>
                <Calendar
                    height="900px"
                    ref={this.calendarRef}
                    onClickDayname={this.handleClickDayname}
                    onBeforeCreateSchedule={this.beforeCreateSchedule}
                    calendars={[

                    ]}
                    disableDblClick={true}
                    disableClick={false}
                    isReadOnly={false}
                    schedules={[

                    ]}
                    scheduleView
                    taskView
                    template={{
                        milestone(schedule) {
                        return `<span style="color:#fff;background-color: ${schedule.bgColor};">${
                            schedule.title
                        }</span>`;
                        },
                        milestoneTitle() {
                        return 'Milestone';
                        },
                        allday(schedule) {
                        return `${schedule.title}<i class="fa fa-refresh"></i>`;
                        },
                        alldayTitle() {
                        return 'All Day';
                        }
                    }}
                    theme='' // 어두운 테마 사용가능
                    timezones={[
                        {
                        timezoneOffset: 540,
                        displayLabel: 'GMT+09:00',
                        tooltip: 'Seoul'
                        }
                    ]}
                    useDetailPopup
                    useCreationPopup
                    view='month' // You can also set the `defaultView` option.
                    week={{
                        daynames: ['일', '월', '화', '수', '목', '금', '토'],
                        showTimezoneCollapseButton: true,
                        timezonesCollapsed: true
                    }}
                    month={{
                        daynames: ['일', '월', '화', '수', '목', '금', '토']
                        //narrowWeekend: true // 토, 일은 사이즈 작게
                    }}
                />
            </>
        );
    }
}

export default TestCal;