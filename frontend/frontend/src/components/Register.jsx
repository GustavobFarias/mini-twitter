import React, { useState } from "react";
import { register } from "../api"; // certifique-se que o api.js está com BASE_URL de produção
import '../index.css';

const Register = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(username, password, name);
      if (data.access) {
        setToken(data.access);
        localStorage.setItem("token", data.access);
        alert("Cadastro realizado com sucesso!");
      } else {
        alert("Cadastro falhou: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar usuário.");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>Cadastro</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="login-input"
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="login-input"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
};

export default Register;
