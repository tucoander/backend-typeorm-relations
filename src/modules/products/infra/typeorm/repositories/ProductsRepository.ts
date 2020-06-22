import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';
import AppError from '@shared/errors/AppError';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = await this.ormRepository.create({
      name,
      price,
      quantity,
    });

    this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const checkProduct = await this.ormRepository.findOne({ where: { name } });

    return checkProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const listProductsID = products.map(product => product.id);
    const orderProdList = await this.ormRepository.find({
      id: In(listProductsID),
    });

    if (listProductsID.length !== orderProdList.length) {
      throw new AppError('There is products that was not registered');
    }
    return orderProdList;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsData = await this.findAllById(products);

    const updatedProducts = productsData.map(productData => {
      const productFind = products.find(
        product => product.id === productData.id,
      );

      if (!productFind) {
        throw new AppError('Products does not exists');
      }

      if (productData.quantity < productFind.quantity) {
        throw new AppError('There is less products than you sold');
      }

      const updatedProduct = productData;

      updatedProduct.quantity -= productFind.quantity;

      return updatedProduct;
    });

    await this.ormRepository.save(updatedProducts);

    return updatedProducts;
  }
}

export default ProductsRepository;
