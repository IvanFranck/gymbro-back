import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from './generated/i18n.generated';

@Injectable()
export class AppService {
  constructor(private readonly i18nService: I18nService<I18nTranslations>) {}
  getHealth(): string {
    return this.i18nService.t('message.health');
  }
}
