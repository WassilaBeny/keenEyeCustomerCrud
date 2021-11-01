import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerDocument } from './entities/customer.entity';
const mongoose = require("mongoose");

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>
  ) { }

  create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const createdCustomer = new this.customerModel(createCustomerDto);
    return createdCustomer.save();
  }

  findAll(
    name: string,
    page: number,
    limit: number,
    sort,
  ): Promise<Customer[]> {
    const skip = (page - 1) * limit;
    return this.customerModel
      .find(name ? { name } : {})
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    this.checkIdValidity(id)
    const userId = this.getMongoId(id);
    const customer = await this.customerModel
      .findByIdAndUpdate({ _id: userId }, updateCustomerDto)
      .setOptions({ new: true })

    if (!customer) {
      throw new NotFoundException(`Customer with id : ${id} is not found`)
    }
    return customer;
  }

  delete(id: string) {
    this.checkIdValidity(id)
    const userId = this.getMongoId(id);
    return this.customerModel.deleteOne({ _id: userId });
  }

  checkIdValidity = (id: string) => {
    const isIdValid = mongoose.Types.ObjectId.isValid(id);
    if (!isIdValid) {
      throw new BadRequestException(`Invalid mongoID`);
    }
  }

  getMongoId = (id: string) => {
    return mongoose.Types.ObjectId(id);
  }
}
