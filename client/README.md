## React Client

### 디렉토리 구조도
- src 아래에 전체적 폴더 component
- component 아래에 각 기능별 폴더 ( css, 레이아웃용, 페이지용 )
- 모든 css를 base.js에서 할당 및 초기 데이터 axios 처리 후 데이터 props 처리
- react-router { switch } 를 통해 잘못된 url은 not-found 페이지 처리
- 특정 페이지에서 사용되는 팝업창의 경우 해당 폴더에 따로 컴포넌트화
- 페이지네이션을 처리할 유틸리티 폴더는 해당 폴더에서 따로 생성

```
src
 |-- component
        |--css
            |-- *.css
        |--layout
            |-- base.js
            |-- leftmenu.js
            |-- notFound.js
        |--page
            |-- etcpage
                    |-- etc.js
                    |-- etccard.js
            |-- grouppage
                    |-- utils
                          |-- Paginate.js
                    |-- groupItem.js
                    |-- grouppage.js
            |-- login
                    |-- login.js
            |-- main
                    |-- card.js
                    |-- cate.js
                    |-- confirm.js
                    |-- main.js
                    |-- partner.js
                    |-- partnerList.js
                    |--popup.js
                    |--tui.js
            |-- mypage
                    |-- history.js
                    |-- mycard.js
                    |-- mypage.js
                    |-- mypopup.js
                    |-- row.js
```