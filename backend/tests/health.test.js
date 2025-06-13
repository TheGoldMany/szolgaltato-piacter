const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('dbTime');
  });
});

describe('API Routes', () => {
  test('GET /api/auth/me without token should return 404 or 401', async () => {
    const response = await request(app)
      .get('/api/auth/me');
    
    // Ha 404, akkor nincs route, ha 401 akkor van de auth kell
    expect([404, 401]).toContain(response.status);
  });
});

// Clean up after tests
afterAll(async () => {
  // Close database connections if any
  const pool = require('../config/database');
  await pool.end();
});