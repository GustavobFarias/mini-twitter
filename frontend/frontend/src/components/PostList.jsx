import React, { useEffect, useState } from "react";
import { getPosts } from "../api";
import '../index.css';

const PostList = ({ token }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    // Função utilitária para gerar URL da imagem
    const getPostImageURL = (image) => {
        if (!image) return "https://via.placeholder.com/300x200?text=Sem+imagem";
        if (image.startsWith("http")) return image;
        return `https://gustavob.pythonanywhere.com${image}`;
    };

    useEffect(() => {
        const fetchUserAndPosts = async () => {
            if (!token) return;
            try {
                const resUser = await fetch("https://gustavob.pythonanywhere.com/api/user/me/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resUser.ok) throw new Error("Erro ao buscar usuário logado");
                const userData = await resUser.json();
                setUserId(userData.id);

                const data = await getPosts(token);
                setPosts(data);
            } catch (err) {
                console.error("Erro:", err);
                setError("Não foi possível carregar os posts.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserAndPosts();
    }, [token]);

    const handleDelete = async (postId) => {
        if (!token) return;
        try {
            const res = await fetch(`https://gustavob.pythonanywhere.com/api/posts/${postId}/delete/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== postId));
            }
        } catch (error) {
            console.error("Erro ao deletar post:", error);
            alert("Erro de rede ao deletar o post.");
        }
    };

    if (loading) return <p>Carregando posts...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="feed-container">
            <h2>Posts</h2>
            {posts.length === 0 ? (
                <p>Nenhum post ainda!</p>
            ) : (
                posts.map(post => (
                    <div key={post.id} className="post">
                        <p className="post-author">{post.author.username}</p>
                        <p className="post-content">{post.text}</p>

                        {/* Mostrar imagem do post corretamente */}
                        <img
                            src={getPostImageURL(post.image)}
                            alt={post.text || "Post"}
                            className="post-image"
                        />

                        {/* Botão excluir só aparece se for meu post */}
                        {userId && post.author.id === userId && (
                            <button
                                className="delete-button"
                                onClick={() => handleDelete(post.id)}
                            >
                                Excluir
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default PostList;
