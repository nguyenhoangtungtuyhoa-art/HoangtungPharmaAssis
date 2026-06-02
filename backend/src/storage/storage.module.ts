import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService], // Export StorageService so other modules (e.g., MedicinesModule) can use it directly
})
export class StorageModule {}
