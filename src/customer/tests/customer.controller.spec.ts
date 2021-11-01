import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from '../customer.controller';
import { CustomerService } from '../customer.service';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/mongo-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from '../entities/customer.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const randomCustomerId = '61800f0a5f488fb98f76a764';

const customerMock = {
  name: 'wassila',
  email: 'wassila@test.com',
};

const customersMock = [
  { name: 'wassila1', email: 'wassila1@test.com' },
  { name: 'wassila2', email: 'wassila2@test.com' },
];

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Customer.name, schema: CustomerSchema },
        ]),
      ],
      controllers: [CustomerController],
      providers: [CustomerService],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    service = module.get<CustomerService>(CustomerService);

    await Promise.all(
      customersMock.map((customerMockItem) => service.create(customerMockItem)),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a customer', async () => {
    const { email, name } = await controller.create(customerMock);
    expect(name).toEqual(customerMock.name);
    expect(email).toEqual(customerMock.email);
  });

  describe('Get one customer', () => {
    it('when a customer exists', async () => {
      const createdCustomer: Customer = await controller.create(customerMock);
      const parsedCustomer = JSON.parse(JSON.stringify(createdCustomer));
      const returnedCustomer = await controller.findOne(parsedCustomer._id);
      expect(returnedCustomer.email).toEqual(createdCustomer.email);
      expect(returnedCustomer.name).toEqual(createdCustomer.name);
    });

    it('when a customer does not exist', async () => {
      try {
        await controller.findOne(randomCustomerId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error).toHaveProperty(
          'message',
          `Customer with id : ${randomCustomerId} is not found`,
        );
      }
    });
  });

  it('should return all customers', async () => {
    const allCustomers = await controller.findAll({ name: null });
    const allCustomerWithTestFields = allCustomers.map(({ email, name }) => ({
      email,
      name,
    }));

    expect(new Set(allCustomerWithTestFields)).toEqual(new Set(customersMock));
  });

  describe('delete a customer', () => {
    it('when the customer exists', async () => {
      const createdCustomer: Customer = await controller.create(customerMock);
      const parsedCustomer = JSON.parse(JSON.stringify(createdCustomer));
      try {
        await controller.remove(parsedCustomer._id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error).toHaveProperty(
          'message',
          `Customer with id : ${parsedCustomer._id} is not found`,
        );
      }
    });

    it("when the customer doesn't exist", async () => {
      const { deletedCount } = await controller.remove(randomCustomerId);
      expect(deletedCount).toBeFalsy;
    });
  });

  describe('Update a customer', () => {
    const invalidMongoID = '1';
    const updatedName = { name: 'wassila_updated' };
    let createdCustomer;
    let updatedCustomer;
    let parsedCustomer;

    beforeEach(async () => {
      createdCustomer = await controller.create(customerMock);
      parsedCustomer = JSON.parse(JSON.stringify(createdCustomer));
      updatedCustomer = await controller.update(
        parsedCustomer._id,
        updatedName,
      );
    });

    it('should return the updated customer', () => {
      expect(updatedCustomer.name).toEqual(updatedName.name);
    });

    it('should update the customer in db', async () => {
      const customerInDb = await controller.findOne(parsedCustomer._id);
      expect(customerInDb.name).toEqual(updatedName.name);
    });

    it('should throw an error when the customer does not exist', async () => {
      try {
        await controller.update(randomCustomerId, updatedName);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error).toHaveProperty(
          'message',
          `Customer with id : ${randomCustomerId} is not found`,
        );
      }
    });

    it('should throw an error when the customer id is not valid', async () => {
      try {
        await controller.update(invalidMongoID, updatedName);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error).toHaveProperty('message', `Invalid mongoID`);
      }
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
