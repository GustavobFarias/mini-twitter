// App.jsx
import React, { useState } from "react";
import Auth from "./components/Auth.jsx";
import PostList from "./components/PostList";
import NewPost from "./components/NewPost";
import Perfil from "./components/Perfil.jsx";
import FollowUI from './components/Follow.jsx'

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [refresh, setRefresh] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // novo estado

  if (!token) return <Auth setToken={setToken} />;

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <div className="app-container" style={{ width: "500px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Mini Twitter</h1>
        <div>
          <FollowUI />
          <button 
            className="toggle-button" 
            onClick={() => setShowProfile(!showProfile)}
          >
            {showProfile ? "Feed" : "Perfil"}
          </button>
          <button className="logout-button" onClick={handleLogout}>Sair da conta</button>
        </div>
      </div>

      {showProfile ? (
        <Perfil />
      ) : (
        <>
          <NewPost token={token} onPostCreated={() => setRefresh(!refresh)} />
          <PostList token={token} key={refresh} />
        </>
      )}
    </div>
  );
}

export default App;
