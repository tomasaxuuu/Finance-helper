import { api } from './auth';

// Получить категории
export const getCategories = () => {
  return api.get('/categories');
};

// Получить транзакции
export const getTransactions = () => {
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


// Создать категорию
export const createCategory = (data: { name: string }) => {
  return api.post('/categories', data);
};
