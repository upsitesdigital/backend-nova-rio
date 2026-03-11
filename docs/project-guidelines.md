# Project Guidelines — Nova Rio Backend

---

## 1. Clean Architecture — Uncle Bob (REGRA DE OURO)

Este projeto segue rigorosamente a **Clean Architecture** de Robert C. Martin (Uncle Bob). Toda decisão de design, organização de código e criação de módulos DEVE respeitar estes princípios.

### 1.1 Camadas e a Dependency Rule

A regra mais importante: **dependências SEMPRE apontam para dentro** (das camadas externas para as internas). Código de camadas internas NUNCA conhece camadas externas.

```
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE (camada mais externa)                       │
│  Prisma repositories, Resend email, Vindi gateway,         │
│  JWT service, Bcrypt hash, Crons                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  INTERFACE ADAPTERS                                  │   │
│  │  Controllers, DTOs, Guards, Decorators, Pipes        │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  APPLICATION (Use Cases)                     │    │   │
│  │  │  Business rules específicas da aplicação     │    │   │
│  │  │  1 classe = 1 operação                       │    │   │
│  │  │  ┌─────────────────────────────────────┐    │    │   │
│  │  │  │  DOMAIN (camada mais interna)        │    │    │   │
│  │  │  │  Interfaces, Types, Symbols,         │    │    │   │
│  │  │  │  Business rules do domínio            │    │    │   │
│  │  │  └─────────────────────────────────────┘    │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Mapeamento das camadas no projeto

| Camada Clean Arch      | Path no projeto                                            | Conteúdo                                                            |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| **Domain**             | `domain/interfaces/`                                       | Repository interfaces, service interfaces, DI Symbols, domain types |
| **Application**        | `application/use-cases/`                                   | Use cases (1 por operação), validators de domínio                   |
| **Interface Adapters** | `<module>.controller.ts`, `dto/`                           | Controllers HTTP, DTOs de entrada/saída                             |
| **Infrastructure**     | `infrastructure/repositories/`, `infrastructure/services/` | Prisma repos, email, gateway, crons                                 |

### 1.3 Dependency Rule — exemplos concretos

```typescript
// ✅ CORRETO: Use case depende da INTERFACE (domain), não da implementação
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}
}

// ❌ ERRADO: Use case depende diretamente do Prisma (infrastructure)
import { PrismaServiceRepository } from '../../../infrastructure/repositories/prisma-service.repository.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(private repo: PrismaServiceRepository) {} // VIOLA Dependency Rule
}
```

```typescript
// ✅ CORRETO: Repository interface (domain) não conhece Prisma
export interface IServiceRepository {
  createService(data: CreateServiceData): Promise<Service>;
}

// ❌ ERRADO: Interface do domain importando algo de infrastructure
import { PrismaClient } from '@prisma/client'; // VIOLA — domain não conhece infra
```

```typescript
// ✅ CORRETO: Controller depende do Use Case, NUNCA do repository diretamente
export class ServicesController {
  constructor(private createServiceUseCase: CreateServiceUseCase) {}

  createService(@Body() dto: CreateServiceDto) {
    return this.createServiceUseCase.createService(dto);
  }
}

// ❌ ERRADO: Controller acessando repository diretamente (pula a camada application)
export class ServicesController {
  constructor(@Inject(SERVICE_REPOSITORY) private repo: IServiceRepository) {}

  createService(@Body() dto: CreateServiceDto) {
    return this.repo.createService(dto); // VIOLA — controller não pode acessar domain diretamente
  }
}
```

### 1.4 Estrutura de um módulo

```
src/<module>/
  ├── application/
  │   ├── use-cases/<entity>/          # Business logic (1 classe por use case)
  │   └── validators/                  # Validadores de domínio (opcional)
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

### 1.5 Regras de organização

- **1 classe por arquivo** — sem exceções
- **1 use case por arquivo** — cada use case é uma classe `@Injectable()` isolada
- **Subpastas por entidade** — sempre criar subpastas por domínio dentro das camadas (`use-cases/service/`, `dto/service/`). NUNCA deixar arquivos soltos na raiz da camada
- **Dependência unidirecional** — Controller → UseCase → Repository Interface ← Prisma Implementation

---

## 2. SOLID Principles

TODOS os 5 princípios SOLID são obrigatórios neste projeto. Cada princípio é mapeado abaixo com exemplos concretos do codebase.

