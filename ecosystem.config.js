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
      time: true
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
