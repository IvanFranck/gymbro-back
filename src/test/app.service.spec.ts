import { I18nService } from 'nestjs-i18n';
import { AppService } from 'src/app.service';
import { TestBed, Mocked } from '@suites/unit';

describe('AppService', () => {
  // Déclaration des variables utilisées dans les tests
  let appService: AppService;
  let i18nService: Mocked<I18nService>;
  // Configuration initiale avant tous les tests
  beforeAll(async () => {
    // Initialisation du module de test avec AppService
    const { unit, unitRef } = await TestBed.solitary(AppService).compile();
    appService = unit;
    i18nService = unitRef.get(I18nService);
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  it('should return healthy message', () => {
    i18nService.t.mockReturnValue('service healthy');
    expect(appService.getHealth()).toBe('service healthy');
  });
});