### 2.1 S — Single Responsibility Principle (SRP)

> "Uma classe deve ter um, e somente um, motivo para mudar."

Cada use case tem exatamente UMA responsabilidade. NUNCA criar um "ServiceUseCase" que faz CRUD inteiro.

```typescript
// ❌ ERRADO: múltiplas responsabilidades em uma classe
@Injectable()
export class ServiceUseCase {
  async create(dto) { ... }
  async findAll() { ... }
  async findOne(id) { ... }
  async update(id, dto) { ... }
  async delete(id) { ... }
}

// ✅ CORRETO: 1 use case = 1 responsabilidade = 1 arquivo
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

**Aplicação no projeto:**

- Use cases: 1 operação por classe (CreateServiceUseCase, ListServicesUseCase, etc.)
- Controllers: separados por role quando necessário (ClientAppointmentsController, AdminAppointmentsController)
- Guards: cada guard tem uma única responsabilidade (JwtAuthGuard valida JWT, RolesGuard verifica role, ClientGuard verifica tipo)
- Services: cada service externo tem sua própria classe (ResendEmailService, VindiPaymentGatewayService, BcryptHashService)

### 2.2 O — Open/Closed Principle (OCP)

> "Entidades de software devem ser abertas para extensão, mas fechadas para modificação."

Quando precisar de um novo comportamento, crie um NOVO use case ou uma NOVA implementação de interface — NUNCA modifique use cases existentes para adicionar lógica não relacionada.

```typescript
// ✅ CORRETO: novo comportamento = novo use case
// approve-client.use-case.ts (NOVO)
@Injectable()
export class ApproveClientUseCase { ... }

// reject-client.use-case.ts (NOVO)
@Injectable()
export class RejectClientUseCase { ... }

// ❌ ERRADO: adicionando novo comportamento modificando use case existente
@Injectable()
export class ManageClientUseCase {
  async approve(id) { ... }  // adicionado depois
  async reject(id) { ... }   // adicionado depois
  async suspend(id) { ... }  // adicionado depois
}
```

**Aplicação no projeto:**

- Repository interfaces permitem trocar Prisma por qualquer ORM sem alterar use cases
- Email service: interface `IEmailService` permite trocar Resend por SendGrid sem alterar quem consome
- Payment gateway: interface `IPaymentGatewayService` permite trocar Vindi sem alterar use cases

### 2.3 L — Liskov Substitution Principle (LSP)

> "Objetos de uma classe derivada devem poder substituir objetos da classe base sem alterar o comportamento do programa."

Todas as implementações de repository DEVEM honrar o contrato definido na interface do domain. Se `IServiceRepository.findServiceById(id)` retorna `Service | null`, a implementação Prisma DEVE retornar exatamente isso.

```typescript
// Domain interface (contrato)
export interface IServiceRepository {
  findServiceById(id: number): Promise<Service | null>;
  deactivateServiceById(id: number): Promise<void>;
}

// ✅ CORRETO: implementação honra o contrato exatamente
@Injectable()
export class PrismaServiceRepository implements IServiceRepository {
  async findServiceById(id: number): Promise<Service | null> {
    return this.prisma.service.findFirst({ where: { id, isActive: true } });
  }

  async deactivateServiceById(id: number): Promise<void> {
    await this.prisma.service.update({ where: { id }, data: { isActive: false } });
  }
}

// ❌ ERRADO: implementação viola o contrato (throw em vez de null)
@Injectable()
export class BadRepository implements IServiceRepository {
  async findServiceById(id: number): Promise<Service | null> {
    const service = await this.prisma.service.findFirst({ where: { id } });
    if (!service) throw new NotFoundException(); // VIOLA — contrato diz null, não throw
    return service;
  }
}
```

**Aplicação no projeto:**

- `PrismaServiceRepository implements IServiceRepository` — deve ser substituível sem alterar o use case
- `PrismaClientRepository implements IClientRepository`
- `ResendEmailService implements IEmailService`
- `BcryptHashService implements IHashService`
- `JwtTokenService implements ITokenService`

### 2.4 I — Interface Segregation Principle (ISP)

> "Nenhum cliente deve ser forçado a depender de métodos que não usa."

Interfaces devem ser coesas e específicas. Se um use case só precisa de leitura, ele NÃO deve depender de uma interface que também tem métodos de escrita, a menos que a interface esteja naturalmente coesa ao domínio.

```typescript
// ✅ CORRETO: interface coesa para o domínio de um módulo
export interface IClientRepository {
  findClientByEmail(email: string): Promise<Client | null>;
  findClientById(id: number): Promise<Client | null>;
  updateRefreshTokenWithFamily(clientId: number, hashedToken: string, family: string): Promise<void>;
}

