import { useNavigate } from "react-router-dom";

interface HeaderProps {
  userEmail: string | null;
}

const Header = ({ userEmail }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
    window.location.reload();
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleAdvisorClick = () => {
    navigate("/pages/Advisor");
  };

  return (
    <header className="site-header">
      <div className="logo">
        <span className="logo-text">Финансовый</span>
        <span className="logo-highlight">Помощник</span>
      </div>

      <div
        className="header-buttons"
        style={{ display: "flex", gap: "16px", alignItems: "center" }}
      >
        {userEmail && (
          <div
            className="profile-actions"
            style={{ display: "flex", gap: "12px", alignItems: "center" }}
          >
            <div
              className="profile-button"
              onClick={handleProfileClick}
              style={{ cursor: "pointer" }}
            >
              📧 {userEmail}
            </div>
            <button
              onClick={handleAdvisorClick}
              className="add-category-button1"
            >
              🧠 AI-Советник
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
