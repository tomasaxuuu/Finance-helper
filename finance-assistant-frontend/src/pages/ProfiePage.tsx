import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
    alert("Редактирование аккаунта скоро будет доступно!");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <Header userEmail={null} />
      <div className="profile-page">
        <h2 className="profile-title">Профиль</h2>
        {error && <p className="profile-error">{error}</p>}
        {user ? (
          <div className="profile-info">
            <p>
              <strong>Имя:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <div className="profile-buttons">
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
          </div>
        ) : (
          <p className="profile-loading">Загрузка...</p>
        )}
      </div>
    </>
  );
};

export default Profile;
