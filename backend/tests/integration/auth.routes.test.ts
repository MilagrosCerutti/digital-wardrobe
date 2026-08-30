import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createApp } from '@/app';
import * as userRepository from '@/repositories/user.repository';
import * as dollRepository from '@/repositories/doll.repository';
import { User } from '@/types/user.types';
import { signAccessToken } from '@/utils/jwt';
import { env } from '@/config/environment';

jest.mock('@/repositories/user.repository');
jest.mock('@/repositories/doll.repository');

const mockedRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockedDollRepository = dollRepository as jest.Mocked<typeof dollRepository>;

beforeEach(() => {
  mockedDollRepository.createDollForUser.mockResolvedValue({
    id: 'doll-1',
    userId: 'user-1',
    bodyType: 'AVERAGE',
    skinTone: 'MEDIUM',
    hairStyle: 'LONG',
    hairColor: 'BROWN',
    eyeColor: 'BROWN',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  });
});

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    firstName: 'Mila',
    lastName: 'Cerutti',
    email: 'mila@example.com',
    passwordHash: 'stored-hash',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('POST /api/v1/auth/register', () => {
  it('should register a new user and return a token', async () => {
    mockedRepository.findUserByEmail.mockResolvedValue(null);
    mockedRepository.createUser.mockImplementation(async (input) =>
      buildUser({ email: input.email, passwordHash: input.passwordHash }),
    );

    const response = await request(createApp()).post('/api/v1/auth/register').send({
      firstName: 'Mila',
      lastName: 'Cerutti',
      email: 'mila@example.com',
      password: 'supersecret1',
    });

    expect(response.status).toBe(201);
    expect(response.body.user).not.toHaveProperty('passwordHash');
    expect(response.body).toHaveProperty('token');
  });

  it('should reject invalid input before reaching the service', async () => {
    const response = await request(createApp()).post('/api/v1/auth/register').send({
      firstName: '',
      lastName: 'Cerutti',
      email: 'not-an-email',
      password: 'short',
    });

    expect(response.status).toBe(400);
    expect(mockedRepository.findUserByEmail).not.toHaveBeenCalled();
  });

  it('should reject a duplicate email with 409', async () => {
    mockedRepository.findUserByEmail.mockResolvedValue(buildUser());

    const response = await request(createApp()).post('/api/v1/auth/register').send({
      firstName: 'Mila',
      lastName: 'Cerutti',
      email: 'mila@example.com',
      password: 'supersecret1',
    });

    expect(response.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('should authenticate valid credentials', async () => {
    const passwordHash = await bcrypt.hash('correct-password1', 10);
    mockedRepository.findUserByEmail.mockResolvedValue(buildUser({ passwordHash }));

    const response = await request(createApp())
      .post('/api/v1/auth/login')
      .send({ email: 'mila@example.com', password: 'correct-password1' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('should return 401 for invalid credentials', async () => {
    mockedRepository.findUserByEmail.mockResolvedValue(null);

    const response = await request(createApp())
      .post('/api/v1/auth/login')
      .send({ email: 'unknown@example.com', password: 'whatever1' });

    expect(response.status).toBe(401);
  });

  it('should not expose the password hash in an error path either', async () => {
    mockedRepository.findUserByEmail.mockResolvedValue(null);

    const response = await request(createApp())
      .post('/api/v1/auth/login')
      .send({ email: 'unknown@example.com', password: 'whatever1' });

    expect(JSON.stringify(response.body)).not.toMatch(/passwordHash|stored-hash/);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('should return 401 when no token is provided', async () => {
    const response = await request(createApp()).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
  });

  it('should return 401 for an invalid token', async () => {
    const response = await request(createApp())
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(response.status).toBe(401);
  });

  it('should return 401 for an expired token', async () => {
    const expiredToken = jwt.sign({ sub: 'user-1', role: 'USER' }, env.jwtSecret, { expiresIn: -1 });

    const response = await request(createApp())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it('should return the current user for a valid token', async () => {
    mockedRepository.findUserById.mockResolvedValue(buildUser());
    const token = signAccessToken({ sub: 'user-1', role: 'USER' });

    const response = await request(createApp())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe('user-1');
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('should return 401 when the token belongs to a user that no longer exists', async () => {
    mockedRepository.findUserById.mockResolvedValue(null);
    const token = signAccessToken({ sub: 'ghost-user', role: 'USER' });

    const response = await request(createApp())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });
});

describe('PATCH /api/v1/auth/me', () => {
  const TOKEN = signAccessToken({ sub: 'user-1', role: 'USER' });

  it('should require authentication', async () => {
    const response = await request(createApp())
      .patch('/api/v1/auth/me')
      .send({ firstName: 'Milagros' });

    expect(response.status).toBe(401);
  });

  it('should reject an empty patch', async () => {
    const response = await request(createApp())
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it('should update the profile for the authenticated user', async () => {
    mockedRepository.updateUser.mockResolvedValue(buildUser({ firstName: 'Milagros' }));

    const response = await request(createApp())
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ firstName: 'Milagros' });

    expect(response.status).toBe(200);
    expect(response.body.user.firstName).toBe('Milagros');
    expect(mockedRepository.updateUser).toHaveBeenCalledWith('user-1', { firstName: 'Milagros' });
  });

  it('should return 409 when the requested email is already taken', async () => {
    mockedRepository.findUserByEmail.mockResolvedValue(buildUser({ id: 'other-user' }));

    const response = await request(createApp())
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ email: 'taken@example.com' });

    expect(response.status).toBe(409);
    expect(mockedRepository.updateUser).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/v1/auth/me/password', () => {
  const TOKEN = signAccessToken({ sub: 'user-1', role: 'USER' });

  it('should require authentication', async () => {
    const response = await request(createApp())
      .patch('/api/v1/auth/me/password')
      .send({ currentPassword: 'correct-password1', newPassword: 'newpassword1' });

    expect(response.status).toBe(401);
  });

  it('should reject a weak new password', async () => {
    const response = await request(createApp())
      .patch('/api/v1/auth/me/password')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ currentPassword: 'correct-password1', newPassword: 'short' });

    expect(response.status).toBe(400);
  });

  it('should return 401 when the current password is incorrect', async () => {
    const passwordHash = await bcrypt.hash('correct-password1', 10);
    mockedRepository.findUserById.mockResolvedValue(buildUser({ passwordHash }));

    const response = await request(createApp())
      .patch('/api/v1/auth/me/password')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ currentPassword: 'wrong-password', newPassword: 'newpassword1' });

    expect(response.status).toBe(401);
    expect(mockedRepository.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('should change the password and return 204', async () => {
    const passwordHash = await bcrypt.hash('correct-password1', 10);
    mockedRepository.findUserById.mockResolvedValue(buildUser({ passwordHash }));

    const response = await request(createApp())
      .patch('/api/v1/auth/me/password')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ currentPassword: 'correct-password1', newPassword: 'newpassword1' });

    expect(response.status).toBe(204);
    expect(mockedRepository.updatePasswordHash).toHaveBeenCalledWith('user-1', expect.any(String));
  });
});
