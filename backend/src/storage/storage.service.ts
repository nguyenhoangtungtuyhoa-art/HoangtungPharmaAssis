import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class MemoryStoredFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in env variables',
      );
    }

    // Initialize Supabase Client with service role key to bypass RLS in backend operations
    // This allows secure backend-to-backend operations without client auth headers
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Upload file to Supabase Storage
   * @param file MemoryStoredFile object containing buffer
   * @param bucket Name of the destination bucket
   * @param path Target path inside the bucket
   * @returns The uploaded file path and public URL
   */
  async uploadFile(file: MemoryStoredFile, bucket: string, path: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // Allow overwriting existing files
      });

    if (error) {
      throw new InternalServerErrorException(`Supabase upload failed: ${error.message}`);
    }

    const publicUrl = this.getPublicUrl(bucket, path);

    return {
      path: data.path,
      publicUrl,
    };
  }

  /**
   * Generate a signed URL for temporary access to a file (useful for private buckets)
   * @param bucket Bucket name
   * @param path Path to the file inside the bucket
   * @param expiresIn Time to live in seconds (default 3600s / 1 hour)
   * @returns Signed URL string
   */
  async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new InternalServerErrorException(`Could not generate signed URL: ${error.message}`);
    }

    if (!data || !data.signedUrl) {
      throw new NotFoundException('Signed URL was not generated or file not found');
    }

    return data.signedUrl;
  }

  /**
   * Download a file as buffer to stream it from NestJS backend (acting as secure proxy)
   * @param bucket Bucket name
   * @param path File path inside the bucket
   * @returns Buffer and content type
   */
  async downloadFile(bucket: string, path: string) {
    const { data, error } = await this.supabase.storage.from(bucket).download(path);

    if (error) {
      throw new NotFoundException(`File not found or download failed: ${error.message}`);
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const mimeType = data.type || 'application/octet-stream';

    return {
      buffer,
      mimeType,
    };
  }

  /**
   * Get public URL for a file (only works if bucket is public)
   * @param bucket Bucket name
   * @param path File path inside the bucket
   * @returns Public URL string
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
