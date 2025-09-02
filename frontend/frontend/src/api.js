const BASE_URL = "https://gustavob.pythonanywhere.com/api";

// Função auxiliar para fetch JSON
async function fetchJSON(url, opts = {}) {
    const res = await fetch(url, opts);
    const text = await res.text();
    try {
        return { ok: res.ok, code: res.status, data: text ? JSON.parse(text) : null };
    } catch (e) {
        return { ok: res.ok, code: res.status, data: text };
    }
}

// -------------------
// AUTENTICAÇÃO
// -------------------
export const login = async (username, password) => {
    const res = await fetch("https://gustavob.pythonanywhere.com/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    return res.json();
};

export const register = async (username, password, name = "") => {
    try {
        const res = await fetch(`${BASE_URL}/register/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, name }),
        });

        const data = await res.json();

        if (res.status === 201) {
        // Login automático após cadastro
            const loginRes = await fetch(`${BASE_URL}/token/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
        });
        return await loginRes.json();
        }

        return data;
    } catch (err) {
        console.error("Erro no cadastro:", err);
        return { error: "Erro no cadastro" };
    }
};

// -------------------
// USUÁRIO
// -------------------
export const apiGetUsers = async (token) => {
    return await fetchJSON(`${BASE_URL}/users/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const updateProfileImage = async (token, formData) => {
    const res = await fetch(`${BASE_URL}/user/update-profile-image/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }, // ⚠️ não definir Content-Type
        body: formData,
    });
    if (!res.ok) {
        console.error("Erro ao atualizar imagem:", await res.json());
        throw new Error("Unauthorized");
    }
    return res.json();
};

// -------------------
// POSTS
// -------------------
export const getPosts = async (token) => {
    const res = await fetch(`${BASE_URL}/posts/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        console.error("Erro ao buscar posts:", await res.json());
        return [];
    }
    return res.json();
};

export const createPost = async (token, text) => {
    const res = await fetch(`${BASE_URL}/posts/`, {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
    if (!res.ok) {
        console.error("Erro ao criar post:", await res.json());
        return null;
    }
    return res.json();
};

// -------------------
// FOLLOW / UNFOLLOW
// -------------------
export const apiFollow = async (token, userId) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/follow/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        console.error("Erro ao seguir usuário:", await res.json());
        return { ok: false, code: res.status, data: await res.json() };
    }
    return { ok: true, code: res.status, data: await res.json() };
};

export const apiUnfollow = async (token, userId) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/follow/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 204) {
        console.error("Erro ao deixar de seguir usuário:", await res.json());
        return { ok: false, code: res.status, data: await res.json() };
    }
    return { ok: true, code: res.status, data: await res.json() };
};