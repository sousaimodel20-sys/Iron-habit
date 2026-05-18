const STORAGE_KEY = 'iron-habit-data';

export const saveData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};
