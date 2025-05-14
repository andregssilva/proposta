
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewProduct {
  name: string;
  price: number;
  category: string;
  stock: number;
}
