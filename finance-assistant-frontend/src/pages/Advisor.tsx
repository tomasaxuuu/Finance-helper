import { useEffect, useState } from "react";
import Header from "../components/Header";
import { getTransactions } from "../api/finance";

const Advisor = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Получение транзакций пользователя
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Пользователь не авторизован.");

      const response = await getTransactions(token);
      setTransactions(Object.values(response.data));
    } catch (error) {
      console.error("Ошибка при загрузке транзакций:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Генерация советов на основе транзакций
  const generateAdvice = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Отсутствует токен авторизации");

      const cleanedTransactions = transactions
        .slice(0, 30)
        .map(({ id, type, amount, note, date, category_id }) => ({
          id,
          type,
          amount,
          note,
          date,
          category_id,
        }));

      const res = await fetch("http://127.0.0.1:8000/api/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactions: cleanedTransactions,
        }),
      });

      if (!res.ok) {
        const isJson = res.headers
          .get("content-type")
          ?.includes("application/json");

        if (isJson) {
          const err = await res.json();
          throw new Error(
            err.message || `Ошибка ${res.status}: ${res.statusText}`
          );
        } else {
          const html = await res.text();
          throw new Error("Получен HTML вместо JSON: " + html.slice(0, 100));
        }
      }

      const data = await res.json();
      console.log("📦 Ответ от сервера:", data); // ← добавь эту строку
      if (!data.choices || !data.choices[0]?.message?.content) {
        setAdvice([
          "🤖 GPT не дал ответ. Возможно, ошибка, превышен лимит токенов или недостаточно данных.",
        ]);
        return;
      }

      const gptText = data.choices[0].message.content;

      const lines = gptText
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line);

      setAdvice(lines);
    } catch (error: any) {
      console.error("Ошибка сети или запроса:", error);
      setAdvice([
        "❌ Ошибка при обращении к AI: " +
          (error.message || "Неизвестная ошибка."),
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header userEmail={null} />

      <div
        className="advisor-container"
        style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}
      >
        <h2>🧠 AI-Финансовый Советник</h2>
        <p>
          Нажмите кнопку, чтобы получить персональные советы на основе ваших
          транзакций.
        </p>

        <button
          onClick={generateAdvice}
          disabled={loading}
          className="add-category-button"
          style={{ marginTop: "15px" }}
        >
          {loading ? "Анализ..." : "Получить советы"}
        </button>

        {advice.length > 0 && (
          <div style={{ marginTop: "25px" }}>
            <h3>📋 Рекомендации:</h3>
            <ul>
              {advice.map((item, index) => (
                <li key={index} style={{ marginBottom: "10px" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Advisor;
