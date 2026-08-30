import request from 'supertest';
import { createApp } from '@/app';
import * as catalogRepository from '@/repositories/catalog.repository';
import { signAccessToken } from '@/utils/jwt';

jest.mock('@/repositories/catalog.repository');

const mockedRepository = catalogRepository as jest.Mocked<typeof catalogRepository>;
const AUTH_TOKEN = signAccessToken({ sub: 'user-1', role: 'USER' });

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/v1/catalog', () => {
  it('should require authentication', async () => {
    const response = await request(createApp()).get('/api/v1/catalog');
    expect(response.status).toBe(401);
  });

  it('should return the full catalog for an authenticated user', async () => {
    mockedRepository.findFullCatalog.mockResolvedValue({
      categories: [{ id: 'cat-1', name: 'Tops', isActive: true, createdAt: '', updatedAt: '' }],
      subcategories: [],
      materials: [],
      patterns: [],
      colors: [],
      styles: [],
      occasions: [],
    });

    const response = await request(createApp())
      .get('/api/v1/catalog')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.categories).toHaveLength(1);
    expect(response.body).toHaveProperty('subcategories');
    expect(response.body).toHaveProperty('materials');
    expect(response.body).toHaveProperty('patterns');
    expect(response.body).toHaveProperty('colors');
    expect(response.body).toHaveProperty('styles');
    expect(response.body).toHaveProperty('occasions');
  });
});
