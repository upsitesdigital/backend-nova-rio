# Project Guidelines — Nova Rio Backend

---

## 1. Clean Architecture — Uncle Bob (GOLDEN RULE)

This project strictly follows **Clean Architecture** by Robert C. Martin (Uncle Bob). Every design decision, code organization, and module creation MUST respect these principles.

### 1.1 Layers and the Dependency Rule

The most important rule: **dependencies ALWAYS point inward** (from outer layers to inner layers). Inner layer code NEVER knows about outer layers.

```
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE (outermost layer)                            │
│  Prisma repositories, Resend email, Vindi gateway,          │
│  JWT service, Bcrypt hash, Crons                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  INTERFACE ADAPTERS                                  │    │
│  │  Controllers, DTOs, Guards, Decorators, Pipes        │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  APPLICATION (Use Cases)                     │    │    │
│  │  │  Application-specific business rules         │    │    │
│  │  │  1 class = 1 operation                       │    │    │
│  │  │  ┌─────────────────────────────────────┐    │    │    │
│  │  │  │  DOMAIN (innermost layer)            │    │    │    │
│  │  │  │  Interfaces, Types, Symbols,         │    │    │    │
│  │  │  │  Domain business rules               │    │    │    │
│  │  │  └─────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Layer mapping in the project

| Clean Arch Layer       | Project Path                                               | Contents                                                            |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| **Domain**             | `domain/interfaces/`                                       | Repository interfaces, service interfaces, DI Symbols, domain types |
| **Application**        | `application/use-cases/`                                   | Use cases (1 per operation), domain validators                      |
| **Interface Adapters** | `<module>.controller.ts`, `dto/`                           | HTTP controllers, input/output DTOs                                 |
| **Infrastructure**     | `infrastructure/repositories/`, `infrastructure/services/` | Prisma repos, email, gateway, crons                                 |

### 1.3 Dependency Rule — concrete examples

```typescript
// CORRECT: use case depends on INTERFACE (domain), not on implementation
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}
}

// WRONG: use case depends directly on Prisma (infrastructure)
import { PrismaServiceRepository } from '../../../infrastructure/repositories/prisma-service.repository.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(private repo: PrismaServiceRepository) {} // VIOLATES Dependency Rule
}
```

```typescript
// CORRECT: repository interface (domain) does not know about Prisma
export interface IServiceRepository {
  createService(data: CreateServiceData): Promise<Service>;
}

// WRONG: domain interface importing from infrastructure
import { PrismaClient } from '@prisma/client'; // VIOLATES — domain must not know infra
```

```typescript
// CORRECT: controller depends on use case, NEVER on repository directly
export class ServicesController {
  constructor(private createServiceUseCase: CreateServiceUseCase) {}

  createService(@Body() dto: CreateServiceDto) {
    return this.createServiceUseCase.createService(dto);
  }
}

// WRONG: controller accessing repository directly (skips the application layer)
export class ServicesController {
  constructor(@Inject(SERVICE_REPOSITORY) private repo: IServiceRepository) {}

  createService(@Body() dto: CreateServiceDto) {
    return this.repo.createService(dto); // VIOLATES — controller must not access domain directly
  }
}
```

### 1.4 Module structure

```
src/<module>/
  ├── application/
  │   ├── use-cases/<entity>/          # Business logic (1 class per use case)
  │   └── validators/                  # Domain validators (optional)
  ├── domain/
  │   └── interfaces/                  # Repository interfaces + DI Symbols + types
  ├── dto/<entity>/                    # class-validator DTOs (interface adapters)
  ├── infrastructure/
  │   ├── repositories/                # Prisma implementations
  │   └── services/                    # External service implementations + crons
  ├── <module>.controller.ts           # HTTP endpoints + Swagger (interface adapters)
  ├── <module>.controller.spec.ts      # Controller tests
  └── <module>.module.ts               # NestJS module wiring (composition root)
```

### 1.5 Organization rules

- **1 class per file** — no exceptions
- **1 use case per file** — each use case is an isolated `@Injectable()` class
- **Subfolders by entity** — always create subfolders by domain inside layers (`use-cases/service/`, `dto/service/`). NEVER leave files flat at the layer root
- **Unidirectional dependency** — Controller → UseCase → Repository Interface ← Prisma Implementation

---

## 2. SOLID Principles

ALL 5 SOLID principles are mandatory in this project. Each principle is mapped below with concrete codebase examples.

### 2.1 S — Single Responsibility Principle (SRP)

> "A class should have one, and only one, reason to change."

Each use case has exactly ONE responsibility. NEVER create a "ServiceUseCase" that handles the entire CRUD.

```typescript
// WRONG: multiple responsibilities in one class
@Injectable()
export class ServiceUseCase {
  async create(dto) { ... }
  async findAll() { ... }
  async findOne(id) { ... }
  async update(id, dto) { ... }
  async delete(id) { ... }
}

