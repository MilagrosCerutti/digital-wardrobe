import * as adminService from '@/services/admin.service';
import * as catalogRepository from '@/repositories/catalog.repository';
import * as dollItemRepository from '@/repositories/dollItem.repository';
import * as userRepository from '@/repositories/user.repository';
import { User } from '@/types/user.types';
import { DollItem } from '@/types/doll.types';
import { CatalogEntry, Color, Occasion, Subcategory } from '@/types/catalog.types';

jest.mock('@/repositories/catalog.repository');
jest.mock('@/repositories/dollItem.repository');
jest.mock('@/repositories/user.repository');

const mockedCatalogRepository = catalogRepository as jest.Mocked<typeof catalogRepository>;
const mockedDollItemRepository = dollItemRepository as jest.Mocked<typeof dollItemRepository>;
const mockedUserRepository = userRepository as jest.Mocked<typeof userRepository>;

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
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

function buildCatalogEntry(overrides: Partial<CatalogEntry> = {}): CatalogEntry {
  return { id: 'entry-1', name: 'Tops', isActive: true, createdAt: '', updatedAt: '', ...overrides };
}

function buildDollItem(overrides: Partial<DollItem> = {}): DollItem {
  return {
    id: 'doll-item-1',
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

describe('admin.service users', () => {
  it('lists users without exposing password hashes', async () => {
    mockedUserRepository.findAllUsers.mockResolvedValue([buildUser()]);

    const users = await adminService.listUsers();

    expect(users[0]).not.toHaveProperty('passwordHash');
  });

  it('activates a user', async () => {
    mockedUserRepository.findUserById.mockResolvedValue(buildUser({ status: 'INACTIVE' }));
    mockedUserRepository.updateStatus.mockResolvedValue(buildUser({ status: 'ACTIVE' }));

    const user = await adminService.activateUser('user-1');

    expect(user.status).toBe('ACTIVE');
    expect(mockedUserRepository.updateStatus).toHaveBeenCalledWith('user-1', 'ACTIVE');
  });

  it('throws NotFoundError activating a user that does not exist', async () => {
    mockedUserRepository.findUserById.mockResolvedValue(null);

    await expect(adminService.activateUser('missing')).rejects.toMatchObject({ statusCode: 404 });
    expect(mockedUserRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('deactivates another user', async () => {
    mockedUserRepository.findUserById.mockResolvedValue(buildUser({ id: 'user-2' }));
    mockedUserRepository.updateStatus.mockResolvedValue(buildUser({ id: 'user-2', status: 'INACTIVE' }));

    const user = await adminService.deactivateUser('admin-1', 'user-2');

    expect(user.status).toBe('INACTIVE');
  });

  it('prevents an admin from deactivating their own account', async () => {
    await expect(adminService.deactivateUser('admin-1', 'admin-1')).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(mockedUserRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('allows an admin to deactivate another admin', async () => {
    mockedUserRepository.findUserById.mockResolvedValue(buildUser({ id: 'admin-2', role: 'ADMIN' }));
    mockedUserRepository.updateStatus.mockResolvedValue(
      buildUser({ id: 'admin-2', role: 'ADMIN', status: 'INACTIVE' }),
    );

    const user = await adminService.deactivateUser('admin-1', 'admin-2');

    expect(user.status).toBe('INACTIVE');
  });
});

describe('admin.service catalog', () => {
  it('creates a simple catalog entry (category)', async () => {
    mockedCatalogRepository.findSimpleEntryByName.mockResolvedValue(null);
    mockedCatalogRepository.createSimpleEntry.mockResolvedValue(buildCatalogEntry({ name: 'Swimwear' }));

    const category = await adminService.createCategory('Swimwear');

    expect(category.name).toBe('Swimwear');
    expect(mockedCatalogRepository.createSimpleEntry).toHaveBeenCalledWith('categories', 'Swimwear');
  });

  it('rejects a duplicate simple catalog entry name', async () => {
    mockedCatalogRepository.findSimpleEntryByName.mockResolvedValue(buildCatalogEntry({ name: 'Tops' }));

    await expect(adminService.createCategory('Tops')).rejects.toMatchObject({ statusCode: 409 });
    expect(mockedCatalogRepository.createSimpleEntry).not.toHaveBeenCalled();
  });

  it('creates a subcategory under a valid category', async () => {
    mockedCatalogRepository.findAllSimpleEntries.mockResolvedValue([buildCatalogEntry({ id: 'cat-1' })]);
    mockedCatalogRepository.findSubcategoryByCategoryAndName.mockResolvedValue(null);
    const created: Subcategory = { ...buildCatalogEntry({ name: 'Sandals' }), categoryId: 'cat-1' };
    mockedCatalogRepository.createSubcategory.mockResolvedValue(created);

    const subcategory = await adminService.createSubcategory({ name: 'Sandals', categoryId: 'cat-1' });

    expect(subcategory.categoryId).toBe('cat-1');
  });

  it('rejects a subcategory under an unknown category', async () => {
    mockedCatalogRepository.findAllSimpleEntries.mockResolvedValue([]);

    await expect(
      adminService.createSubcategory({ name: 'Sandals', categoryId: 'missing-cat' }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockedCatalogRepository.createSubcategory).not.toHaveBeenCalled();
  });

  it('rejects a duplicate subcategory within the same category', async () => {
    mockedCatalogRepository.findAllSimpleEntries.mockResolvedValue([buildCatalogEntry({ id: 'cat-1' })]);
    mockedCatalogRepository.findSubcategoryByCategoryAndName.mockResolvedValue({
      ...buildCatalogEntry({ name: 'Sandals' }),
      categoryId: 'cat-1',
    });

    await expect(
      adminService.createSubcategory({ name: 'Sandals', categoryId: 'cat-1' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('creates a color', async () => {
    mockedCatalogRepository.findColorByName.mockResolvedValue(null);
    const created: Color = { ...buildCatalogEntry({ name: 'Teal' }), hex: '#008080' };
    mockedCatalogRepository.createColor.mockResolvedValue(created);

    const color = await adminService.createColor({ name: 'Teal', hex: '#008080' });

    expect(color.hex).toBe('#008080');
  });

  it('creates an occasion', async () => {
    mockedCatalogRepository.findOccasionByName.mockResolvedValue(null);
    const created: Occasion = { ...buildCatalogEntry({ name: 'Brunch' }), formalityHint: 'CASUAL' };
    mockedCatalogRepository.createOccasion.mockResolvedValue(created);

    const occasion = await adminService.createOccasion({ name: 'Brunch', formalityHint: 'CASUAL' });

    expect(occasion.formalityHint).toBe('CASUAL');
  });

  it('activates a catalog entry that exists', async () => {
    mockedCatalogRepository.findAllSimpleEntries.mockResolvedValue([buildCatalogEntry({ id: 'cat-1' })]);

    await adminService.setCatalogEntryActive('categories', 'cat-1', true);

    expect(mockedCatalogRepository.setCatalogEntryActive).toHaveBeenCalledWith('categories', 'cat-1', true);
  });

  it('rejects activating a catalog entry that does not exist', async () => {
    mockedCatalogRepository.findAllSimpleEntries.mockResolvedValue([]);

    await expect(adminService.setCatalogEntryActive('categories', 'missing', true)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mockedCatalogRepository.setCatalogEntryActive).not.toHaveBeenCalled();
  });

  it('rejects an unknown catalog type', () => {
    expect(() => adminService.assertKnownCatalogType('not-a-type')).toThrow();
  });
});

describe('admin.service doll items', () => {
  it('lists all doll items', async () => {
    mockedDollItemRepository.findAllDollItems.mockResolvedValue([buildDollItem({ isActive: false })]);

    const items = await adminService.listDollItems();

    expect(items).toHaveLength(1);
  });

  it('creates a doll item', async () => {
    mockedDollItemRepository.createDollItem.mockResolvedValue(buildDollItem());

    const item = await adminService.createDollItem({
      name: 'Red Hat',
      category: 'ACCESSORY',
      layer: 3,
      assetUrl: 'accessory-bag',
      color: '#F2A7C3',
    });

    expect(item.name).toBe('Red Hat');
  });

  it('updates an existing doll item', async () => {
    mockedDollItemRepository.findDollItemById.mockResolvedValue(buildDollItem());
    mockedDollItemRepository.updateDollItem.mockResolvedValue(buildDollItem({ layer: 5 }));

    const item = await adminService.updateDollItem('doll-item-1', { layer: 5 });

    expect(item.layer).toBe(5);
  });

  it('rejects updating a doll item that does not exist', async () => {
    mockedDollItemRepository.findDollItemById.mockResolvedValue(null);

    await expect(adminService.updateDollItem('missing', { layer: 5 })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('rejects (de)activating a doll item that does not exist', async () => {
    mockedDollItemRepository.findDollItemById.mockResolvedValue(null);

    await expect(adminService.setDollItemActive('missing', false)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
