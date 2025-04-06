import { Mocked, TestBed } from '@suites/unit';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: Mocked<AppService>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(AppController).compile();

    appController = unit;
    appService = unitRef.get(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  it('should be healthy', () => {
    appService.getHealth.mockReturnValue('Hello world!');

    appController.getHealth();
    expect(appService.getHealth).toHaveBeenCalled();
  });
});
