import { Module } from '@nestjs/common';
import { DocumentationGeneratorService } from './documentation-generator.service';
import { TechnicalDebtScannerService } from './technical-debt-scanner.service';
import { BonusController } from './bonus.controller';
import { FilesModule } from '../files/files.module';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';

@Module({
  imports: [
    AiProvidersModule,
    FilesModule,
  ],
  controllers: [BonusController],
  providers: [
    DocumentationGeneratorService,
    TechnicalDebtScannerService,
  ],
})
export class BonusModule {}