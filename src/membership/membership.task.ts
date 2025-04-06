import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MembershipService } from './membership.service';

@Injectable()
export class MembershipTasks {
  private readonly logger = new Logger(MembershipTasks.name);

  constructor(private readonly abonnementService: MembershipService) {}

  /**
   * Tâche planifiée qui s'exécute tous les jours à minuit
   * pour mettre à jour le statut des abonnements expirés
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleUpdateExpiredAbonnements() {
    this.logger.log('Début de la mise à jour des abonnements expirés...');

    try {
      const result = await this.abonnementService.updateExpiredAbonnements();
      this.logger.log(`Mise à jour terminée: ${result.message}`);
    } catch (error) {
      this.logger.error(
        'Erreur lors de la mise à jour des abonnements expirés',
        error.stack,
      );
    }
  }
}
