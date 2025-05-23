import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { updateProfile } from "../api/auth";

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
          <div
            className="profile-info"
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              maxWidth: "480px",
              margin: "0 auto",
              marginTop: "24px",
            }}
          >
            {!editing ? (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ fontSize: "16px", color: "#333" }}>
                    <strong style={{ color: "#888" }}>Имя:</strong> {user.name}
                  </div>
                  <div style={{ fontSize: "16px", color: "#333" }}>
                    <strong style={{ color: "#888" }}>Email:</strong>{" "}
                    {user.email}
                  </div>
                </div>
                <div
                  className="profile-buttons"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <button className="edit-button" onClick={handleEditProfile}>
                    ✏️ Редактировать
                  </button>
                  <button className="back-button" onClick={handleBack}>
                    🔙 На главную
                  </button>
                  <button
                    className="dashboard-button"
                    onClick={handleGoToDashboard}
                  >
                    📊 В Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Имя"
                    className="edit_profile"
                  />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="edit_profile"
                  />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Новый пароль"
                    className="edit_profile"
                  />
                  <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    placeholder="Подтвердите пароль"
                    className="edit_profile"
                  />
                </div>
                <div
                  className="profile-buttons"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <button className="save-button" onClick={handleSave}>
                    💾 Сохранить изменения
                  </button>
                  <button
                    className="back-button"
                    onClick={() => setEditing(false)}
                  >
                    ❌ Отмена
                  </button>
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
