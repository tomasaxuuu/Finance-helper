import React from "react";

interface UserFormProps {
  form: {
    email: string;
    password?: string;
    name?: string;
    password_confirmation?: string;
  };
  showName?: boolean;
  showConfirmation?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error?: string | null;
  submitText: string;
}

const UserForm: React.FC<UserFormProps> = ({
  form,
  showName = true,
  showConfirmation = true,
  onChange,
  onSubmit,
  error,
  submitText,
}) => {
  return (
    <form onSubmit={onSubmit} className="card">
      {showName && (
        <input
          type="text"
          name="name"
          placeholder="Имя"
          value={form.name || ""}
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
      <input
        type="password"
        name="password"
        placeholder="Пароль"
        value={form.password || ""}
        onChange={onChange}
      />
      {showConfirmation && (
        <input
          type="password"
          name="password_confirmation"
          placeholder="Подтвердите пароль"
          value={form.password_confirmation || ""}
          onChange={onChange}
        />
      )}
      {error && <p className="error-message">{error}</p>}
      <button type="submit">{submitText}</button>
    </form>
  );
};

export default UserForm;
