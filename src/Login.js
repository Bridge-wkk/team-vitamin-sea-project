// src/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./Login.css";

const Login = ({ setLoginUser }) => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!id || !password) {
      alert("IDとパスワードを入力してください");
      return;
    }

    // friendsからIDが一致するユーザーを取得
    fetch(`http://localhost:3010/friends?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        // IDが存在し、かつパスワードが一致するかチェック
        if (data.length > 0 && data[0].password === password) {
          const user = data[0];
          
          // ★1. ブラウザにIDを保存（リロード対策）
          localStorage.setItem('loginUserId', user.id);
          
          // ★2. 親(Routers)の状態を更新。これが無いと /home に行っても戻されます
          setLoginUser(user);
          
          // ★3. ホームへ移動
          navigate("/home");
        } else {
          alert("IDまたはパスワードが間違っています");
        }
      })
      .catch((err) => {
        console.error("通信エラー:", err);
        alert("サーバーに接続できません。json-serverを起動してください。");
      });
  };

  return (
    <div className="page">
      <div className="screen">
        <h2 className="screen-title" style={{ textAlign: "center", marginTop: "40px" }}>ログイン</h2>
        <div style={{ padding: "0 20px" }}>
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label className="input-label">ユーザーID</label>
            <input type="text" className="text-input" value={id} onChange={(e) => setId(e.target.value)} placeholder="例: 1" />
          </div>
          <div className="form-group" style={{ marginBottom: "30px" }}>
            <label className="input-label">パスワード</label>
            <input type="password" className="text-input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="login-btn" onClick={handleLogin}>ログイン</button>
        </div>
      </div>
    </div>
  );
};

export default Login;