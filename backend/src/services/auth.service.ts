import bcrypt from 'bcrypt';
import * as userRepository from '@/repositories/user.repository';
import * as dollService from '@/services/doll.service';
import { PublicUser, toPublicUser } from '@/types/user.types';
import { signAccessToken } from '@/utils/jwt';
import { ConflictError, UnauthorizedError } from '@/utils/AppError';
import { ChangePasswordInput, LoginInput, RegisterInput, UpdateProfileInput } from '@/validators/auth.validator';

const BCRYPT_SALT_ROUNDS = 10;
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existingUser = await userRepository.findUserByEmail(input.email);
  if (existingUser) {
    throw new ConflictError('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
  const user = await userRepository.createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash,
  });
  await dollService.createDefaultDollForUser(user.id);

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await userRepository.findUserByEmail(input.email);
  if (!user) {
    throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
  }

  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Your account is inactive. Please contact an administrator.');
  }

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await userRepository.findUserById(userId);
  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Your session is no longer valid.');
  }

  return toPublicUser(user);
}

export async function updateMyProfile(userId: string, patch: UpdateProfileInput): Promise<PublicUser> {
  if (patch.email) {
    const existingUser = await userRepository.findUserByEmail(patch.email);
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError('An account with this email already exists.');
    }
  }

  const updated = await userRepository.updateUser(userId, patch);
  return toPublicUser(updated);
}

export async function changeMyPassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new UnauthorizedError('Your session is no longer valid.');
  }

  const isCurrentPasswordValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect.');
  }

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS);
  await userRepository.updatePasswordHash(userId, passwordHash);
}