// ✅ CORRETO: interfaces separadas quando contextos são distintos
// auth/domain/interfaces/ — operações de auth
export interface IClientRepository {
  findClientByEmail(email: string): Promise<Client | null>;
  updateRefreshTokenWithFamily(...): Promise<void>;
}

// clients/domain/interfaces/ — operações de gestão admin
export interface IClientManagementRepository {
  listClients(filters): Promise<PaginatedResponse<Client>>;
  approveClient(id: number): Promise<Client>;
  rejectClient(id: number): Promise<void>;
}

// ❌ ERRADO: interface gigante com tudo junto
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
  // ... 30 métodos mais
}
```

**Aplicação no projeto:**

- `IClientRepository` (auth) vs `IClientManagementRepository` (clients) vs `IClientProfileRepository` (client-profile) — mesma entidade Client, interfaces separadas por contexto
- `IHashService` — apenas `hash()` e `compare()`
- `ITokenService` — apenas operações de token
- `IEmailService` — apenas operações de email

### 2.5 D — Dependency Inversion Principle (DIP)

> "Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações."

Este é o princípio MAIS importante do projeto e se manifesta no **Symbol-based DI pattern**. Use cases (alto nível) dependem de interfaces (abstrações), NUNCA de implementações Prisma (baixo nível).

```typescript
// ✅ CORRETO: alto nível (use case) depende de abstração (interface)
@Injectable()
export class CreateServiceUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}
  //                                              ↑ abstração, não implementação
}

// Module faz o binding (composition root)
@Module({
  providers: [
    { provide: SERVICE_REPOSITORY, useClass: PrismaServiceRepository },
    //         ↑ abstração                   ↑ implementação concreta
    CreateServiceUseCase,
  ],
})
export class ServicesModule {}

// ❌ ERRADO: alto nível depende de baixo nível diretamente
@Injectable()
export class CreateServiceUseCase {
  constructor(private repo: PrismaServiceRepository) {} // VIOLA DIP
}
```

**Aplicação no projeto — todos os Symbols:**

| Symbol                    | Interface                | Implementation               |
| ------------------------- | ------------------------ | ---------------------------- |
| `SERVICE_REPOSITORY`      | `IServiceRepository`     | `PrismaServiceRepository`    |
| `CLIENT_REPOSITORY`       | `IClientRepository`      | `PrismaClientRepository`     |
| `ADMIN_REPOSITORY`        | `IAdminRepository`       | `PrismaAdminRepository`      |
| `HASH_SERVICE`            | `IHashService`           | `BcryptHashService`          |
| `TOKEN_SERVICE`           | `ITokenService`          | `JwtTokenService`            |
| `EMAIL_SERVICE`           | `IEmailService`          | `ResendEmailService`         |
| `PAYMENT_GATEWAY_SERVICE` | `IPaymentGatewayService` | `VindiPaymentGatewayService` |

### 2.6 Checklist SOLID — antes de cada PR

- [ ] **SRP** — cada classe tem UMA responsabilidade? Use cases com 1 método público?
- [ ] **OCP** — novo comportamento cria arquivo novo, sem modificar existentes?
- [ ] **LSP** — implementações respeitam o contrato da interface?
- [ ] **ISP** — interfaces são coesas? Nenhum consumidor depende de métodos que não usa?
- [ ] **DIP** — use cases dependem de interfaces via `@Inject(SYMBOL)`, nunca de classes concretas?

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
// CORRETO: Symbol + type import separados
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}
}
```

### Checklist

- [ ] Symbol exportado com nome `<ENTITY>_REPOSITORY` ou `<ENTITY>_SERVICE`
- [ ] Interface exportada com nome `I<Entity>Repository` ou `I<Entity>Service`
- [ ] Symbol e interface no MESMO arquivo
- [ ] Module binds via `{ provide: SYMBOL, useClass: PrismaImplementation }`
- [ ] Use cases injetam via `@Inject(SYMBOL)`
- [ ] `exports: [SYMBOL]` no module quando compartilhado entre módulos

---

## 4. Naming Conventions (CRÍTICO)

