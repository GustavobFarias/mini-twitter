import React, { useState } from "react";
import { login, register } from "../api.js";
import '../index.css';

const Auth = ({ setToken }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
        // Cadastro
        const data = await register(username, password);
        if (data.access) {
        setToken(data.access);
        localStorage.setItem("token", data.access);
        } else {
        alert("Cadastro falhou: " + JSON.stringify(data));
        }
    } else {
        // Login
        const data = await login(username, password);
        if (data.access) {
        setToken(data.access);
        localStorage.setItem("token", data.access);
        } else {
        alert("Login falhou");
        }
    }
    };

    return (
    <div className="login-container">
        <h2>{isRegister ? "Cadastro" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
        <input
            className="login-input"
            placeholder="Usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
        />
        <input
            className="login-input"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
        />
        <button className="login-button" type="submit">
            {isRegister ? "Cadastrar" : "Entrar"}
        </button>
        </form>
        <button
        className="toggle-button"
        onClick={() => setIsRegister(!isRegister)}
        >
        {isRegister ? "Já tem conta? Login" : "Não tem conta? Cadastre-se"}
        </button>
    </div>
    );
};

export default Auth;
