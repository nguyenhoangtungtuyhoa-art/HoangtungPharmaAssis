import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase SDK
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'signed-url' }, error: null }),
        download: jest.fn().mockResolvedValue({
          data: {
            arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
            type: 'image/jpeg',
          },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'public-url' } }),
      }),
    },
  }),
}));

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    // Set up dummy environment variables for tests
    process.env.SUPABASE_URL = 'https://dummy.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file and return path and public url', async () => {
      const mockFile = {
        buffer: Buffer.from('test-content'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const result = await service.uploadFile(mockFile, 'test-bucket', 'test.jpg');
      expect(result).toEqual({
        path: 'test-path',
        publicUrl: 'public-url',
      });
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL successfully', async () => {
      const result = await service.getSignedUrl('test-bucket', 'test.jpg', 3600);
      expect(result).toBe('signed-url');
    });
  });

  describe('downloadFile', () => {
    it('should download file buffer and mimetype', async () => {
      const result = await service.downloadFile('test-bucket', 'test.jpg');
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.buffer).toBeInstanceOf(Buffer);
    });
  });
});
