import { api } from './auth';

// Получить категории
export const getCategories = () => {
  return api.get('/categories');
};

// Получить транзакции
export const getTransactions = (token: string) => {
  return api.get('/transactions');
};

export const createTransaction = (data: {
  amount: number;
  type: string;
  category_id: number | string;
  note: string;
  date: string;
}) => {
  return api.post('/transactions', data);
};

export const updateTransaction = (id: number, data: {
  amount: number;
  type: string;
  category_id: number;
  note: string;
  date: string;
}) => {
  return api.put(`/transactions/${id}`, data);
};

// Создать категорию
export const createCategory = (data: { name: string }) => {
  return api.post('/categories', data);
};
// Удалить транзакцию
export const deleteTransaction = (id: number) => {
  return api.delete(`/transactions/${id}`);
};
export const deleteCategory = (id: number | string) => {
  return api.delete(`/categories/${id}`);
};
export const exportTransactionsPdf = () => {
  const token = localStorage.getItem("token");

  return api.get(`/transactions/export/pdf?ts=${Date.now()}`, {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};