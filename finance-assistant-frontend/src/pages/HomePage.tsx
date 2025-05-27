import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { login, register, getUser } from "../api/auth";
import Header from "../components/Header";

const HomePage = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    password_confirmation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      if (type === "login") {
        if (!form.email.trim() || !form.password.trim()) {
          setError("Пожалуйста, заполните email и пароль для входа.");
          return;
        }

        const response = await login({
          email: form.email,
          password: form.password,
        });

        const token = response.data.access_token;
        localStorage.setItem("token", token);

        // <<< Вот здесь сразу получаем пользователя!
        const userResponse = await getUser(token);
        const email = userResponse.data.data.email;
        localStorage.setItem("userEmail", email);
        setUserEmail(email); // показать кнопку сразу
      } else {
        if (
          !form.name.trim() ||
          !form.email.trim() ||
          !form.password.trim() ||
          !form.password_confirmation.trim()
        ) {
          setError("Пожалуйста, заполните все поля для регистрации.");
          return;
        }

        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        });

        setType("login");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Ошибка при авторизации/регистрации"
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      getUser(token)
        .then((response) => {
          const email = response.data.data.email;
          localStorage.setItem("userEmail", email);
          setUserEmail(email);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
          setUserEmail(null); // сбрасываем если ошибка
        });
    }
  }, []);

  return (
    <div className="page-wrapper">
      <Header userEmail={userEmail} />
      <div className="home-container">
        <div className="background-animation">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="home-left">
          <h1>Ваш финансовый помощник</h1>
          <p className="subtext">Получите больше от своих финансов</p>
          <ul className="benefits">
            <li>
              <div className="benefit-content">
                <strong>Полный контроль над бюджетом</strong>
                <div>
                  Отслеживайте баланс, доходы и расходы в реальном времени
                </div>
              </div>
            </li>
            <li>
              <div className="benefit-content">
                <strong>Добавление операций в один клик</strong>
                <div>Быстро фиксируйте расходы и доходы по категориям</div>
              </div>
            </li>
            <li>
              <div className="benefit-content">
                <strong>Умная копилка</strong>
                <div>Копите и снимайте средства — как в реальной жизни</div>
              </div>
            </li>
            <li>
              <div className="benefit-content">
                <strong>Графики и аналитика</strong>
                <div>
                  Наглядные диаграммы по тратам, категориям и активности
                </div>
              </div>
            </li>
            <li>
              <div className="benefit-content">
                <strong>AI-советник</strong>
                <div>
                  Индивидуальные подсказки по оптимизации бюджета и привычек
                </div>
              </div>
            </li>
            <li>
              <div className="benefit-content">
                <strong>Экспорт в PDF</strong>
                <div>Сохраняйте отчёты и делитесь ими в удобном формате</div>
              </div>
            </li>
          </ul>
        </div>

        {!userEmail && (
          <div className="home-right">
            <div className="auth-card">
              <div className="auth-header">
                <button
                  type="button"
                  className={type === "login" ? "active" : ""}
                  onClick={() => setType("login")}
                >
                  Войти
                </button>
                <button
                  type="button"
                  className={type === "register" ? "active" : ""}
                  onClick={() => setType("register")}
                >
                  Зарегистрироваться
                </button>
              </div>

              <AuthForm
                type={type}
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                error={error}
              />
            </div>
          </div>
        )}
      </div>
      <footer className="site-footer">
        <div className="footer-content">
          <div className="legal-info">
            Данный проект разработан в рамках дипломной работы. Все функции
            реализованы в учебных целях. Данные не передаются третьим лицам и
            используются только локально.
          </div>
          <p>© 2025 tomasaxuuu — Финансовый помощник. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
