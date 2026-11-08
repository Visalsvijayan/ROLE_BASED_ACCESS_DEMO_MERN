// Loaded before every test file (see the "test" script in package.json).
// It gives the app valid settings WITHOUT needing a real .env file or database.
process.env.NODE_ENV = "test";
process.env.MONGO_URI = process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/mern_rbac_test";
process.env.JWT_ACCESS_SECRET = "test-access-secret-test-access-secret-0123456789";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-test-refresh-secret-0123456789";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.BCRYPT_ROUNDS = "4"; // fast hashing in tests
