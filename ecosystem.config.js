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
    // {
    //   name: 'Scheduler',
    //   script: './server/index.js',
    //   watch: ["server", "client"],
    //   watch_delay: 2000,
    //   ignore_watch : ["node_modules"],
    //   instances : 1,
    //   instance_var : 'Second',
    //   env: {
    //     "NODE_ENV": "development"
    //   },
    //   exec_mode : "cluster",
    //   wait_ready: true, // Node.js 앱으로부터 앱이 실행되었다는 신호를 직접 받겠다는 의미
    //   listen_timeout: 50000, // 앱 실행 신호까지 기다릴 최대 시간. ms 단위.
    //   kill_timeout: 5000, // 새로운 프로세스 실행이 완료된 후 예전 프로세스를 교체하기까지 기다릴 시간
    //   time: true
    // }
    ]
};
