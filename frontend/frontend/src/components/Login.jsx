import React, { useState } from "react";
import { login } from "../api.js";
import '../index.css'

const Login = ({ setToken }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await login(username, password);
        if (data.access) {
            setToken(data.access);
            localStorage.setItem("token", data.access);
        } else {
        alert("Login falhou");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
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
                <button className="login-button" type="submit">Entrar</button>
            </form>
        </div>
    );
};

export default Login;
