import React from "react";

interface AuthFormProps {
  type: "login" | "register";
  form: {
    email: string;
    password: string;
    name?: string;
    password_confirmation?: string;
  };
  error?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  type,
  form,
  error,
  onChange,
  onSubmit,
}) => {
  return (
    <div className="container">
      <form onSubmit={onSubmit} className="card">
        {type === "register" && (
          <input
            type="text"
            name="name"
            placeholder="Имя"
            value={form.name || ""}
            onChange={onChange}
          />
        )}
        
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={form.password}
          onChange={onChange}
        />
        
        {type === "register" && (
          <input
            type="password"
            name="password_confirmation"
            placeholder="Подтвердите пароль"
            value={form.password_confirmation || ""}
            onChange={onChange}
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
        />
        
        {error && <p className="error-message">{error}</p>}
        
        <button type="submit">
          {type === "login" ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
