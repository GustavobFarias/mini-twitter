import React, { useState } from "react";
import '../index.css'

const NewPost = ({ token, onPostCreated }) => {
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("text", content);
        if (image) formData.append("image", image);

        const res = await fetch("https://gustavob.pythonanywhere.com/api/posts/", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                // NÃO colocar 'Content-Type', FormData já faz isso
            },
            body: formData
        });

        if (res.ok) {
            setContent("");
            setImage(null);
            if (onPostCreated) onPostCreated();
        } else {
            console.error("Erro ao criar post");
        }
    };

    return (
        <div className="new-post-container">
            <form onSubmit={handleSubmit}>
                <textarea
                    className="new-post-textarea"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="O que você está pensando?"
                />

                <div className="container-new-post-image-label">
                    <label className="new-post-image-label">
                        📷
                        <input
                            type="file"
                            className="new-post-image-input"
                            onChange={e => setImage(e.target.files[0])}
                        />
                    </label>
                    <button type="submit">Postar</button>
                </div>
            </form>
        </div>
    );
};

export default NewPost;
