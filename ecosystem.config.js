module.exports = {
    apps: [
      {
        name: '6ad88b266b5aba5cf54eb09a--server',
        script: 'npm',
      interpreter: "/usr/local/bin/icod-sandbox-run",
      interpreter_args: ["/app/data/projects/6ad88b266b5aba5cf54eb09a"],
        args: 'start',
        cwd: './server',
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        time: true,
        max_memory_restart: '500M',
        exp_backoff_restart_delay: 100,
        min_uptime: 3000,
        max_restarts: 10,

      },
      {
        name: '6ad88b266b5aba5cf54eb09a--client',
        script: 'npm',
      interpreter: "/usr/local/bin/icod-sandbox-run",
      interpreter_args: ["/app/data/projects/6ad88b266b5aba5cf54eb09a"],
        args: 'start',
        cwd: './client',
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        time: true,
        max_memory_restart: '500M',
        exp_backoff_restart_delay: 100,
        min_uptime: 3000,
        max_restarts: 10,

      }
    ]
  };