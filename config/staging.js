exports.config = {
  environment: 'staging',
  isStage: true,
  common: {
    database: {
      connectionString: process.env.DATABASE_URL
    }
  }
};