### Nomes de métodos — NUNCA genéricos

| ERRADO             | CORRETO                          |
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

### Nomes de arquivos

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

### Nomes de classes

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

// Controllers: <Module>Controller ou <Role><Module>Controller
ServicesController;
ClientAppointmentsController;
AdminAppointmentsController;
```

---

## 5. Imports

### Module resolution — OBRIGATÓRIO `.js`

```typescript
// CORRETO: extensão .js em TODOS os imports relativos
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { SERVICE_REPOSITORY } from './domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from './domain/interfaces/service.repository.interface.js';

// ERRADO: sem extensão
import { PrismaService } from '../../../shared/prisma/prisma.service';
```

### Type imports — separados

```typescript
// CORRETO: import type separado do import de valor
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

// CORRETO: type import para tipos do Prisma
import type { Service } from '@prisma/client';

// ERRADO: misturar valor e tipo no mesmo import
import { SERVICE_REPOSITORY, IServiceRepository } from '...';
```

### Packages — sem extensão

```typescript
// CORRETO: packages sem extensão
import { Injectable, Inject } from '@nestjs/common';
import type { Service } from '@prisma/client';
```

---

## 6. Controllers e Rotas

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

### Route params — SEMPRE `ParseIntPipe`

```typescript
// CORRETO: id inteiro com ParseIntPipe
@Get(':id')
getServiceById(@Param('id', ParseIntPipe) id: number) { ... }

// ERRADO: id como string ou uuid
@Get(':uuid')
getServiceByUuid(@Param('uuid') uuid: string) { ... }
```

### Swagger — OBRIGATÓRIO em todos os endpoints

Cada endpoint DEVE ter:

- `@ApiOperation({ summary: '...' })`
- `@Api*Response` para cada status possível (200, 201, 400, 401, 403, 404)
- `@ApiBearerAuth()` em endpoints autenticados
- `@ApiTags('...')` no controller

### Soft deletes

```typescript
// CORRETO: desativar via isActive
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiNoContentResponse({ description: 'Service deactivated successfully' })
deactivateService(@Param('id', ParseIntPipe) id: number) {
  return this.deleteServiceUseCase.deactivateServiceById(id);
}

// ERRADO: deletar fisicamente
@Delete(':id')
deleteService(@Param('id', ParseIntPipe) id: number) {
  return this.prisma.service.delete({ where: { id } });
}
```

---

## 7. DTOs e Validação

### DTOs com class-validator

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

### Query DTOs — estender PaginationQueryDto

```typescript
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto.js';

export class ListServicesQueryDto extends PaginationQueryDto {
  // filtros específicos do módulo
}
```

### Checklist

- [ ] `@ApiProperty` ou `@ApiPropertyOptional` em cada campo
- [ ] `example` em cada `@ApiProperty`
- [ ] Validators do `class-validator` em cada campo
- [ ] Campos opcionais com `@IsOptional()` + `?` no tipo
- [ ] Query DTOs estendem `PaginationQueryDto` para paginação

---

## 8. Repository — Prisma Implementation

### Padrão

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

### Regras

- **Entity types** — usar tipos gerados pelo Prisma (`import type { Service } from '@prisma/client'`), NUNCA criar interfaces manuais para entidades
- **Paginação** — retornar `PaginatedResponse<T>` com `{ data, total, page, limit }`
- **isActive** — sempre filtrar por `isActive: true` em listagens (soft delete)
- **ID** — usar `id` (autoincrement integer), NUNCA `uuid` em queries

---

## 9. Auth — Guards e Decorators

### Hierarquia de guards

| Guard                        | Uso                                                  |
| ---------------------------- | ---------------------------------------------------- |
| `JwtAuthGuard`               | Valida JWT, extrai user do token                     |
| `RolesGuard` + `@Roles(...)` | Admin endpoints — verifica role do admin             |
| `ClientGuard`                | Client endpoints — verifica `user.type === 'client'` |

### Combinações

```typescript
// Admin endpoint
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')

// Client endpoint
@UseGuards(JwtAuthGuard, ClientGuard)

