import { useState, useEffect } from "react";
import Header from "../components/Header";
import {
  createTransaction,
  createCategory,
  getCategories,
  getTransactions,
} from "../api/finance";
import { getUser } from "../api/auth";

const Dashboard = () => {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await getUser(token);
      setUserEmail(response.data.data.email);
    } catch (error) {
      //
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      //
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await getTransactions();
      const transactionsArray = Object.values(response.data);
      setTransactions(transactionsArray);
    } catch (error) {
      //
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedCategory || !date) return;

    await createTransaction({
      amount: parseFloat(amount),
      type,
      category_id: Number(selectedCategory),
      note,
      date,
    });

    setAmount("");
    setNote("");
    setDate("");
    setSelectedCategory("");
    fetchTransactions();
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    await createCategory({ name: newCategoryName.trim() });
    setNewCategoryName("");
    fetchCategories();
  };

  useEffect(() => {
    fetchUser();
    fetchCategories();
    fetchTransactions();
  }, []);

  useEffect(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const type = (tx.type || "").toString().trim().toLowerCase();
      const value = parseFloat(tx.amount || "0");

      if (type === "income") {
        income += value;
      } else if (type === "expense") {
        expense += value;
      }
    });

    setTotalIncome(income);
    setTotalExpense(expense);
    setBalance(income - expense);
  }, [transactions]);

  return (
    <div className="page-wrapper">
      <Header userEmail={userEmail} />

      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <h2>Мой бюджет</h2>
          <p>
            💰 <strong>Баланс:</strong> {balance} ₽<br />
            🟢 Доходы: {totalIncome} ₽<br />
            🔴 Расходы: {totalExpense} ₽
          </p>

          <h3>Добавить категорию</h3>
          <form
            onSubmit={handleCreateCategory}
            className="create-category-form"
          >
            <input
              type="text"
              placeholder="Новая категория"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button type="submit" className="add-category-button">
              ➕ Добавить
            </button>
          </form>
        </aside>

        <main className="dashboard-main">
          <h2>Добавить операцию</h2>
          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="transaction-type">
              <button
                type="button"
                className={type === "expense" ? "active" : ""}
                onClick={() => setType("expense")}
              >
                Расход
              </button>
              <button
                type="button"
                className={type === "income" ? "active" : ""}
                onClick={() => setType("income")}
              >
                Доход
              </button>
            </div>

            <input
              type="number"
              placeholder="Сумма"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <input
              type="text"
              placeholder="Описание (необязательно)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button type="submit" className="add-transaction-button">
              Добавить
            </button>
          </form>
        </main>

        <section className="dashboard-transactions">
          <h2>Последние операции</h2>
          {transactions?.length > 0 ? (
            <ul className="transactions-list">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className={tx.type === "expense" ? "expense" : "income"}
                >
                  <div>
                    {tx.type === "expense" ? "-" : "+"} {tx.amount} ₽ –{" "}
                    {tx.category?.name || "Без категории"}
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {tx.note && <span>{tx.note} | </span>}
                    {tx.date?.slice(0, 10)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Нет операций</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
