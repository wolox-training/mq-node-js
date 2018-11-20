exports.config = {
  environment: 'staging',
  isStage: true,
  use_env_variable: 'DATABASE_URL',
  common: {
    port: process.env.PORT
  }
};