import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { login, register, getUser, updateProfile } from "../api/auth";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);

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

        const userResponse = await getUser(token);
        const userData = userResponse.data.data;
        setUser(userData);
        localStorage.setItem("userEmail", userData.email);
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

  const handleSave = async () => {
    setError(null);
    try {
      const res = await updateProfile(form);
      const updatedUser = res.data.data;

      // если сервер требует разлогинить
      if (res.data.force_logout) {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        setUser(null);
        setEditing(false);
        setForm({
          email: "",
          name: "",
          password: "",
          password_confirmation: "",
        });
        return;
      }

      // если всё хорошо — обновляем профиль и скрываем форму редактирования
      setUser(updatedUser);
      setEditing(false);
      setForm({
        ...form,
        password: "",
        password_confirmation: "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Ошибка при обновлении профиля");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUser(token)
        .then((res) => {
          const userData = res.data.data;
          setUser(userData);
          setForm({
            name: userData.name,
            email: userData.email,
            password: "",
            password_confirmation: "",
          });
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
          setUser(null);
        });
    }
  }, []);

  return (
    <div className="page-wrapper">
      <Header userEmail={user?.email || null} />
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

        <div className="home-right">
          {user ? (
            <div className="profile-card">
              <h2 className="profile-title">Профиль</h2>
              <div className="profile-avatar">👤</div>

              {!editing ? (
                <>
                  <div className="profile-fields">
                    <p>
                      <strong>Имя:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                  </div>
                  <div className="profile-buttons">
                    <button onClick={() => setEditing(true)}>
                      ✏️ Редактировать
                    </button>
                    <button onClick={() => navigate("/dashboard")}>
                      📊 В Dashboard
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("userEmail");
                        setUser(null);
                        setForm({
                          name: "",
                          email: "",
                          password: "",
                          password_confirmation: "",
                        });
                        window.location.reload();
                      }}
                    >
                      🚪 Выйти
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-edit-form">
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Имя"
                    />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Новый пароль"
                    />
                    <input
                      type="password"
                      name="password_confirmation"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      placeholder="Подтвердите пароль"
                    />
                  </div>
                  <div className="profile-buttons">
                    <button onClick={handleSave}>💾 Сохранить</button>
                    <button onClick={() => setEditing(false)}>❌ Отмена</button>
                  </div>
                </>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