// CORRECT: 1 use case = 1 responsibility = 1 file
// create-service.use-case.ts
@Injectable()
export class CreateServiceUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}
  async createService(dto: CreateServiceDto): Promise<Service> { ... }
}

// list-services.use-case.ts
@Injectable()
export class ListServicesUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}
  async listActiveServices(filters: ListServicesQueryDto): Promise<PaginatedResponse<Service>> { ... }
}
```

**Applied in the project:**

- Use cases: 1 operation per class (CreateServiceUseCase, ListServicesUseCase, etc.)
- Controllers: separated by role when necessary (ClientAppointmentsController, AdminAppointmentsController)
- Guards: each guard has a single responsibility (JwtAuthGuard validates JWT, RolesGuard checks role, ClientGuard checks type)
- Services: each external service has its own class (ResendEmailService, VindiPaymentGatewayService, BcryptHashService)

### 2.2 O — Open/Closed Principle (OCP)

> "Software entities should be open for extension but closed for modification."

When you need new behavior, create a NEW use case or a NEW interface implementation — NEVER modify existing use cases to add unrelated logic.

```typescript
// CORRECT: new behavior = new use case
// approve-client.use-case.ts (NEW)
@Injectable()
export class ApproveClientUseCase { ... }

// reject-client.use-case.ts (NEW)
@Injectable()
export class RejectClientUseCase { ... }

// WRONG: adding new behavior by modifying existing use case
@Injectable()
export class ManageClientUseCase {
  async approve(id) { ... }  // added later
  async reject(id) { ... }   // added later
  async suspend(id) { ... }  // added later
}
```

**Applied in the project:**

- Repository interfaces allow swapping Prisma for any ORM without changing use cases
- Email service: `IEmailService` interface allows swapping Resend for SendGrid without changing consumers
- Payment gateway: `IPaymentGatewayService` interface allows swapping Vindi without changing use cases

### 2.3 L — Liskov Substitution Principle (LSP)

> "Objects of a derived class must be able to replace objects of the base class without altering program behavior."

All repository implementations MUST honor the contract defined in the domain interface. If `IServiceRepository.findServiceById(id)` returns `Service | null`, the Prisma implementation MUST return exactly that.

```typescript
// Domain interface (contract)
export interface IServiceRepository {
  findServiceById(id: number): Promise<Service | null>;
  deactivateServiceById(id: number): Promise<void>;
}

// CORRECT: implementation honors the contract exactly
@Injectable()
export class PrismaServiceRepository implements IServiceRepository {
  async findServiceById(id: number): Promise<Service | null> {
    return this.prisma.service.findFirst({ where: { id, isActive: true } });
  }

  async deactivateServiceById(id: number): Promise<void> {
    await this.prisma.service.update({ where: { id }, data: { isActive: false } });
  }
}

// WRONG: implementation violates the contract (throw instead of null)
@Injectable()
export class BadRepository implements IServiceRepository {
  async findServiceById(id: number): Promise<Service | null> {
    const service = await this.prisma.service.findFirst({ where: { id } });
    if (!service) throw new NotFoundException(); // VIOLATES — contract says null, not throw
    return service;
  }
}
```

**Applied in the project:**

- `PrismaServiceRepository implements IServiceRepository` — must be substitutable without changing the use case
- `PrismaClientRepository implements IClientRepository`
- `ResendEmailService implements IEmailService`
- `BcryptHashService implements IHashService`
- `JwtTokenService implements ITokenService`

### 2.4 I — Interface Segregation Principle (ISP)

> "No client should be forced to depend on methods it does not use."

Interfaces must be cohesive and specific. If a use case only needs reads, it SHOULD NOT depend on an interface that also has write methods, unless the interface is naturally cohesive to the domain.

```typescript
// CORRECT: cohesive interface for a module's domain
export interface IClientRepository {
  findClientByEmail(email: string): Promise<Client | null>;
  findClientById(id: number): Promise<Client | null>;
  updateRefreshTokenWithFamily(clientId: number, hashedToken: string, family: string): Promise<void>;
}

