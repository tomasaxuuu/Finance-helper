import { useEffect, useState } from "react";
import Header from "../components/Header";
import { getTransactions, getCategories } from "../api/finance";
import { getUser } from "../api/auth";

const Advisor = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [piggyBank, setPiggyBank] = useState(0);
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await getUser(token);
      setUserEmail(response.data.data.email);
    } catch (error) {}
  };
  useEffect(() => {
    fetchUser();
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const resTx = await getTransactions(token);
        const txData = Object.values(resTx.data);
        setTransactions(txData);

        let totalIncome = 0;
        let totalExpense = 0;
        let piggy = 0;

        txData.forEach((tx: any) => {
          const type = (tx.type || "").toLowerCase();
          const value = parseFloat(tx.amount || "0");
          const catName = tx.category?.name?.toLowerCase();

          if (type === "income") totalIncome += value;
          else if (type === "expense") totalExpense += value;

          if (catName === "копилка") {
            if (type === "expense") piggy += value;
            if (type === "income") piggy -= value;
          }
        });

        setIncome(totalIncome);
        setExpense(totalExpense);
        setBalance(totalIncome - totalExpense);
        setPiggyBank(piggy);

        const resCat = await getCategories();
        setCategories(resCat.data.map((c: any) => c.name));
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };

    fetchAll();
  }, []);

  const requestAdvice = async (type: string, data: any) => {
    setLoading(true);
    setAdvice([`📡 Запрос совета по теме: ${type}`]);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, data }),
      });

      const result = await res.json();
      const gptText =
        result.choices?.[0]?.message?.content ?? "❌ Нет ответа от AI";
      const lines = gptText
        .split("\n")
        .map((l: string) => l.trim())
        .filter(Boolean);
      setAdvice(lines);
    } catch (error: any) {
      setAdvice([`❌ Ошибка: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header userEmail={userEmail} />

      <div
        className="advisor-container"
        style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}
      >
        <h2>🧠 AI-Финансовый Советник</h2>
        <p>Выберите блок и получите персональный совет на основе данных.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() =>
              requestAdvice("budget", { balance, income, expense })
            }
          >
            💸 Совет по бюджету
          </button>
          <button
            onClick={() =>
              requestAdvice("operations", { last: transactions.slice(0, 5) })
            }
          >
            🧾 Совет по последним операциям
          </button>
          <button
            onClick={() => requestAdvice("piggybank", { piggybank: piggyBank })}
          >
            🐷 Совет по копилке
          </button>
          <button
            onClick={() =>
              requestAdvice("activity", {
                dates: transactions.map((t) => t.date),
              })
            }
          >
            📅 Совет по активности
          </button>
          <button onClick={() => requestAdvice("categories", { categories })}>
            🗂 Совет по категориям
          </button>
          <button
            onClick={() => requestAdvice("summary", { all: transactions })}
          >
            📊 Общий анализ
          </button>
        </div>

        {advice.length > 0 && (
          <div style={{ marginTop: "25px" }}>
            <h3>📋 Рекомендации:</h3>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: "#f0f7ff", // 👈 выделенный фон
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#0a2c47", // 👈 контрастный текст
              }}
            >
              {advice.map((item, index) => (
                <p key={index} style={{ marginBottom: "12px" }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Advisor;
