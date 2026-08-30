import request from 'supertest';
import { createApp } from '@/app';
import * as catalogRepository from '@/repositories/catalog.repository';
import * as dollItemRepository from '@/repositories/dollItem.repository';
import * as userRepository from '@/repositories/user.repository';
import { User } from '@/types/user.types';
import { DollItem } from '@/types/doll.types';
import { signAccessToken } from '@/utils/jwt';

jest.mock('@/repositories/catalog.repository');
jest.mock('@/repositories/dollItem.repository');
jest.mock('@/repositories/user.repository');

const mockedCatalogRepository = catalogRepository as jest.Mocked<typeof catalogRepository>;
const mockedDollItemRepository = dollItemRepository as jest.Mocked<typeof dollItemRepository>;
const mockedUserRepository = userRepository as jest.Mocked<typeof userRepository>;

const ADMIN_ID = 'aaaaaaaa-1111-4111-8111-111111111111';
const OTHER_USER_ID = 'bbbbbbbb-1111-4111-8111-111111111111';
const DOLL_ITEM_ID = 'cccccccc-1111-4111-8111-111111111111';
const ADMIN_TOKEN = signAccessToken({ sub: ADMIN_ID, role: 'ADMIN' });
const USER_TOKEN = signAccessToken({ sub: OTHER_USER_ID, role: 'USER' });
const CATEGORY_ID = '11111111-1111-4111-8111-111111111111';

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: OTHER_USER_ID,
    firstName: 'Mila',
    lastName: 'Cerutti',
    email: 'mila@example.com',
    passwordHash: 'stored-hash',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function buildDollItem(overrides: Partial<DollItem> = {}): DollItem {
  return {
    id: DOLL_ITEM_ID,
    name: 'Red Hat',
    category: 'ACCESSORY',
    layer: 3,
    assetUrl: 'accessory-bag',
    color: '#F2A7C3',
    isActive: true,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('Admin authorization (TR-003)', () => {
  it('rejects an unauthenticated request with 401', async () => {
    const response = await request(createApp()).get('/api/v1/admin/users');
    expect(response.status).toBe(401);
  });

  it('rejects a non-admin authenticated user with 403', async () => {
    const response = await request(createApp())
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${USER_TOKEN}`);

    expect(response.status).toBe(403);
  });

  it('allows an authenticated admin', async () => {
    mockedUserRepository.findAllUsers.mockResolvedValue([]);

    const response = await request(createApp())
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(response.status).toBe(200);
  });
});

describe('PATCH /api/v1/admin/users/:id/activate and /deactivate', () => {
  it('activates a user', async () => {
    mockedUserRepository.findUserById.mockResolvedValue(buildUser({ status: 'INACTIVE' }));
    mockedUserRepository.updateStatus.mockResolvedValue(buildUser({ status: 'ACTIVE' }));

    const response = await request(createApp())
      .patch(`/api/v1/admin/users/${OTHER_USER_ID}/activate`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.user.status).toBe('ACTIVE');
  });

  it('rejects an admin deactivating their own account', async () => {
    const response = await request(createApp())
      .patch(`/api/v1/admin/users/${ADMIN_ID}/deactivate`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(response.status).toBe(403);
    expect(mockedUserRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('allows an admin to deactivate another user', async () => {
    mockedUserRepository.findUserById.mockResolvedValue(buildUser());
    mockedUserRepository.updateStatus.mockResolvedValue(buildUser({ status: 'INACTIVE' }));

    const response = await request(createApp())
      .patch(`/api/v1/admin/users/${OTHER_USER_ID}/deactivate`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.user.status).toBe('INACTIVE');
  });
});

describe('POST /api/v1/admin/catalog/:type', () => {
  it('creates a category', async () => {
    mockedCatalogRepository.findSimpleEntryByName.mockResolvedValue(null);
    mockedCatalogRepository.createSimpleEntry.mockResolvedValue({
      id: CATEGORY_ID,
      name: 'Swimwear',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    const response = await request(createApp())
      .post('/api/v1/admin/catalog/categories')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ name: 'Swimwear' });

    expect(response.status).toBe(201);
    expect(response.body.category.name).toBe('Swimwear');
  });

  it('rejects an empty name', async () => {
    const response = await request(createApp())
      .post('/api/v1/admin/catalog/categories')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ name: '' });

    expect(response.status).toBe(400);
  });

  it('rejects a non-admin creating a catalog entry', async () => {
    const response = await request(createApp())
      .post('/api/v1/admin/catalog/categories')
      .set('Authorization', `Bearer ${USER_TOKEN}`)
      .send({ name: 'Swimwear' });

    expect(response.status).toBe(403);
  });

  it('creates a color with a valid hex', async () => {
    mockedCatalogRepository.findColorByName.mockResolvedValue(null);
    mockedCatalogRepository.createColor.mockResolvedValue({
      id: 'color-1',
      name: 'Teal',
      hex: '#008080',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    const response = await request(createApp())
      .post('/api/v1/admin/catalog/colors')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ name: 'Teal', hex: '#008080' });

    expect(response.status).toBe(201);
  });

  it('rejects an invalid hex format', async () => {
    const response = await request(createApp())
      .post('/api/v1/admin/catalog/colors')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ name: 'Teal', hex: 'not-a-hex' });

    expect(response.status).toBe(400);
  });

  it('creates an occasion with a valid formality hint', async () => {
    mockedCatalogRepository.findOccasionByName.mockResolvedValue(null);
    mockedCatalogRepository.createOccasion.mockResolvedValue({
      id: 'occasion-1',
      name: 'Brunch',
      formalityHint: 'CASUAL',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    const response = await request(createApp())
      .post('/api/v1/admin/catalog/occasions')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ name: 'Brunch', formalityHint: 'CASUAL' });

    expect(response.status).toBe(201);
  });
});

describe('PATCH /api/v1/admin/catalog/:type/:id/activate and /deactivate', () => {
  it('deactivates an existing category', async () => {
    mockedCatalogRepository.findAllSimpleEntries.mockResolvedValue([
      { id: CATEGORY_ID, name: 'Tops', isActive: true, createdAt: '', updatedAt: '' },
    ]);

    const response = await request(createApp())
      .patch(`/api/v1/admin/catalog/categories/${CATEGORY_ID}/deactivate`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(response.status).toBe(204);
    expect(mockedCatalogRepository.setCatalogEntryActive).toHaveBeenCalledWith('categories', CATEGORY_ID, false);
  });

  it('rejects an unknown catalog type', async () => {
    const response = await request(createApp())
      .patch(`/api/v1/admin/catalog/not-a-type/${CATEGORY_ID}/deactivate`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(response.status).toBe(400);
  });

  it('returns 404 for a catalog entry that does not exist', async () => {
    mockedCatalogRepository.findAllSimpleEntries.mockResolvedValue([]);

    const response = await request(createApp())
      .patch(`/api/v1/admin/catalog/categories/${CATEGORY_ID}/activate`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(response.status).toBe(404);
  });
});

describe('Doll item admin endpoints', () => {
  it('lists all doll items including inactive ones', async () => {
    mockedDollItemRepository.findAllDollItems.mockResolvedValue([buildDollItem({ isActive: false })]);

    const response = await request(createApp())
      .get('/api/v1/admin/doll-items')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.dollItems).toHaveLength(1);
  });

  it('creates a doll item', async () => {
    mockedDollItemRepository.createDollItem.mockResolvedValue(buildDollItem());

    const response = await request(createApp())
      .post('/api/v1/admin/doll-items')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ name: 'Red Hat', category: 'ACCESSORY', layer: 3, assetUrl: 'accessory-bag', color: '#F2A7C3' });

    expect(response.status).toBe(201);
  });

  it('rejects an invalid doll item category', async () => {
    const response = await request(createApp())
      .post('/api/v1/admin/doll-items')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ name: 'Red Hat', category: 'HAT', layer: 3, assetUrl: 'accessory-bag', color: '#F2A7C3' });

    expect(response.status).toBe(400);
  });

  it('edits a doll item', async () => {
    mockedDollItemRepository.findDollItemById.mockResolvedValue(buildDollItem());
    mockedDollItemRepository.updateDollItem.mockResolvedValue(buildDollItem({ layer: 5 }));

    const response = await request(createApp())
      .patch(`/api/v1/admin/doll-items/${DOLL_ITEM_ID}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ layer: 5 });

    expect(response.status).toBe(200);
    expect(response.body.dollItem.layer).toBe(5);
  });

  it('activates and deactivates a doll item', async () => {
    mockedDollItemRepository.findDollItemById.mockResolvedValue(buildDollItem());

    const response = await request(createApp())
      .patch(`/api/v1/admin/doll-items/${DOLL_ITEM_ID}/deactivate`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(response.status).toBe(204);
    expect(mockedDollItemRepository.setDollItemActive).toHaveBeenCalledWith(DOLL_ITEM_ID, false);
  });
});
