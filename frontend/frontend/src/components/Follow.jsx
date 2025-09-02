import React, { useEffect, useState } from "react";
import "../index.css";
import { apiGetUsers, apiFollow, apiUnfollow } from "../api";

// Função utilitária para pegar a URL do avatar
function getAvatarURL(user) {
    if (!user.avatar) return "https://ui-avatars.com/api/?background=0D8ABC&color=fff&size=128";
    if (user.avatar.startsWith("http")) return user.avatar;
    // URL direta de produção
    return `https://gustavob.pythonanywhere.com${user.avatar}`;
}

// Componente de avatar
const Avatar = ({ src, alt }) => (
    <div className="follow-ui-avatar">
        <img src={src} alt={alt} />
    </div>
);

// Linha de usuário
const UserRow = ({ user, onToggleFollow }) => (
    <div className="follow-ui-user">
        <div className="flex items-center">
            <Avatar src={getAvatarURL(user)} alt={user.username} />
            <div className="follow-ui-info">
                <div className="username">{user.username}</div>
                {user.name && <div className="name">{user.name}</div>}
            </div>
        </div>
        <button
            className={user.is_following ? "bg-white" : "bg-blue"}
            onClick={() => onToggleFollow(user)}
        >
            {user.is_following ? "Seguindo" : "Seguir"}
        </button>
    </div>
);

// Componente principal
export default function FollowUI({ tokenProp }) {
    const token = tokenProp || localStorage.getItem("token") || "";
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (!token) return;
        loadUsers();
    }, [token]);

    async function loadUsers() {
        setLoading(true);
        setError(null);
        const res = await apiGetUsers(token);
        if (!res.ok) {
            setError(res.data || `Erro ${res.code}`);
            setUsers([]);
        } else {
            setUsers(res.data || []);
        }
        setLoading(false);
    }

    async function handleToggleFollow(user) {
        if (!token) {
            alert("Faça login para seguir usuários.");
            return;
        }

        // Atualização otimista
        setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, is_following: !u.is_following } : u))
        );

        try {
            const action = user.is_following ? apiUnfollow : apiFollow;
            const res = await action(token, user.id);
            if (!res.ok && res.code !== 204) {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === user.id ? { ...u, is_following: user.is_following } : u
                    )
                );
                alert("Erro ao atualizar seguimento");
            }
        } catch (err) {
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === user.id ? { ...u, is_following: user.is_following } : u
                )
            );
            alert("Erro de rede");
        }
    }

    const filtered = users.filter(
        (u) =>
            u.username.toLowerCase().includes(query.toLowerCase()) ||
            (u.name || "").toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="follow-ui-container">
            <div className="follow-ui-header">
                <h2>Usuários</h2>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar usuário"
                />
                <button onClick={loadUsers}>Atualizar</button>
            </div>
            <div className="follow-ui-list">
                {loading && <p>Carregando...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {filtered.map((user) => (
                    <UserRow key={user.id} user={user} onToggleFollow={handleToggleFollow} />
                ))}
            </div>
        </div>
    );
}
