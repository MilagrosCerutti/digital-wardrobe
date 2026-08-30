import request from 'supertest';
import { createApp } from '@/app';

describe('GET /api/v1/health', () => {
  it('should return 200 with status ok', async () => {
    const app = createApp();

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('unknown routes', () => {
  it('should return 404 for an undefined route', async () => {
    const app = createApp();

    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});