// CORRECT: separate interfaces when contexts are distinct
// auth/domain/interfaces/ — auth operations
export interface IClientRepository {
  findClientByEmail(email: string): Promise<Client | null>;
  updateRefreshTokenWithFamily(...): Promise<void>;
}

// clients/domain/interfaces/ — admin management operations
export interface IClientManagementRepository {
  listClients(filters): Promise<PaginatedResponse<Client>>;
  approveClient(id: number): Promise<Client>;
  rejectClient(id: number): Promise<void>;
}

// WRONG: giant interface with everything together
export interface IGodRepository {
  // auth
  findClientByEmail(email: string): Promise<Client | null>;
  updateRefreshToken(...): Promise<void>;
  // admin management
  listClients(): Promise<Client[]>;
  approveClient(id: number): Promise<void>;
  // profile
  updateProfile(id: number, data): Promise<Client>;
  deleteAccount(id: number): Promise<void>;
  // ... 30 more methods
}
```

**Applied in the project:**

- Auth module splits `IClientRepository` into role-specific interfaces:
  - `IClientAuthRepository` — login flow, password, failed attempts, token management
  - `IClientVerificationRepository` — verification codes, password reset, email/password change
  - `IClientProfileRepository` — profile CRUD, payment client data, account deactivation
- `IClientManagementRepository` (clients module) — admin approve/reject/list clients
- `IHashService` — only `hash()` and `compare()`
- `ITokenService` — only token operations
- `IEmailService` — only email operations
- Cross-module interfaces: `IReceiptGenerationService` (receipts) consumed by payments and payment-gateway modules via `RECEIPT_GENERATION_SERVICE` Symbol

### 2.5 D — Dependency Inversion Principle (DIP)

> "High-level modules should not depend on low-level modules. Both should depend on abstractions."

This is the MOST important principle in the project and manifests through the **Symbol-based DI pattern**. Use cases (high-level) depend on interfaces (abstractions), NEVER on Prisma implementations (low-level).

```typescript
// CORRECT: high-level (use case) depends on abstraction (interface)
@Injectable()
export class CreateServiceUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}
  //                                              ↑ abstraction, not implementation
}

// Module does the binding (composition root)
@Module({
  providers: [
    { provide: SERVICE_REPOSITORY, useClass: PrismaServiceRepository },
    //         ↑ abstraction                   ↑ concrete implementation
    CreateServiceUseCase,
  ],
})
export class ServicesModule {}

// WRONG: high-level depends on low-level directly
@Injectable()
export class CreateServiceUseCase {
  constructor(private repo: PrismaServiceRepository) {} // VIOLATES DIP
}
```

**Applied in the project — all Symbols:**

| Symbol                           | Interface                       | Implementation                               |
| -------------------------------- | ------------------------------- | -------------------------------------------- |
| `SERVICE_REPOSITORY`             | `IServiceRepository`            | `PrismaServiceRepository`                    |
| `CLIENT_AUTH_REPOSITORY`         | `IClientAuthRepository`         | `PrismaClientRepository`                     |
| `CLIENT_VERIFICATION_REPOSITORY` | `IClientVerificationRepository` | `PrismaClientRepository`                     |
| `CLIENT_PROFILE_REPOSITORY`      | `IClientProfileRepository`      | `PrismaClientRepository`                     |
| `CLIENT_REPOSITORY`              | `IClientRepository` (combined)  | `PrismaClientRepository`                     |
| `ADMIN_AUTH_REPOSITORY`          | `IAdminAuthRepository`          | `PrismaAdminRepository`                      |
| `ADMIN_PROFILE_REPOSITORY`       | `IAdminProfileRepository`       | `PrismaAdminRepository`                      |
| `HASH_SERVICE`                   | `IHashService`                  | `BcryptHashService`                          |
| `TOKEN_SERVICE`                  | `ITokenService`                 | `JwtTokenService`                            |
| `EMAIL_SERVICE`                  | `IEmailService`                 | `ResendEmailService`                         |
| `PAYMENT_GATEWAY_SERVICE`        | `IPaymentGatewayService`        | `VindiPaymentGatewayService`                 |
| `PAYMENT_PRICING_SERVICE`        | `IPaymentPricingService`        | `PrismaPaymentPricingService`                |
| `RECEIPT_GENERATION_SERVICE`     | `IReceiptGenerationService`     | `GenerateReceiptUseCase` (via `useExisting`) |

### 2.6 SOLID Checklist — before every PR

- [ ] **SRP** — does each class have ONE responsibility? Use cases with 1 public method?
- [ ] **OCP** — does new behavior create a new file, without modifying existing ones?
- [ ] **LSP** — do implementations respect the interface contract?
- [ ] **ISP** — are interfaces cohesive? No consumer depends on methods it doesn't use?
- [ ] **DIP** — do use cases depend on interfaces via `@Inject(SYMBOL)`, never on concrete classes?

---

## 3. Dependency Injection — Symbol Pattern

### Interface + Symbol

```typescript
// src/<module>/domain/interfaces/<entity>.repository.interface.ts

