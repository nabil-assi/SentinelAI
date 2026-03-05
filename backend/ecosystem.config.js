module.exports = {
  apps: [{
    name: 'security-api',
    script: 'dist/app.js',
    instances: 4,          // 4 instances
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};