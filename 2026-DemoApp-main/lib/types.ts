export type Product = {
  id: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  stock: number;
};

export type ProductInput = Omit<Product, "id">;