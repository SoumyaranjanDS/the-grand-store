module.exports = {
  apps: [
    {
      name: 'grandstore-backend',
      script: './server.js',
      cwd: '/var/www/grandstore-all/grand-store/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5015
      }
    }
  ]
};
