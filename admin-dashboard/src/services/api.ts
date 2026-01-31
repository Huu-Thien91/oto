// src/services/api.ts
export type Car = {
  carId: number;
  name: string;
  model?: string;
  year?: number;
  price?: number;
  color?: string;
  description?: string;
  brand?: string;
  mileage?: number;
  imageUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeList<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray(data.$values)) return data.$values as T[];
  return [];
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      accept: "text/plain",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export const api = {
  normalizeList,

  async getCars(): Promise<Car[]> {
    const data = await request<any>("/api/Car");
    return normalizeList<Car>(data);
  },

  async getCarById(id: number): Promise<Car> {
    return await request<Car>(`/api/Car/${id}`);
  },
};
