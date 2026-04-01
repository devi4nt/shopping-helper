module.exports = {
  apps: [{
    name: "shopping-helper",
    script: ".output/server/index.mjs",
    cwd: "/home/merry.earth/_repos/shopping-helper",
    node_args: "--env-file=.env",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
  }],
};
