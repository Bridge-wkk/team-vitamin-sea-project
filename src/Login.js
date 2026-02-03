import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";      // 共通レイアウト
import "./Login.css";    // ログイン画面専用

const Login = () => {
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // ★ 今は仮：入力チェックだけ
    if (!id || !password) {
      alert("IDとパスワードを入力してください");
      return;
    }

    // ★ 本来はここで認証API
    console.log("ログイン情報", { id, password });

    // 仮：ログイン成功としてトップへ
    navigate("/");
  };

  return (
    <div className="page">
      <div className="screen">
        <h2 className="screen-title">ログイン</h2>

        {/* ID */}
        <div className="form-group">
          <label className="input-label">ID</label>
          <input
            type="text"
            className="text-input"
            placeholder="ユーザーID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>

        {/* パスワード */}
        <div className="form-group">
          <label className="input-label">PASS</label>
          <input
            type="password"   // ★ここ重要：文字が見えない
            className="text-input"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* ログインボタン */}
        <button className="login-btn" onClick={handleLogin}>
          ログイン
        </button>
      </div>
    </div>
  );
};

export default Login;
