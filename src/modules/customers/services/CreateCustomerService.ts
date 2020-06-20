import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customerRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const checkEmailExists = await this.customerRepository.findByEmail(email);

    if (checkEmailExists) {
      throw new AppError('This email already exists');
    }

    const customer = await this.customerRepository.create({
      name,
      email,
    });

    return customer;
  }
}

export default CreateCustomerService;
