module.exports = {
  apps: [
    {
      name: "expense-hub-backend",
      script: "dist/index.js",
      cwd: "/var/www/just-in-joy-coffee-co/expense-hub/backend", // Update this path
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 6000,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 8000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      // Pre-start script to ensure dependencies are installed and app is built
      pre_start: "npm run prod-start",
    },
  ],
};
