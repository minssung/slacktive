module.exports = {
  apps : [
    {
      name: 'Server',
      script: './server/index.js',
      instances : 2,
      env: {
        "NODE_ENV": "development"
      },
      env_production: {
        "NODE_ENV": "production"
      },
      exec_mode : "cluster",
      time: true,
      watch : ["server"],
      ignore_watch : ["node_modules"],
      watch_options : {
        followSymlinks : false // false 경우 링크 참조를 따르고 링크의 경로를 통해 버블 링 이벤트를 수행하는 대신 심볼릭 링크 자체 만 변경 사항을 감시합니다.
      }
    },
    ]
};
