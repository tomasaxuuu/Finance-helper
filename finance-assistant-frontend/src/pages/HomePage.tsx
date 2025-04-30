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
      <Header userEmail={userEmail} /> {/* <<< передаем userEmail сюда */}

      <div className="home-container">
        {/* ... остальной код без изменений */}
        <div className="home-left">
          <h1>Ваш финансовый помощник</h1>
          <p className="subtext">Получите больше от своих финансов</p>
          <ul className="benefits">
            <li>
              <div className="benefit-content">
                <strong>Мечтайте и исполняйте</strong>
                <div>Начните двигаться к своим финансовым целям уже сейчас</div>
              </div>
            </li>
            <li>
              <div className="benefit-content">
                <strong>Управляйте сбережениями эффективно</strong>
                <div>С помощью рекомендаций финансового консультанта</div>
              </div>
            </li>
            <li>
              <div className="benefit-content">
                <strong>Возвращайте налоговый вычет онлайн</strong>
                <div>Без заполнения «миллиона бумажек» и очередей</div>
              </div>
            </li>
            <li>
              <div className="benefit-content">
                <strong>Изучайте новое</strong>
                <div>Полезные советы в области финансов и управления ими</div>
              </div>
            </li>
          </ul>
        </div>

        <div className="home-right">
          <div className="auth-card">
            <div className="auth-header">
              <button
                type="button"
                className={type === "login" ? "active" : ""}
                onClick={() => setType("login")}
              >
                Вход
              </button>
              <button
                type="button"
                className={type === "register" ? "active" : ""}
                onClick={() => setType("register")}
              >
                Регистрация
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
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="support-info">
            При возникновении вопросов вы можете обратиться по телефону горячей
            линии 8 (800) 100-12-10 (бесплатно для звонков по России)
          </div>
          <div className="legal-info">
            Услуги оказывает партнер ООО СК «Росгосстрах Жизнь» – компания ООО
            «МДАУ ИНВЕСТИЦИЯ». Услуги предполагают составление персонального
            финансового плана, оказание помощи в подготовке и заполнении
            документов, которые дают право на получение налогового вычета. ООО
            «МДАУ ИНВЕСТИЦИЯ» и ООО СК «Росгосстрах Жизнь» не гарантируют
            получение налогового вычета.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
