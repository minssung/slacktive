# Slack Program Project
- Slack Api  
- Sign In With Slack  
- TOAST UI : TUi-Calendar(nhn)  
- React, Node-Express  
- Redis, Mysql, MongoDB(agenda) 
- Agenda, Pm2(process manager), JWT, Sequelize  
- Docker(delete), Ubuntu(aws)  
- react-router
- moment / axios

```js
npm init -y
npm i --save express

mkdir server ... cd server ... touch index.js
npx create-react-app client
```

## Visual  
![HOME](/client/public/img/md_visual1.JPG)  
Home 화면 - 당일 휴가자 및 지각자 확인 가능하고, 이달의 일정을 보여준다. 달력으로 일정 추가 및 수정 가능.
***
![MYPAGE](/client/public/img/md_visual2.JPG)  
Mypage 화면 - 현재 남은 휴가를 주스로 표현하였고, 나의 출근, 지각, 야근에 대한 기록을 확인할 수 있다.
***
![EMPLOYEE](/client/public/img/md_visual3.JPG)  
Employee 화면 - 직원들의 근태 현황을 볼 수 있다.
***

## 현재 프로젝트 리펙토링 계획중에 있으며, 다른 깃 레파지토리에서 새로 작업이 진행될 예정입니다.

## 어떤 기능을 하는지 ?

- 슬랙에 지정한 채널 두가지에 한해, 정규식에 일치하는 내용을 추출
- 가져온 내용을 데이터베이스에 저장 ( 아젠다를 이용하여 매 시간마다 체크 )
- 데이터베이스의 내용과 클라이언트의 TUI 캘린더와 연결하여 데이터를 보여줌
- 클라이언트의 캘린더에서도 일정 및 휴가를 생성/수정/삭제가 가능
- 슬랙에서 가져온 내용을 통계 처리하여 마이페이지에 출력 ( 휴가, 출퇴근, 야근, 지각 등.. )
- 슬랙에 있는 인원들의 간단한 통계를 전체적으로 표시
- 기타 부가적인 기능들을 추가 ( 투표, 지도, 알림 설정 등 ) ( - 진행 중 - )

## 어떻게 사용하는지 ?

- 현재는 테스트 단계로 지정된 슬랙 팀과 채널 및 지정된 정규식만 처리 가능
- 초기 로그인 화면에서 슬랙을 통한 로그인 진행
- 4개의 페이지 ( 메인 및 달력 / 마이페이지 / 그룹 통계 페이지 / 기타 옵션 페이지 )
- 주 기능 ( 메인 및 달력 ) => 원하는 날짜를 클릭하여 나온 팝업에서 일정 및 휴가 등록
- 등록된 일정 및 휴가 확인 -> 수정 / 삭제
- 일정 등록 수정 삭제 시 지정된 슬랙 개인 채널에 메시지 POST
- 네번째 페이지에서 로그아웃 버튼을 통해 종료
