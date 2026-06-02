import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('StorageController', () => {
  let controller: StorageController;
  let service: StorageService;

  const mockStorageService = {
    uploadFile: jest.fn().mockResolvedValue({ path: 'uploaded-path', publicUrl: 'public-url' }),
    getSignedUrl: jest.fn().mockResolvedValue('signed-url'),
    getPublicUrl: jest.fn().mockReturnValue('public-url'),
    downloadFile: jest.fn().mockResolvedValue({
      buffer: Buffer.from('file-content'),
      mimeType: 'image/png',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    controller = module.get<StorageController>(StorageController);
    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should throw BadRequestException if no file is provided', async () => {
      await expect(controller.uploadFile(null)).rejects.toThrow(BadRequestException);
    });

    it('should upload file and return service result', async () => {
      const mockFile = {
        buffer: Buffer.from('test-content'),
        originalname: 'test.png',
        mimetype: 'image/png',
      } as Express.Multer.File;

      const result = await controller.uploadFile(mockFile, 'test-bucket', 'test-path.png');
      expect(service.uploadFile).toHaveBeenCalledWith(mockFile, 'test-bucket', 'test-path.png');
      expect(result).toEqual({ path: 'uploaded-path', publicUrl: 'public-url' });
    });
  });

  describe('getSignedUrl', () => {
    it('should throw BadRequestException if path is missing', async () => {
      await expect(controller.getSignedUrl('')).rejects.toThrow(BadRequestException);
    });

    it('should return signed url', async () => {
      const result = await controller.getSignedUrl('file.png', 'bucket', '3600');
      expect(service.getSignedUrl).toHaveBeenCalledWith('bucket', 'file.png', 3600);
      expect(result).toEqual({ signedUrl: 'signed-url' });
    });
  });

  describe('getPublicUrl', () => {
    it('should throw BadRequestException if path is missing', async () => {
      await expect(controller.getPublicUrl('')).rejects.toThrow(BadRequestException);
    });

    it('should return public url', async () => {
      const result = await controller.getPublicUrl('file.png', 'bucket');
      expect(service.getPublicUrl).toHaveBeenCalledWith('bucket', 'file.png');
      expect(result).toEqual({ publicUrl: 'public-url' });
    });
  });

  describe('streamFile', () => {
    it('should throw BadRequestException if path is missing', async () => {
      const mockRes = {} as Response;
      await expect(controller.streamFile('', 'bucket', mockRes)).rejects.toThrow(BadRequestException);
    });

    it('should download and stream file to response object', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.streamFile('path/to/file.png', 'bucket', mockRes);

      expect(service.downloadFile).toHaveBeenCalledWith('bucket', 'path/to/file.png');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(Buffer.from('file-content'));
    });
  });
});
