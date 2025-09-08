module.exports = {
  apps: [
    {
      name: "expense-hub-client",
      script: "npm",
      args: "start",
      cwd: "/var/www/just-in-joy-coffee-co/expense-hub/client", // Update this path
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 6001,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