import type { Service } from '@prisma/client';

export const SERVICE_REPOSITORY = Symbol('SERVICE_REPOSITORY');

export interface IServiceRepository {
  createService(data: CreateServiceData): Promise<Service>;
  findServiceById(id: number): Promise<Service | null>;
  findAllActiveServices(filters: ListServicesFilters): Promise<PaginatedResponse<Service>>;
  updateServiceById(id: number, data: UpdateServiceData): Promise<Service>;
  deactivateServiceById(id: number): Promise<void>;
}
```

### Module wiring

```typescript
// src/<module>/<module>.module.ts

@Module({
  controllers: [ServicesController],
  providers: [
    { provide: SERVICE_REPOSITORY, useClass: PrismaServiceRepository },
    CreateServiceUseCase,
    ListServicesUseCase,
    GetServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
  ],
  exports: [SERVICE_REPOSITORY],
})
export class ServicesModule {}
```

### Use Case injection

```typescript
// CORRECT: Symbol + type import separated
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}
}
```

### Cross-module dependency via interface (NEVER inject concrete use cases)

When module A needs functionality from module B, NEVER inject a use case class directly. Instead:

1. Define a service interface + Symbol in module B's `domain/interfaces/`
2. Have the use case implement the interface
3. Bind via `{ provide: SYMBOL, useExisting: ConcreteUseCase }` in module B
4. Export the Symbol from module B
5. Module A injects the Symbol

```typescript
// receipts/domain/interfaces/receipt-generation.service.interface.ts
export const RECEIPT_GENERATION_SERVICE = Symbol('RECEIPT_GENERATION_SERVICE');
export interface IReceiptGenerationService {
  generateReceiptForPayment(paymentId: number): Promise<void>;
}

// receipts/receipts.module.ts
@Module({
  providers: [
    GenerateReceiptUseCase,
    { provide: RECEIPT_GENERATION_SERVICE, useExisting: GenerateReceiptUseCase },
  ],
  exports: [RECEIPT_GENERATION_SERVICE],
})

// payments/application/use-cases/approve-payment.use-case.ts — consumer
@Inject(RECEIPT_GENERATION_SERVICE) private receiptService: IReceiptGenerationService,

// WRONG: injecting concrete class across modules
private generateReceiptUseCase: GenerateReceiptUseCase, // VIOLATES DIP
```

### Checklist

- [ ] Symbol exported with name `<ENTITY>_REPOSITORY` or `<ENTITY>_SERVICE`
- [ ] Interface exported with name `I<Entity>Repository` or `I<Entity>Service`
- [ ] Symbol and interface in the SAME file
- [ ] Module binds via `{ provide: SYMBOL, useClass: PrismaImplementation }`
- [ ] Cross-module: `{ provide: SYMBOL, useExisting: ConcreteClass }`
- [ ] Use cases inject via `@Inject(SYMBOL)`
- [ ] `exports: [SYMBOL]` in the module when shared across modules

---

## 4. Naming Conventions (CRITICAL)

### Method names — NEVER generic

| WRONG              | CORRECT                          |
| ------------------ | -------------------------------- |
| `execute(dto)`     | `createService(dto)`             |
| `call(id)`         | `getServiceById(id)`             |
| `run(filters)`     | `listActiveServices(filters)`    |
| `invoke(id, dto)`  | `updateServiceById(id, dto)`     |
| `handle(id)`       | `deactivateServiceById(id)`      |
| `findAll()`        | `findAllActiveServices(filters)` |
| `findOne(id)`      | `findServiceById(id)`            |
| `create(data)`     | `createService(data)`            |
| `update(id, data)` | `updateServiceById(id, data)`    |
| `delete(id)`       | `deactivateServiceById(id)`      |

### File names

```
# Use cases
create-service.use-case.ts
list-services.use-case.ts
get-service.use-case.ts
update-service.use-case.ts
delete-service.use-case.ts

# DTOs
create-service.dto.ts
update-service.dto.ts
list-services-query.dto.ts

# Repository interface
service.repository.interface.ts

# Prisma implementation
prisma-service.repository.ts

