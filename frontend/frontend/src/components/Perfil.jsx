import React, { useState, useEffect } from "react";
import "../index.css";

const Profile = () => {
    const [user, setUser] = useState({
        username: "",
        name: "",
        avatar: null,
        followers: 0,
        following: 0,
    });
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", username: "", password: "" });

    const token = localStorage.getItem("token"); // pega do localStorage

    const getAvatarURL = (avatar) => {
        return avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    };

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) return;
            const res = await fetch("https://gustavob.pythonanywhere.com/api/user/me/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setFormData({ name: data.name, username: data.username, password: "" });
            } else {
                console.error("Erro ao buscar usuário:", await res.json());
            }
        };
        fetchUser();
    }, [token]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);

        const form = new FormData();
        form.append("avatar", file);

        const res = await fetch(
            "https://gustavob.pythonanywhere.com/api/user/update-profile-image/",
            {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            }
        );

        if (res.ok) {
            const data = await res.json();
            setUser((prev) => ({ ...prev, avatar: data.avatar }));
        } else {
            console.error("Erro ao atualizar imagem:", await res.json());
        }
        setLoading(false);
    };

    const handleEditToggle = () => setEditing(!editing);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const payload = { name: formData.name, username: formData.username };
        if (formData.password) payload.password = formData.password;

        const res = await fetch("https://gustavob.pythonanywhere.com/api/user/update-profile/", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            setUser(data);
            setEditing(false);
            alert("Perfil atualizado com sucesso!");
        } else {
            console.error("Erro ao atualizar perfil:", await res.json());
            alert("Erro ao atualizar perfil");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-image-wrapper">
                    <img
                        src={getAvatarURL(user.avatar)}
                        alt="Foto de perfil"
                        className="profile-image"
                    />
                    <label className="profile-image-label">
                        {loading ? "Carregando..." : "📷"}
                        <input
                            type="file"
                            className="profile-image-input"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>

                {!editing ? (
                    <>
                        <h2 className="profile-username">
                            <span>Nome: </span> {user.name}
                        </h2>
                        <p className="profile-fullname">
                            <span>Usuário: </span> {user.username}
                        </p>
                        <button className="edit-button" onClick={handleEditToggle}>
                            Editar Perfil
                        </button>
                    </>
                ) : (
                    <div className="edit-form">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nome"
                        />
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Usuário"
                        />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nova senha"
                        />
                        <div className="edit-buttons">
                            <button onClick={handleSave}>Salvar</button>
                            <button onClick={handleEditToggle}>Cancelar</button>
                        </div>
                    </div>
                )}

                <div className="profile-stats">
                    <div>
                        <span className="stat-number">{user.followers}</span>
                        <span>Seguidores</span>
                    </div>
                    <div>
                        <span className="stat-number">{user.following}</span>
                        <span>Seguindo</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
