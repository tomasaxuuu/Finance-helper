import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { updateProfile } from "../api/auth";
import { useForm } from "react-hook-form";


const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const response = await axios.get("http://localhost:8000/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.data);
      setForm({
        name: response.data.data.name,
        email: response.data.data.email,
        password: "",
        password_confirmation: "",
      });
    } catch (err) {
      setError("Ошибка загрузки профиля");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError(null);
    try {
      const res = await updateProfile(form);
      setUser(res.data.data);
      setEditing(false);
      setForm({
        ...form,
        password: "",
        password_confirmation: "",
      });
      if (res.data.force_logout) {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        navigate("/");
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка при обновлении профиля");
    }
  };

  return (
    <>
      <Header userEmail={user?.email || null} />
      <div className="profile-page">
        <h2 className="profile-title">Профиль</h2>
        {error && <p className="profile-error">{error}</p>}

        {user ? (
          <div className="profile-card">
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
                  <button onClick={handleEditProfile}>✏️ Редактировать</button>
                  <button onClick={handleBack}>🔙 На главную</button>
                  <button onClick={handleGoToDashboard}>📊 В Dashboard</button>
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
          <p className="profile-loading">Загрузка...</p>
        )}
      </div>
    </>
  );
};

export default Profile;