# Tests (colocated)
create-service.use-case.spec.ts
```

### Class names

```typescript
// Use cases: <Action><Entity>UseCase
CreateServiceUseCase;
ListServicesUseCase;
GetServiceUseCase;
UpdateServiceUseCase;
DeleteServiceUseCase;
ApproveClientUseCase;

// Repositories: Prisma<Entity>Repository
PrismaServiceRepository;
PrismaClientRepository;

// DTOs: <Action><Entity>Dto
CreateServiceDto;
UpdateServiceDto;
ListServicesQueryDto;

// Controllers: <Module>Controller or <Role><Module>Controller
ServicesController;
ClientAppointmentsController;
AdminAppointmentsController;
```

---

## 5. Imports

### Module resolution — `.js` REQUIRED

```typescript
// CORRECT: .js extension on ALL relative imports
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { SERVICE_REPOSITORY } from './domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from './domain/interfaces/service.repository.interface.js';

// WRONG: without extension
import { PrismaService } from '../../../shared/prisma/prisma.service';
```

### Type imports — separated

```typescript
// CORRECT: type import separated from value import
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

// CORRECT: type import for Prisma types
import type { Service } from '@prisma/client';

// WRONG: mixing value and type in the same import
import { SERVICE_REPOSITORY, IServiceRepository } from '...';
```

### Packages — no extension

```typescript
// CORRECT: packages without extension
import { Injectable, Inject } from '@nestjs/common';
import type { Service } from '@prisma/client';
```

---

## 6. Controllers and Routes

### Admin endpoints

```typescript
@ApiTags('Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')
@Controller('services')
export class ServicesController {
  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiCreatedResponse({ description: 'Service created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createService(@Body() dto: CreateServiceDto) {
    return this.createServiceUseCase.createService(dto);
  }
}
```

### Client endpoints

```typescript
@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ClientGuard)
@Controller('appointments')
export class ClientAppointmentsController {
  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiCreatedResponse({ description: 'Appointment created successfully' })
  @ApiForbiddenResponse({ description: 'Only clients can manage appointments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createClientAppointment(@CurrentUser() user: AuthUser, @Body() dto: CreateClientAppointmentDto) {
    return this.createClientAppointmentUseCase.createClientAppointment(user.id, dto);
  }
}
```

### Route params — ALWAYS `ParseIntPipe`

```typescript
// CORRECT: integer id with ParseIntPipe
@Get(':id')
getServiceById(@Param('id', ParseIntPipe) id: number) { ... }

// WRONG: id as string or uuid
@Get(':uuid')
getServiceByUuid(@Param('uuid') uuid: string) { ... }
```

### Swagger — REQUIRED on all endpoints

Every endpoint MUST have:

- `@ApiOperation({ summary: '...' })`
- `@Api*Response` for each possible status (200, 201, 400, 401, 403, 404)
- `@ApiBearerAuth()` on authenticated endpoints
- `@ApiTags('...')` on the controller

### Soft deletes

```typescript
// CORRECT: deactivate via isActive
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiNoContentResponse({ description: 'Service deactivated successfully' })
deactivateService(@Param('id', ParseIntPipe) id: number) {
  return this.deleteServiceUseCase.deactivateServiceById(id);
}

// WRONG: physically delete
@Delete(':id')
deleteService(@Param('id', ParseIntPipe) id: number) {
  return this.prisma.service.delete({ where: { id } });
}
```

---

## 7. DTOs and Validation

### DTOs with class-validator

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Faxina Regular' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Limpeza residencial completa' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @IsPositive()
  basePrice: number;
}
```

### Query DTOs — extend PaginationQueryDto

```typescript
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto.js';

export class ListServicesQueryDto extends PaginationQueryDto {
  // module-specific filters
}
```

### Pattern validation — use `@Matches` for restricted formats

```typescript
// CORRECT: digit-only fields validated with regex
@Matches(/^\d{6}$/, { message: 'Code must be exactly 6 digits' })
code: string;

@Matches(/^\d{4}$/, { message: 'lastFourDigits must be exactly 4 digits' })
lastFourDigits: string;

// WRONG: @Length alone allows non-digit characters
@Length(6, 6) // allows "abcdef"
code: string;
```

### Checklist

- [ ] `@ApiProperty` or `@ApiPropertyOptional` on each field
- [ ] `example` on each `@ApiProperty`
- [ ] `class-validator` validators on each field
- [ ] `@Matches(/regex/)` for pattern-restricted fields (digit-only codes, last four digits)
- [ ] Optional fields with `@IsOptional()` + `?` in the type
- [ ] Query DTOs extend `PaginationQueryDto` for pagination

---

## 8. Repository — Prisma Implementation

### Pattern

```typescript
import { Injectable } from '@nestjs/common';
import type { Service } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { IServiceRepository } from '../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class PrismaServiceRepository implements IServiceRepository {
  constructor(private prisma: PrismaService) {}

  async findAllActiveServices(filters: ListServicesFilters): Promise<PaginatedResponse<Service>> {
    const where = { isActive: true };
    const skip = (filters.page - 1) * filters.limit;

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({ where, skip, take: filters.limit }),
      this.prisma.service.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit };
  }
}
```

### Rules

- **Entity types** — use Prisma-generated types (`import type { Service } from '@prisma/client'`), NEVER create manual interfaces for entities
- **Pagination** — return `PaginatedResponse<T>` with `{ data, total, page, limit }`
- **isActive** — always filter by `isActive: true` in listings (soft delete)
- **ID** — use `id` (autoincrement integer), NEVER `uuid` in queries

---

## 9. Auth — Guards and Decorators

### Guard hierarchy

| Guard                        | Usage                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `JwtAuthGuard`               | Validates JWT, extracts user from token                                                                               |
| `RolesGuard` + `@Roles(...)` | Admin endpoints — verifies admin role                                                                                 |
| `ClientGuard`                | Client endpoints — verifies type + active status via `findStatusById` (selects only `status` for minimal DB overhead) |

### Combinations

```typescript
// Admin endpoint
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')

// Client endpoint
@UseGuards(JwtAuthGuard, ClientGuard)

// Public (no guards)
// no @UseGuards
```

### CurrentUser decorator

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: AuthUser) {
  // user.id, user.email, user.type, user.role
}
```

### AuthUser type

```typescript
interface AuthUser {
  id: number;
  email: string;
  type: 'client' | 'admin';
  role?: string; // AdminRole when type === 'admin'
}
```

---

## 10. Testing

### Framework: Vitest (NOT Jest)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';

describe('CreateServiceUseCase', () => {
  let useCase: CreateServiceUseCase;
  let serviceRepository: { createService: Mock };

  beforeEach(async () => {
    serviceRepository = {
      createService: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateServiceUseCase,
        { provide: SERVICE_REPOSITORY, useValue: serviceRepository },
      ],
    }).compile();

    useCase = module.get<CreateServiceUseCase>(CreateServiceUseCase);
  });

  it('should call serviceRepository.createService with dto', async () => {
    const dto = { name: 'Faxina Regular', basePrice: 150 };
    const created = { id: 1, ...dto };

    serviceRepository.createService.mockResolvedValue(created);

    const result = await useCase.createService(dto);

    expect(result).toEqual(created);
    expect(serviceRepository.createService).toHaveBeenCalledWith(dto);
  });
});
```

