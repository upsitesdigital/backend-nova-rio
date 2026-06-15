/**
 * Global dependency-injection tokens.
 *
 * Single source of truth for every Nest provider Symbol. Declared as static
 * members of a class (no `export const`, camelCase identifiers) per project
 * conventions. Reference as `DiTokens.<name>` in `@Inject(...)` and module
 * `provide:` wiring.
 */
export class DiTokens {
  // admin-users
  static readonly adminUserRepository = Symbol('adminUserRepository');

  // auth
  static readonly clientRepository = Symbol('clientRepository');
  static readonly clientAuthRepository = Symbol('clientAuthRepository');
  static readonly clientVerificationRepository = Symbol('clientVerificationRepository');
  static readonly clientProfileRepository = Symbol('clientProfileRepository');
  static readonly adminRepository = Symbol('adminRepository');
  static readonly adminAuthRepository = Symbol('adminAuthRepository');
  static readonly adminProfileRepository = Symbol('adminProfileRepository');
  static readonly hashService = Symbol('hashService');
  static readonly tokenService = Symbol('tokenService');

  // clients
  static readonly clientManagementRepository = Symbol('clientManagementRepository');

  // client-profile
  static readonly profileRepository = Symbol('profileRepository');

  // employees
  static readonly employeeRepository = Symbol('employeeRepository');

  // services
  static readonly serviceRepository = Symbol('serviceRepository');

  // packages
  static readonly packageRepository = Symbol('packageRepository');

  // appointments
  static readonly appointmentRepository = Symbol('appointmentRepository');
  static readonly createClientAppointmentService = Symbol('createClientAppointmentService');

  // holidays
  static readonly holidayRepository = Symbol('holidayRepository');
  static readonly jobLock = Symbol('jobLock');
  static readonly brasilApiHolidaysService = Symbol('brasilApiHolidaysService');

  // units
  static readonly unitRepository = Symbol('unitRepository');
  static readonly geocodingService = Symbol('geocodingService');

  // payments
  static readonly paymentRepository = Symbol('paymentRepository');
  static readonly paymentPricingService = Symbol('paymentPricingService');

  // payment-gateway
  static readonly paymentGatewayService = Symbol('paymentGatewayService');
  static readonly processedWebhookEventRepository = Symbol('processedWebhookEventRepository');
  static readonly webhookAuthenticator = Symbol('webhookAuthenticator');

  // cards
  static readonly cardRepository = Symbol('cardRepository');

  // receipts
  static readonly receiptRepository = Symbol('receiptRepository');
  static readonly receiptGenerator = Symbol('receiptGenerator');
  static readonly receiptGenerationService = Symbol('receiptGenerationService');

  // dashboard
  static readonly dashboardRepository = Symbol('dashboardRepository');
  static readonly clientDashboardRepository = Symbol('clientDashboardRepository');

  // reports
  static readonly reportRepository = Symbol('reportRepository');

  // email
  static readonly emailService = Symbol('emailService');

  // health
  static readonly healthRepository = Symbol('healthRepository');
}
