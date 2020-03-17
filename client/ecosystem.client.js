module.exports = {
  apps : [
    {
      name: 'ClientApp',
      script: './node_modules/react-scripts/scripts/start.js',
      ignore_watch : ["node_modules"],
      instances : 2,
      env: {
        "NODE_ENV": "development"
      },
      env_production: {
        "NODE_ENV": "production"
      },
      exec_mode : "cluster",
      time: true
    }
  ]
};
