module.exports = {
  apps : [
    {
      name: 'ClientApp',
      script: './node_modules/react-scripts/scripts/start.js',
      watch : ["client"],
      ignore_watch : ["node_modules"],
      watch_options : {
        followSymlinks : false // false 경우 링크 참조를 따르고 링크의 경로를 통해 버블 링 이벤트를 수행하는 대신 심볼릭 링크 자체 만 변경 사항을 감시합니다.
      },
      instances : 1,
      env: {
        "NODE_ENV": "development"
      },
      exec_mode : "cluster",
      time: true
    }
  ]
};