// Público (sem guards)
// nenhum @UseGuards
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
  role?: string; // AdminRole quando type === 'admin'
}
```

---

## 10. Testing

### Framework: Vitest (NÃO Jest)

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

### Regras

- **Globals** — `describe`, `it`, `expect` disponíveis sem import (configurado em `vitest`)
- **Mocking** — `vi.fn()`, `vi.spyOn()`, `type Mock` do `vitest`
- **Test module** — `Test.createTestingModule` para wiring com `{ provide: SYMBOL, useValue: { method: vi.fn() } }`
- **Spec files** — colocados junto ao arquivo fonte como `*.spec.ts`
- **Naming** — `describe('NomeDoUseCase')`, `it('should ...')`
- **NUNCA** usar Jest matchers/functions (`jest.fn()`, `jest.mock()`)

---

## 11. Database — Prisma

### Schema conventions

```prisma
model Service {
  id        Int      @id @default(autoincrement())  // Sempre autoincrement
  uuid      String   @unique @default(uuid())       // UUID para referência externa
  // ... campos
  isActive  Boolean  @default(true)                 // Soft delete
  createdAt DateTime @default(now())                // Timestamp criação
  updatedAt DateTime @updatedAt                     // Timestamp atualização

  @@map("services")                                 // Snake case para tabela
}
```

### Regras

- **id + uuid** — todos os models têm ambos. Endpoints usam `id` (integer)
- **Soft delete** — `isActive: Boolean @default(true)` para entidades que podem ser desativadas
- **Timestamps** — `createdAt` + `updatedAt` em todos os models
- **@@map** — table name em snake_case
- **Enums** — definidos no schema Prisma, importados como types
- **Decimal** — `@db.Decimal(10, 2)` para valores monetários
- **Indexes** — `@@index` em foreign keys e campos usados em queries frequentes

### Migrations

```bash
npm run prisma:migrate    # Dev: cria migration + aplica
npm run prisma:generate   # Regenera o client após mudanças no schema
npm run prisma:studio     # UI para explorar dados
```

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

Disponível em todos os módulos sem importar.

### EmailModule (`@Global`)

```typescript
@Global()
@Module({
  providers: [{ provide: EMAIL_SERVICE, useClass: ResendEmailService }],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
```

Injete com `@Inject(EMAIL_SERVICE) private emailService: IEmailService`.

### Shared types

| Type                   | Path                                          | Uso                   |
| ---------------------- | --------------------------------------------- | --------------------- |
| `AuthUser`             | `src/shared/types/auth-user.type.ts`          | User extraído do JWT  |
| `PaginatedResponse<T>` | `src/shared/types/paginated-response.type.ts` | Envelope de paginação |
| `PaginationQueryDto`   | `src/shared/dto/pagination-query.dto.ts`      | Base para query DTOs  |

---

## 13. Environment Variables

### Obrigatórias

| Variável               | Descrição                    |
| ---------------------- | ---------------------------- |
| `DATABASE_URL`         | Connection string PostgreSQL |
| `JWT_SECRET`           | Secret para access tokens    |
| `JWT_REFRESH_SECRET`   | Secret para refresh tokens   |
| `RESEND_API_KEY`       | API key do Resend (email)    |
| `RESEND_FROM_EMAIL`    | Email remetente              |
| `VINDI_API_KEY`        | API key do gateway Vindi     |
| `VINDI_WEBHOOK_SECRET` | Secret para validar webhooks |
| `CORS_ORIGIN`          | Origin permitida para CORS   |

### Opcionais

| Variável             | Default | Descrição               |
| -------------------- | ------- | ----------------------- |
| `PORT`               | `3000`  | Porta do servidor       |
| `DATABASE_POOL_SIZE` | `10`    | Pool de conexões Prisma |
| `ENABLE_SWAGGER`     | `false` | Habilita Swagger UI     |
| `SWAGGER_USER`       | —       | Basic auth para Swagger |
| `SWAGGER_PASSWORD`   | —       | Basic auth para Swagger |

---

## 14. Error Handling

### NestJS Exceptions

```typescript
// CORRETO: usar exceptions do NestJS
throw new NotFoundException('Service not found');
throw new BadRequestException('Invalid date');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Only clients can access this resource');
throw new ConflictException('Email already registered');

// ERRADO: throw genérico
throw new Error('Service not found');
```

### Logging

```typescript
// CORRETO: NestJS Logger
private readonly logger = new Logger(VindiWebhooksController.name);
this.logger.log('Processing event');
this.logger.error('Failed to process', error);

// ERRADO: console.log
console.log('Processing event');
```

---

## 15. Modules Catalog

| Module                 | Path                   | Descrição                                        |
| ---------------------- | ---------------------- | ------------------------------------------------ |
| `AuthModule`           | `src/auth/`            | Login, registro, JWT, refresh, password reset    |
| `ClientProfileModule`  | `src/client-profile/`  | Perfil do cliente, email change, password change |
| `ClientsModule`        | `src/clients/`         | Admin: aprovar/rejeitar/listar clientes          |
| `AdminUsersModule`     | `src/admin-users/`     | CRUD de administradores                          |
| `ServicesModule`       | `src/services/`        | CRUD de tipos de serviço                         |
| `PackagesModule`       | `src/packages/`        | CRUD de pacotes de serviço                       |
| `AppointmentsModule`   | `src/appointments/`    | Agendamentos (client + admin controllers)        |
| `PaymentsModule`       | `src/payments/`        | Pagamentos (client + admin controllers)          |
| `PaymentGatewayModule` | `src/payment-gateway/` | Integração Vindi (webhooks)                      |
| `CardsModule`          | `src/cards/`           | Cartões salvos do cliente                        |
| `DashboardModule`      | `src/dashboard/`       | Dashboard (client + admin)                       |
| `EmployeesModule`      | `src/employees/`       | CRUD de funcionários                             |
| `HolidaysModule`       | `src/holidays/`        | Feriados (sync com Brasil API)                   |
| `ReceiptsModule`       | `src/receipts/`        | Geração de recibos PDF                           |
| `ReportsModule`        | `src/reports/`         | Relatórios admin (vendas, transações, etc.)      |
| `UnitsModule`          | `src/units/`           | Unidades de atendimento + cobertura geo          |
| `HealthModule`         | `src/health/`          | Health check                                     |
| `EmailModule`          | `src/email/`           | Serviço de email (Resend) — `@Global`            |

---

## 16. Workflow — Novo Módulo

Ao criar um novo módulo, seguir esta ordem:

1. **Criar estrutura de pastas** conforme seção 1
2. **Definir interface do repository** em `domain/interfaces/` com Symbol + interface
3. **Criar DTOs** em `dto/<entity>/` com class-validator + Swagger decorators
4. **Implementar Prisma repository** em `infrastructure/repositories/`
5. **Criar use cases** em `application/use-cases/<entity>/` — 1 por operação
6. **Criar controller** com Swagger decorators + guards corretos
7. **Criar module** com DI binding
8. **Registrar no AppModule** em `src/app.module.ts`
9. **Escrever testes** para cada use case
10. **Verificar** — `npm run typecheck && npm run lint && npm run test`

---

## 17. Commits

### Formato

```
<type>: <descrição curta em inglês>
```

### Tipos

| Tipo       | Uso                                      |
| ---------- | ---------------------------------------- |
| `feat`     | Nova funcionalidade                      |
| `fix`      | Correção de bug                          |
| `refactor` | Refatoração sem mudança de comportamento |
| `test`     | Testes                                   |
| `chore`    | Configuração, dependências               |
| `docs`     | Documentação                             |
| `perf`     | Performance                              |

### Regras

- **Uma linha** — mensagem curta e descritiva
- **Módulos pequenos** — 1 commit por arquivo ou grupo logicamente relacionado
- **NUNCA** adicionar "Co-Authored-By", "Generated with", ou atribuições similares
- **NUNCA** usar `git add -A` ou `git add .`
- **Conventional commits** em inglês, lowercase

```bash
# CORRETO
git add src/services/application/use-cases/service/create-service.use-case.ts
git commit -m "feat: add create service use case"

git add src/services/dto/service/create-service.dto.ts
git commit -m "feat: add create service dto with validation"

# ERRADO
git add -A
git commit -m "add service module

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 18. Verificação

SEMPRE rodar antes de considerar trabalho finalizado:

```bash
npm run typecheck    # Verifica tipos TypeScript
npm run lint         # Verifica ESLint + Prettier
npm run test         # Roda todos os testes
```

Se todos passarem sem erros, o trabalho está pronto.

---

## 19. Idioma

| Contexto                                    | Idioma            |
| ------------------------------------------- | ----------------- |
| Nomes de variáveis, funções, classes, tipos | Inglês            |
| Commits                                     | Inglês            |
| Swagger summaries/descriptions              | Inglês            |
| Mensagens de erro (exceptions)              | Inglês            |
| Comentários no código                       | Inglês            |
| Documentação técnica                        | Inglês            |
| Strings de email visíveis ao usuário        | Português (pt-BR) |
