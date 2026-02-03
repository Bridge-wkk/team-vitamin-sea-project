import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";      // 共通レイアウト
import "./Login.css";    // ログイン画面専用

const Login = ({ setLoginUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // 1. 入力チェック
    if (!id || !password) {
      setError("IDとパスワードを入力してください");
      return;
    }

    try {
      // ★修正ポイント：問い合わせ先を 'users' から 'friends' に変更
      // db.json のキーが "friends" になっているため
      const response = await fetch(`http://localhost:3010/friends?id=${id}`);
      const data = await response.json();

      // 3. IDが見つかり、かつパスワードが一致するか確認
      if (data.length > 0 && data[0].password === password) {

        // --- ログイン成功 ---
        console.log("ログイン成功:", data[0]);

        // アプリ全体にユーザー情報をセット
        setLoginUser(data[0]);

        // 元いた場所（支払い画面など）があればそこへ戻る。なければトップへ。
        const fromPath = location.state?.from?.pathname || "/";
        const fromSearch = location.state?.from?.search || "";

        navigate(fromPath + fromSearch, { replace: true });

      } else {
        // --- ログイン失敗 ---
        setError("IDまたはパスワードが間違っています");
      }

    } catch (err) {
      console.error(err);
      setError("サーバーとの通信に失敗しました。json-serverは起動していますか？");
    }
  };

  return (
    <div className="page">
      <div className="screen">
        <h2 className="screen-title">ログイン</h2>

        {error && <p style={{ color: "red", textAlign: "center", fontSize: "14px", marginBottom: "20px" }}>{error}</p>}

        {/* ID入力 */}
        <div className="form-group">
          <label className="input-label">ID</label>
          <input
            type="text"
            className="text-input"
            placeholder="例: 1"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>

        {/* パスワード入力 */}
        <div className="form-group">
          <label className="input-label">PASS</label>
          <input
            type="password"
            className="text-input"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="login-btn" onClick={handleLogin}>
          ログイン
        </button>
      </div>
    </div>
  );
};

export default Login;