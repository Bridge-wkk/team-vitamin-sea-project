import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import "./Login.css";

const Login = ({ setLoginUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // PayRequest から渡された「戻り先」
  const redirectTo = location.state?.redirectTo;

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!id || !password) {
      alert("IDとパスワードを入力してください");
      return;
    }

    fetch(`http://localhost:3010/friends?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0 && data[0].password === password) {
          const user = data[0];

          localStorage.setItem("loginUserId", user.id);
          setLoginUser(user);

          // ★ここがポイント：戻り先があればそこへ、なければ /home
          navigate(redirectTo ?? "/home", { replace: true });
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
        <h2 className="screen-title" style={{ textAlign: "center", marginTop: "40px" }}>
          ログイン
        </h2>

        <div style={{ padding: "0 20px" }}>
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label className="input-label">ユーザーID</label>
            <input
              type="text"
              className="text-input"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="例: 1"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "30px" }}>
            <label className="input-label">パスワード</label>
            <input
              type="password"
              className="text-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="半角英数字を入力してください"
            />
          </div>

          <button className="login-btn" onClick={handleLogin}>
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
