import { useState, useEffect } from "react";
import Header from "../components/Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExpensesPieChart from "../components/ExpensesPieChart";
import ActivityHeatmap from "../components/ActivityHeatmap";
import {
  deleteTransaction,
  deleteCategory,
  exportTransactionsPdf,
  createTransaction,
  createCategory,
  getCategories,
  getTransactions,
  updateTransaction,
} from "../api/finance";

import ChartModal from "../components/ChartModal";
import { getUser } from "../api/auth";
import MonthlyChart from "../components/MontlyCharts";

const Dashboard = () => {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isChartOpen, setChartOpen] = useState(false);
  const [openPieChart, setOpenPieChart] = useState(false);
  const [openHeatmap, setOpenHeatmap] = useState(false);
  const [editTransactionId, setEditTransactionId] = useState<number | null>(
    null
  );
  const [piggyAmount, setPiggyAmount] = useState("");
  const [piggyBankTotal, setPiggyBankTotal] = useState(0);
  const [piggyAnimated, setPiggyAnimated] = useState(false);
  const [piggyWithdrawAmount, setPiggyWithdrawAmount] = useState("");

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:8000/api/import-pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      alert("Импорт успешно завершён");
      fetchTransactions(); // обновим список
    } catch (error) {
      console.error("Ошибка при импорте PDF", error);
      alert("Произошла ошибка при импорте");
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await getUser(token);
      setUserEmail(response.data.data.email);
    } catch (error) {}
  };
  const handleDeleteCategory = async (categoryId: number) => {
    if (!categoryId) return;
    if (!window.confirm("Удалить категорию?")) return;

    try {
      await deleteCategory(categoryId);
      fetchCategories();
      setSelectedCategory("");
    } catch (error) {
      console.error("Ошибка при удалении категории", error);
    }
  };
  const handlePiggyBankDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!piggyAmount.trim()) return;

    const piggyCategory = categories.find((cat) => cat.name === "Копилка");

    if (!piggyCategory) {
      alert("Категория 'Копилка' не найдена. Создайте её сначала.");
      return;
    }

    await createTransaction({
      amount: parseFloat(piggyAmount),
      type: "expense",
      category_id: piggyCategory.id,
      note: "Пополнение копилки",
      date: new Date().toISOString().split("T")[0],
    });

    setPiggyAmount("");
    setPiggyAnimated(true);
    fetchTransactions();
  };
  const handlePiggyBankWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!piggyWithdrawAmount.trim()) return;

    const piggyCategory = categories.find((cat) => cat.name === "Копилка");

    if (!piggyCategory) {
      alert("Категория 'Копилка' не найдена.");
      return;
    }

    const amount = parseFloat(piggyWithdrawAmount);
    if (amount > piggyBankTotal) {
      alert("Недостаточно средств в копилке.");
      return;
    }

    await createTransaction({
      amount,
      type: "income",
      category_id: piggyCategory.id,
      note: "Снятие из копилки",
      date: new Date().toISOString().split("T")[0],
    });

    setPiggyWithdrawAmount("");
    setPiggyAnimated(true);
    fetchTransactions();
  };

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {}
  };
  const handleExportPdf = async () => {
    try {
      const response = await exportTransactionsPdf();
      const blob = new Blob([response.data], { type: "application/pdf" });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `transactions-${timestamp}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Ошибка при экспорте PDF:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await getTransactions(token);
      const transactionsArray = Object.values(response.data);
      setTransactions(transactionsArray);
    } catch (error) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedCategory || !date) return;

    if (editTransactionId) {
      await updateTransaction(editTransactionId, {
        amount: parseFloat(amount),
        type,
        category_id: Number(selectedCategory),
        note,
        date,
      });
    } else {
      await createTransaction({
        amount: parseFloat(amount),
        type,
        category_id: Number(selectedCategory),
        note,
        date,
      });
    }
    setEditTransactionId(null);
    setAmount("");
    setNote("");
    setDate("");
    setSelectedCategory("");
    fetchTransactions();
  };
  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      fetchTransactions(); // обновить список после удаления
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
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
    let piggy = 0;

    transactions.forEach((tx) => {
      const type = (tx.type || "").toString().trim().toLowerCase();
      const value = parseFloat(tx.amount || "0");
      const catName = tx.category?.name?.toLowerCase();

      if (type === "income") income += value;
      else if (type === "expense") expense += value;

      if (catName === "копилка") {
        if (type === "expense") piggy += value;
        if (type === "income") piggy -= value;
      }
    });

    setPiggyBankTotal(piggy);
    setTotalIncome(income);
    setTotalExpense(expense);
    setBalance(income - expense);
  }, [transactions]);

  useEffect(() => {
    if (piggyAnimated) {
      const timer = setTimeout(() => setPiggyAnimated(false), 400);
      return () => clearTimeout(timer);
    }
  }, [piggyAnimated]);
  return (
    <div className="page-wrapper">
      <Header userEmail={userEmail} />

      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <label
            className="add-category-button show-chart-button"
            style={{ cursor: "pointer" }}
          >
            <input
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={handlePdfUpload}
            />
            <span>📥</span>
            <span>Импорт PDF-выписки</span>
          </label>

          <h2>Мой бюджет</h2>
          <p>
            <strong>Баланс:</strong> {Math.round(balance)} ₽<br />
            Доходы: {Math.round(totalIncome)} ₽<br />
            Расходы: {Math.round(totalExpense)} ₽
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
              Добавить
            </button>
          </form>

          <button
            onClick={() => setChartOpen(true)}
            className="add-category-button show-chart-button"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              fontWeight: "bold",
            }}
          >
            <span>📊</span>
            <span>Расходы / Доходы</span>
          </button>
          <button
            onClick={() => setOpenPieChart(true)}
            className="add-category-button show-chart-button"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              fontWeight: "bold",
            }}
          >
            <span>🧁</span>
            <span>Категории расходов</span>
          </button>
          <button
            onClick={() => setOpenHeatmap(true)}
            className="add-category-button show-chart-button"
          >
            <span>🔥</span>
            <span>Активность по датам</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="add-category-button show-chart-button"
          >
            <span>📄</span>
            <span>Экспорт в PDF</span>
          </button>
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
            <DatePicker
              selected={date ? new Date(date) : null}
              onChange={(date: Date | null) => {
                if (date) setDate(date.toISOString().split("T")[0]); // сохраняем как YYYY-MM-DD
              }}
              dateFormat="yyyy-MM-dd"
              placeholderText="Выберите дату"
              className="form-date"
            />

            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                maxHeight: "200px",
                overflowY: "auto",
                padding: "8px",
                background: "#fff",
              }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedCategory(cat.id.toString())}
                  >
                    {cat.name}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "red",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
            {selectedCategory && (
              <p style={{ marginTop: "10px" }}>
                Выбрана категория:{" "}
                {
                  categories.find((cat) => cat.id === Number(selectedCategory))
                    ?.name
                }
              </p>
            )}

            <button type="submit" className="add-transaction-button">
              {editTransactionId ? "Сохранить изменения" : "Добавить"}
            </button>
          </form>
        </main>

        <section className="dashboard-transactions">
          <h2>Последние операции</h2>
          {transactions.length > 0 ? (
            <ul className="transactions-list">
              {paginatedTransactions.map((tx) => (
                <li
                  key={tx.id}
                  className={tx.type === "expense" ? "expense" : "income"}
                >
                  <div>
                    {tx.type === "expense" ? "-" : "+"} {tx.amount} ₽ –{" "}
                    {tx.category?.name || "Без категории"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Удалить
                    </button>
                    <button
                      onClick={() => {
                        setEditTransactionId(tx.id);
                        setAmount(tx.amount.toString());
                        setNote(tx.note || "");
                        setDate(tx.date?.slice(0, 10) || "");
                        setType(tx.type === "income" ? "income" : "expense");
                        setSelectedCategory(tx.category?.id?.toString() || "");
                      }}
                      style={{
                        backgroundColor: "gray",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        fontSize: "12px",
                        marginLeft: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Редактировать
                    </button>
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

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ◀
            </button>
            <span style={{ margin: "0 10px" }}>{currentPage}</span>
            <button
              disabled={currentPage * itemsPerPage >= transactions.length}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              ▶
            </button>
          </div>
        </section>
        <aside className="dashboard-sidebar">
          <h3>🐷 Копилка</h3>

          <form onSubmit={handlePiggyBankDeposit}>
            <input
              type="number"
              placeholder="Пополнить сумму"
              value={piggyAmount}
              onChange={(e) => setPiggyAmount(e.target.value)}
              className="piggy-input"
            />
            <button type="submit" className="add-category-button">
              Пополнить
            </button>
          </form>

          <form
            onSubmit={handlePiggyBankWithdraw}
            style={{ marginTop: "10px" }}
          >
            <input
              type="number"
              placeholder="Снять сумму"
              value={piggyWithdrawAmount}
              onChange={(e) => setPiggyWithdrawAmount(e.target.value)}
              className="piggy-input"
            />
            <button type="submit" className="add-category-button">
              Снять
            </button>
          </form>

          <p className={`piggy-total ${piggyAnimated ? "piggy-animate" : ""}`}>
            В копилке: {Math.round(piggyBankTotal)} ₽
          </p>
        </aside>
      </div>

      <ChartModal isOpen={isChartOpen} onClose={() => setChartOpen(false)}>
        <MonthlyChart transactions={transactions} />
      </ChartModal>

      <ChartModal isOpen={openPieChart} onClose={() => setOpenPieChart(false)}>
        <ExpensesPieChart
          key={transactions.length}
          transactions={transactions}
        />
      </ChartModal>
      <ChartModal isOpen={openHeatmap} onClose={() => setOpenHeatmap(false)}>
        <ActivityHeatmap transactions={transactions} />
      </ChartModal>
    </div>
  );
};

export default Dashboard;
