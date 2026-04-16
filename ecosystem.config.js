module.exports = {
  apps: [
    {
      name: 'travel-tracker',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        LOG_LEVEL: 'warn',
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
