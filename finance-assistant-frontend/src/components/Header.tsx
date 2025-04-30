import { useNavigate } from "react-router-dom";

interface HeaderProps {
  userEmail: string | null;
}

const Header = ({ userEmail }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/"); // возвращаем на главную
    window.location.reload(); // принудительно обновляем страницу чтобы сразу убрать состояние
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="site-header">
      <div className="logo">
        <span className="logo-text">Финансовый</span>
        <span className="logo-highlight">Помощник</span>
      </div>

      {userEmail && (
        <div className="profile-actions">
          <div
            className="profile-button"
            onClick={handleProfileClick}
            style={{ cursor: "pointer" }}
          >
            📧 {userEmail}
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
