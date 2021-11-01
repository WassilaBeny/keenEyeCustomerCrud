import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from '../customer.service';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/mongo-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from '../entities/customer.entity';

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Customer.name, schema: CustomerSchema },
        ]),
      ],
      providers: [CustomerService],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