### Rules

- **Globals** — `describe`, `it`, `expect` available without import (configured in `vitest`)
- **Mocking** — `vi.fn()`, `vi.spyOn()`, `type Mock` from `vitest`
- **Test module** — `Test.createTestingModule` for wiring with `{ provide: SYMBOL, useValue: { method: vi.fn() } }`
- **Spec files** — colocated with source files as `*.spec.ts`
- **Naming** — `describe('UseCaseName')`, `it('should ...')`
- **NEVER** use Jest matchers/functions (`jest.fn()`, `jest.mock()`)

---

## 11. Database — Prisma

### Schema conventions

```prisma
model Service {
  id        Int      @id @default(autoincrement())  // Always autoincrement
  uuid      String   @unique @default(uuid())       // UUID for external reference
  // ... fields
  isActive  Boolean  @default(true)                 // Soft delete
  createdAt DateTime @default(now())                // Creation timestamp
  updatedAt DateTime @updatedAt                     // Update timestamp

  @@map("services")                                 // Snake case for table name
}
```

### Rules

- **id + uuid** — all models have both. Endpoints use `id` (integer)
- **Soft delete** — `isActive: Boolean @default(true)` for entities that can be deactivated
- **Timestamps** — `createdAt` + `updatedAt` on all models
- **@@map** — table name in snake_case
- **Enums** — defined in the Prisma schema, imported as types
- **Decimal** — `@db.Decimal(10, 2)` for monetary values
- **Indexes** — `@@index` on foreign keys and fields used in frequent queries

### Migrations

```bash
npm run prisma:migrate    # Dev: create migration + apply
npm run prisma:generate   # Regenerate client after schema changes
npm run prisma:studio     # UI to explore data
```

