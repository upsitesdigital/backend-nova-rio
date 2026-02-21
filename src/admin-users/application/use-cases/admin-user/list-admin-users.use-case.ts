import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResponse } from '../../../../shared/types/paginated-response.type.js';
import { ADMIN_USER_REPOSITORY } from '../../../domain/interfaces/admin-user.repository.interface.js';
import type {
  AdminUserSafe,
  IAdminUserRepository,
} from '../../../domain/interfaces/admin-user.repository.interface.js';
import { ListAdminUsersQueryDto } from '../../../dto/admin-user/list-admin-users-query.dto.js';

@Injectable()
export class ListAdminUsersUseCase {
  constructor(@Inject(ADMIN_USER_REPOSITORY) private adminUserRepository: IAdminUserRepository) {}

  async listAdminUsers(query: ListAdminUsersQueryDto): Promise<PaginatedResponse<AdminUserSafe>> {
    return this.adminUserRepository.listAdminUsers({
      status: query.status,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }
}
