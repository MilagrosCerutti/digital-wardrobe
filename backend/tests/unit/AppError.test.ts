import { AppError, ForbiddenError, NotFoundError, UnauthorizedError } from '@/utils/AppError';

describe('AppError', () => {
  it('should carry the provided status code and message', () => {
    const error = new AppError('Something went wrong', 418);

    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(418);
    expect(error.isOperational).toBe(true);
  });

  it('should expose the correct status code for each domain error', () => {
    expect(new NotFoundError().statusCode).toBe(404);
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new ForbiddenError().statusCode).toBe(403);
  });
});
