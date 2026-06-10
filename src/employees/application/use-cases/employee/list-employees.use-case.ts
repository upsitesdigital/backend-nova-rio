import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResponse } from '../../../../shared/types/paginated-response.type.js';
import type {
  EmployeeSafe,
  IEmployeeRepository,
} from '../../../domain/interfaces/employee.repository.interface.js';
import type { ListEmployeesQueryDto } from '../../../dto/employee/list-employees-query.dto.js';

@Injectable()
export class ListEmployeesUseCase {
  constructor(
    @Inject(DiTokens.employeeRepository) private employeeRepository: IEmployeeRepository,
  ) {}

  async listEmployees(query: ListEmployeesQueryDto): Promise<PaginatedResponse<EmployeeSafe>> {
    return this.employeeRepository.listEmployees({
      status: query.status,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }
}
