// src/CreateRequest.js
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./CreateRequest.css";

const CreateRequest = ({ loginUser }) => {
  const navigate = useNavigate();

  // 金額は文字列で持つ（入力制御しやすい）
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [message, setMessage] = useState("");

  // 残高（数値化しておく）
  const balance = useMemo(() => Number(loginUser?.balance || 0), [loginUser]);

  // 半角数字のみ許可（空は許可）
  const handleAmountChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setAmount("");
      setAmountError("1円以上の半角数字で入力してください");
      return;
    }

    // 半角数字以外を弾く
    if (!/^[0-9]+$/.test(value)) {
      return;
    }

    const n = Number(value);

    if (!Number.isInteger(n) || n < 1) {
      setAmountError("1円以上の半角数字で入力してください");
    } else if (n > balance) {
      setAmountError("残高を超えています");
    } else {
      setAmountError("");
    }

    setAmount(value);
  };

  const handleCreate = async () => {
    if (!loginUser) {
      alert("ログイン情報が取得できません。一度トップに戻ってください。");
      return;
    }

    // 最終防衛ライン
    const n = Number(amount);
    if (!Number.isInteger(n) || n < 1) {
      alert("請求金額は1円以上の半角数字で入力してください。");
      return;
    }
    if (n > balance) {
      alert("残高を超えています。");
      return;
    }

    const requestData = {
      requesterId: loginUser.id,
      requesterName: loginUser.name,
      amount: n,
      message,
      createdAt: new Date().toLocaleString("ja-JP"),
      status: "unpaid", // ✅ 追加：未払いで作る
    };

    try {
      // ✅ db.json に保存 → 作成されたデータ（id付き）を受け取る
      const res = await fetch("http://localhost:3010/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) throw new Error("request create failed");

      const created = await res.json(); // json-server は作成レコード（id付き）を返す
      const requestId = created.id;

      // ✅ ここが今回の肝：requestId をリンクに入れる
      // 互換のため requesterId/from も付与（あっても害なし）
      const link = `/payrequest?requestId=${encodeURIComponent(
        String(requestId)
      )}&requesterId=${encodeURIComponent(
        String(loginUser.id)
      )}&from=${encodeURIComponent(loginUser.name)}`;

      navigate("/requestcomplete", {
        state: { link },
      });
    } catch (err) {
      alert("請求の保存に失敗しました");
      console.error(err);
    }
  };

  if (!loginUser) return <div className="page">読み込み中...</div>;

  const isCreateDisabled = !amount || !!amountError;

  return (
    <div className="page">
      <div className="screen">
        <h2 className="screen-title">請求リンクの作成</h2>

        <div className="form-group">
          <label className="input-label">請求金額</label>

          <input
            type="text"
            className="text-input"
            value={amount}
            onChange={handleAmountChange}
            placeholder="3000"
            inputMode="numeric"
            pattern="[0-9]*"
            style={{
              borderColor: amountError ? "red" : undefined,
            }}
          />
          <span className="currency-unit">円</span>

          {amountError && (
            <div
              style={{
                color: "red",
                fontSize: "12px",
                marginTop: "6px",
                textAlign: "left",
              }}
            >
              {amountError}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="input-label">メッセージ（任意）</label>
          <textarea
            className="text-input"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="飲み会代お願いします！"
          />
        </div>

        <button
          onClick={handleCreate}
          className="create-link-btn"
          disabled={isCreateDisabled}
          style={{
            opacity: isCreateDisabled ? 0.6 : 1,
            cursor: isCreateDisabled ? "not-allowed" : "pointer",
          }}
        >
          リンクを作成
        </button>

        <button className="back-btn" onClick={() => navigate("/home")}>
          トップ画面に戻る
        </button>
      </div>
    </div>
  );
};

export default CreateRequest;
