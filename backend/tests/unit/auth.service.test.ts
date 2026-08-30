import bcrypt from 'bcrypt';
import * as authService from '@/services/auth.service';
import * as userRepository from '@/repositories/user.repository';
import * as dollRepository from '@/repositories/doll.repository';
import { User } from '@/types/user.types';

jest.mock('@/repositories/user.repository');
jest.mock('@/repositories/doll.repository');

const mockedRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockedDollRepository = dollRepository as jest.Mocked<typeof dollRepository>;

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

describe('authService.register', () => {
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

  it('should create a user with a hashed password and return a token', async () => {
    mockedRepository.findUserByEmail.mockResolvedValue(null);
    mockedRepository.createUser.mockImplementation(async (input) =>
      buildUser({ email: input.email, firstName: input.firstName, passwordHash: input.passwordHash }),
    );

    const result = await authService.register({
      firstName: 'Mila',
      lastName: 'Cerutti',
      email: 'mila@example.com',
      password: 'supersecret1',
    });

    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user.email).toBe('mila@example.com');
    expect(typeof result.token).toBe('string');

    const [createInput] = mockedRepository.createUser.mock.calls[0]!;
    expect(createInput.passwordHash).not.toBe('supersecret1');
    await expect(bcrypt.compare('supersecret1', createInput.passwordHash)).resolves.toBe(true);

    expect(mockedDollRepository.createDollForUser).toHaveBeenCalledWith(result.user.id);
  });

  it('should reject registration when the email is already registered', async () => {
    mockedRepository.findUserByEmail.mockResolvedValue(buildUser());

    await expect(
      authService.register({
        firstName: 'Mila',
        lastName: 'Cerutti',
        email: 'mila@example.com',
        password: 'supersecret1',
      }),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(mockedRepository.createUser).not.toHaveBeenCalled();
  });
});

describe('authService.login', () => {
  it('should authenticate a user with correct credentials', async () => {
    const passwordHash = await bcrypt.hash('correct-password1', 10);
    mockedRepository.findUserByEmail.mockResolvedValue(buildUser({ passwordHash }));

    const result = await authService.login({ email: 'mila@example.com', password: 'correct-password1' });

    expect(result.user.email).toBe('mila@example.com');
    expect(typeof result.token).toBe('string');
  });

  it('should reject login for an unknown email', async () => {
    mockedRepository.findUserByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'unknown@example.com', password: 'whatever1' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should reject login when the password does not match', async () => {
    const passwordHash = await bcrypt.hash('correct-password1', 10);
    mockedRepository.findUserByEmail.mockResolvedValue(buildUser({ passwordHash }));

    await expect(
      authService.login({ email: 'mila@example.com', password: 'wrong-password' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should reject login for an inactive account even with correct credentials', async () => {
    const passwordHash = await bcrypt.hash('correct-password1', 10);
    mockedRepository.findUserByEmail.mockResolvedValue(
      buildUser({ passwordHash, status: 'INACTIVE' }),
    );

    await expect(
      authService.login({ email: 'mila@example.com', password: 'correct-password1' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('authService.getCurrentUser', () => {
  it('should return the public user for a valid active user id', async () => {
    mockedRepository.findUserById.mockResolvedValue(buildUser());

    const user = await authService.getCurrentUser('user-1');

    expect(user).not.toHaveProperty('passwordHash');
    expect(user.id).toBe('user-1');
  });

  it('should reject when the user no longer exists', async () => {
    mockedRepository.findUserById.mockResolvedValue(null);

    await expect(authService.getCurrentUser('missing-user')).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe('authService.updateMyProfile', () => {
  it('should update the profile when no email change is requested', async () => {
    mockedRepository.updateUser.mockResolvedValue(buildUser({ firstName: 'Milagros' }));

    const user = await authService.updateMyProfile('user-1', { firstName: 'Milagros' });

    expect(user.firstName).toBe('Milagros');
    expect(mockedRepository.findUserByEmail).not.toHaveBeenCalled();
    expect(mockedRepository.updateUser).toHaveBeenCalledWith('user-1', { firstName: 'Milagros' });
  });

  it('should allow a user to keep their own email unchanged', async () => {
    mockedRepository.findUserByEmail.mockResolvedValue(buildUser({ id: 'user-1' }));
    mockedRepository.updateUser.mockResolvedValue(buildUser());

    await authService.updateMyProfile('user-1', { email: 'mila@example.com' });

    expect(mockedRepository.updateUser).toHaveBeenCalledWith('user-1', { email: 'mila@example.com' });
  });

  it('should reject when the new email is already taken by another user', async () => {
    mockedRepository.findUserByEmail.mockResolvedValue(buildUser({ id: 'other-user' }));

    await expect(
      authService.updateMyProfile('user-1', { email: 'taken@example.com' }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(mockedRepository.updateUser).not.toHaveBeenCalled();
  });
});

describe('authService.changeMyPassword', () => {
  it('should change the password when the current password is correct', async () => {
    const passwordHash = await bcrypt.hash('correct-password1', 10);
    mockedRepository.findUserById.mockResolvedValue(buildUser({ passwordHash }));

    await authService.changeMyPassword('user-1', {
      currentPassword: 'correct-password1',
      newPassword: 'newpassword1',
    });

    const [id, newHash] = mockedRepository.updatePasswordHash.mock.calls[0]!;
    expect(id).toBe('user-1');
    await expect(bcrypt.compare('newpassword1', newHash)).resolves.toBe(true);
  });

  it('should reject when the current password is incorrect', async () => {
    const passwordHash = await bcrypt.hash('correct-password1', 10);
    mockedRepository.findUserById.mockResolvedValue(buildUser({ passwordHash }));

    await expect(
      authService.changeMyPassword('user-1', {
        currentPassword: 'wrong-password',
        newPassword: 'newpassword1',
      }),
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(mockedRepository.updatePasswordHash).not.toHaveBeenCalled();
  });
});
