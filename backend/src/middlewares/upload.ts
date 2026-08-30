import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ValidationError } from '@/utils/AppError';
import { isSupportedImageMimeType } from '@/utils/imageMimeTypes';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const rawUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!isSupportedImageMimeType(file.mimetype)) {
      callback(new Error('Only PNG, JPEG, and WebP images are supported.'));
      return;
    }
    callback(null, true);
  },
}).single('image');

export function uploadClothingImageMiddleware(req: Request, res: Response, next: NextFunction): void {
  rawUpload(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Invalid image upload.';
      next(new ValidationError(message));
      return;
    }
    if (!req.file) {
      next(new ValidationError('An image file is required.'));
      return;
    }
    next();
  });
}
