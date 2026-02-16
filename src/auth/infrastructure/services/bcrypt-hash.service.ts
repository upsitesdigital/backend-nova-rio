import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IHashService } from '../../domain/interfaces/hash.service.interface.js';

@Injectable()
export class BcryptHashService implements IHashService {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }

  async compare(value: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(value, hashed);
  }
}
