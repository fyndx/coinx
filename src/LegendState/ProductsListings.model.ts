import {faker} from "@faker-js/faker";

export class ProductsListingsModel {
  constructor() {

  }

  createRandomProductListing = () => {
    return {
      price: faker.commerce.price(),
      quantity: faker.number.int({min: 1, max: 10}),
      pricePerUnit: faker.commerce.price(),
      brand: faker.company.name(),
      store: faker.company.catchPhraseNoun(),
      location: faker.location.city(),
    };
  }
}