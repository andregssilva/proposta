
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewClient {
  name: string;
  email: string;
  phone: string;
  address: string;
}