**Migration hygiene:**

- Never leave redundant add-then-drop migrations — squash no-ops before merging
- Seed command defined in `prisma.config.ts` only (single source of truth, uses `ts-node`)
- Seed scripts: use `process.exitCode = 1` in `.catch()`, avoid hardcoded unique values for test data
- Use Prisma enums (`AppointmentStatus`, `RecurrenceType`, `PaymentStatus`) in domain types — never `string` for enum fields

---

## 12. Global Infrastructure

### PrismaModule (`@Global`)

```typescript
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Available in all modules without importing.

### EmailModule (`@Global`)

```typescript
@Global()
@Module({
  providers: [{ provide: EMAIL_SERVICE, useClass: ResendEmailService }],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
```

Inject with `@Inject(EMAIL_SERVICE) private emailService: IEmailService`.

### Shared types

| Type                   | Path                                          | Usage                   |
| ---------------------- | --------------------------------------------- | ----------------------- |
| `AuthUser`             | `src/shared/types/auth-user.type.ts`          | User extracted from JWT |
| `PaginatedResponse<T>` | `src/shared/types/paginated-response.type.ts` | Pagination envelope     |
| `PaginationQueryDto`   | `src/shared/dto/pagination-query.dto.ts`      | Base for query DTOs     |

---

## 13. Environment Variables

### Required

| Variable               | Description                   |
| ---------------------- | ----------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string  |
| `JWT_SECRET`           | Secret for access tokens      |
| `JWT_REFRESH_SECRET`   | Secret for refresh tokens     |
| `RESEND_API_KEY`       | Resend API key (email)        |
| `RESEND_FROM_EMAIL`    | Sender email address          |
| `VINDI_API_KEY`        | Vindi gateway API key         |
| `VINDI_WEBHOOK_SECRET` | Secret for webhook validation |
| `CORS_ORIGIN`          | Allowed CORS origin           |

### Optional

| Variable             | Default | Description            |
| -------------------- | ------- | ---------------------- |
| `PORT`               | `3000`  | Server port            |
| `DATABASE_POOL_SIZE` | `10`    | Prisma connection pool |
| `ENABLE_SWAGGER`     | `false` | Enable Swagger UI      |
| `SWAGGER_USER`       | —       | Basic auth for Swagger |
| `SWAGGER_PASSWORD`   | —       | Basic auth for Swagger |

---

## 14. Error Handling

### NestJS Exceptions

```typescript
// CORRECT: use NestJS exceptions
throw new NotFoundException('Service not found');
throw new BadRequestException('Invalid date');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Only clients can access this resource');
throw new ConflictException('Email already registered');

// WRONG: generic throw
throw new Error('Service not found');
```

### Security-sensitive errors — generic messages to prevent enumeration

```typescript
// CORRECT: same message for all auth failure paths
throw new BadRequestException('Invalid or expired code'); // whether email not found, no active codes, or wrong code

// WRONG: different messages that leak info
throw new BadRequestException('Invalid code or email'); // reveals email doesn't exist
throw new BadRequestException('Invalid or expired code'); // reveals email exists but code is wrong
```

### Brute-force protection — DB-persisted

```typescript
// CORRECT: persist attempt tracking in database
// Client model has: failedResetAttempts (Int), resetLockedUntil (DateTime?)
await this.clientRepository.incrementResetAttempts(clientId, lockUntil);
await this.clientRepository.clearResetAttempts(clientId);

// WRONG: in-memory tracking (resets on restart, doesn't work across instances)
private readonly failedAttempts = new Map<string, number>();
```

### Logging

```typescript
// CORRECT: NestJS Logger
private readonly logger = new Logger(VindiWebhooksController.name);
this.logger.log('Processing event');
this.logger.error('Failed to process', error);

// WRONG: console.log
console.log('Processing event');
```

---

## 15. Modules Catalog

| Module                 | Path                   | Description                                   |
| ---------------------- | ---------------------- | --------------------------------------------- |
| `AuthModule`           | `src/auth/`            | Login, register, JWT, refresh, password reset |
| `ClientProfileModule`  | `src/client-profile/`  | Client profile, email change, password change |
| `ClientsModule`        | `src/clients/`         | Admin: approve/reject/list clients            |
| `AdminUsersModule`     | `src/admin-users/`     | Admin user CRUD                               |
| `ServicesModule`       | `src/services/`        | Service type CRUD                             |
| `PackagesModule`       | `src/packages/`        | Service package CRUD                          |
| `AppointmentsModule`   | `src/appointments/`    | Appointments (client + admin controllers)     |
| `PaymentsModule`       | `src/payments/`        | Payments (client + admin controllers)         |
| `PaymentGatewayModule` | `src/payment-gateway/` | Vindi integration (webhooks)                  |
| `CardsModule`          | `src/cards/`           | Client saved cards                            |
| `DashboardModule`      | `src/dashboard/`       | Dashboard (client + admin)                    |
| `EmployeesModule`      | `src/employees/`       | Employee CRUD                                 |
| `HolidaysModule`       | `src/holidays/`        | Holidays (sync with Brasil API)               |
| `ReceiptsModule`       | `src/receipts/`        | PDF receipt generation                        |
| `ReportsModule`        | `src/reports/`         | Admin reports (sales, transactions, etc.)     |
| `UnitsModule`          | `src/units/`           | Service units + geo coverage                  |
| `HealthModule`         | `src/health/`          | Health check                                  |
| `EmailModule`          | `src/email/`           | Email service (Resend) — `@Global`            |

---

## 16. Workflow — New Module

When creating a new module, follow this order:

1. **Create folder structure** as per section 1
2. **Define repository interface** in `domain/interfaces/` with Symbol + interface
3. **Create DTOs** in `dto/<entity>/` with class-validator + Swagger decorators
4. **Implement Prisma repository** in `infrastructure/repositories/`
5. **Create use cases** in `application/use-cases/<entity>/` — 1 per operation
6. **Create controller** with Swagger decorators + correct guards
7. **Create module** with DI binding
8. **Register in AppModule** at `src/app.module.ts`
9. **Write tests** for each use case
10. **Verify** — `npm run typecheck && npm run lint && npm run test`

---

## 17. Commits

### Format

```
<type>: <short description in English>
```

### Types

| Type       | Usage                               |
| ---------- | ----------------------------------- |
| `feat`     | New feature                         |
| `fix`      | Bug fix                             |
| `refactor` | Refactoring without behavior change |
| `test`     | Tests                               |
| `chore`    | Configuration, dependencies         |
| `docs`     | Documentation                       |
| `perf`     | Performance                         |

### Rules

- **One line** — short and descriptive message
- **Small modules** — 1 commit per file or logically related group
- **NEVER** add "Co-Authored-By", "Generated with", or similar attributions
- **NEVER** use `git add -A` or `git add .`
- **Conventional commits** in English, lowercase

```bash
# CORRECT
git add src/services/application/use-cases/service/create-service.use-case.ts
git commit -m "feat: add create service use case"

git add src/services/dto/service/create-service.dto.ts
git commit -m "feat: add create service dto with validation"

# WRONG
git add -A
git commit -m "add service module

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 18. Verification

ALWAYS run before considering work done:

```bash
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint + Prettier
npm run test         # Run all tests
```

If all pass without errors, the work is ready.

### ESLint Disable Comments — FORBIDDEN

**NEVER** use ESLint disable comments to suppress warnings or errors. Fix the root cause instead.

```typescript
// FORBIDDEN: any form of eslint-disable
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable @typescript-eslint/no-floating-promises */

// CORRECT: fix the actual issue
// - Remove unused variables
// - Use proper types instead of `any`
// - Properly await or handle promises
```

If a lint rule flags your code, it means the code needs to be fixed — not the rule silenced.

### Type Assertions — `as any` FORBIDDEN

**NEVER** use `as any`, `as unknown as T`, or similar type escape hatches. Always use proper types.

```typescript
// FORBIDDEN: any form of type escape
const result = someValue as any;
const data = response as unknown as MyType;
const user: any = getUser();
function process(data: any) { ... }

// CORRECT: use proper types
const result: ServiceResponse = someValue;
const data: MyType = response;
const user: AuthUser = getUser();
function process(data: CreateServiceDto) { ... }

// CORRECT: use Prisma-generated types
import type { Service, Client } from '@prisma/client';

// CORRECT: use generics when the type varies
function findById<T>(id: number): Promise<T | null> { ... }
```

If TypeScript complains about a type, it means the type system is telling you something is wrong — fix the types, don't silence the compiler.

---

## 19. Language

| Context                               | Language           |
| ------------------------------------- | ------------------ |
| Variable, function, class, type names | English            |
| Commits                               | English            |
| Swagger summaries/descriptions        | English            |
| Error messages (exceptions)           | English            |
| Code comments                         | English            |
| Technical documentation               | English            |
| User-facing email strings             | Portuguese (pt-BR) |
