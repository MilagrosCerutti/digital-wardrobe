import jwt from 'jsonwebtoken';
import { signAccessToken, verifyAccessToken } from '@/utils/jwt';
import { env } from '@/config/environment';

describe('jwt utils', () => {
  it('should sign and verify a token round-trip', () => {
    const token = signAccessToken({ sub: 'user-1', role: 'USER' });

    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('USER');
  });

  it('should reject a token signed with a different secret', () => {
    const badToken = jwt.sign({ sub: 'user-1', role: 'USER' }, 'wrong-secret');

    expect(() => verifyAccessToken(badToken)).toThrow();
  });

  it('should reject an expired token', () => {
    const expiredToken = jwt.sign({ sub: 'user-1', role: 'USER' }, env.jwtSecret, { expiresIn: -1 });

    expect(() => verifyAccessToken(expiredToken)).toThrow(jwt.TokenExpiredError);
  });

  it('should not embed a password or password hash in the payload', () => {
    const token = signAccessToken({ sub: 'user-1', role: 'ADMIN' });
    const payloadBase64 = token.split('.')[1]!;
    const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));

    expect(decoded).not.toHaveProperty('password');
    expect(decoded).not.toHaveProperty('passwordHash');
  });
});
