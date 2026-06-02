import {
  Controller,
  Post,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as Express from 'express';
import { StorageService, MemoryStoredFile } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Endpoint to upload a file to Supabase Storage
   * Path: POST /storage/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MemoryStoredFile,
    @Query('bucket') bucket = 'medicine-images',
    @Query('path') path?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Default path if not specified: use original filename prefixed with unique timestamp
    // Clean spaces to avoid URL-encoding issues
    const targetPath = path || `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    return this.storageService.uploadFile(file, bucket, targetPath);
  }

  /**
   * Endpoint to get a signed URL for a file
   * Path: GET /storage/signed-url
   */
  @Get('signed-url')
  async getSignedUrl(
    @Query('path') path: string,
    @Query('bucket') bucket = 'medicine-images',
    @Query('expiresIn') expiresIn?: string,
  ) {
    if (!path) {
      throw new BadRequestException('Path parameter is required');
    }

    const expiresSec = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const signedUrl = await this.storageService.getSignedUrl(bucket, path, expiresSec);

    return { signedUrl };
  }

  /**
   * Endpoint to get a public URL for a file
   * Path: GET /storage/public-url
   */
  @Get('public-url')
  async getPublicUrl(
    @Query('path') path: string,
    @Query('bucket') bucket = 'medicine-images',
  ) {
    if (!path) {
      throw new BadRequestException('Path parameter is required');
    }

    const publicUrl = this.storageService.getPublicUrl(bucket, path);

    return { publicUrl };
  }

  /**
   * Endpoint to download and stream a file directly from backend (acting as a secure proxy)
   * Path: GET /storage/stream
   */
  @Get('stream')
  async streamFile(
    @Query('path') path: string,
    @Query('bucket') bucket = 'medicine-images',
    @Res() res: Express.Response,
  ) {
    if (!path) {
      throw new BadRequestException('Path parameter is required');
    }

    const { buffer, mimeType } = await this.storageService.downloadFile(bucket, path);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', buffer.length);
    // Allow inline display rather than forcing download
    res.setHeader('Content-Disposition', `inline; filename="${path.split('/').pop()}"`);
    res.status(HttpStatus.OK).send(buffer);
  }
}
