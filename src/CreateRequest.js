import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import "./CreateRequest.css";

const CreateRequest = ({ loginUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedUser } = location.state || {};

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [message, setMessage] = useState("");

  // 請求金額確認画面
  const [isConfirming, setIsConfirming] = useState(false);

  // 二重送信防止
  const [isSubmitting, setIsSubmitting] = useState(false);

  // selectedUser が無い（直アクセス等）場合のガード
  // ここで return すると「壊れた画面」にならない
  if (!selectedUser) {
    return (
      <div className="page crPage">
        <div className="crHeader">
          <button className="crBackButton" onClick={() => navigate(-1)}>
            ＜ 戻る
          </button>
          <h2 className="crHeaderTitle">請求リンクの作成</h2>
        </div>

        <div className="screen" style={{ padding: "20px", textAlign: "center" }}>
          <p style={{ color: "#666" }}>
            請求相手が選択されていません。
            <br />
            宛先一覧から相手を選んでください。
          </p>
          <button
            className="create-link-btn"
            onClick={() => navigate("/recipientlist", { state: { mode: "request" } })}
            style={{ marginTop: "12px" }}
          >
            宛先一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  const validateAmount = (valueStr) => {
    if (valueStr === "") {
      // 空のときは「未入力」なのでエラーは出さない（ボタンdisabledで制御）
      setAmountError("");
      return;
    }
    if (!/^[0-9]+$/.test(valueStr)) {
      setAmountError("半角数字で入力してください");
      return;
    }
    const n = Number(valueStr);
    if (n < 1) {
      setAmountError("1円以上の半角数字で入力してください");
      return;
    }
    setAmountError("");
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // 数字以外は入力させない（空はOK）
    if (value !== "" && !/^[0-9]+$/.test(value)) return;

    setAmount(value);
    validateAmount(value);
  };

  // 最初の「リンクを作成」ボタン（確認画面へ）
  const handleInitialClick = () => {
    validateAmount(amount);
    if (!amount) return;
    if (amountError) return;
    if (isSubmitting) return;
    setIsConfirming(true);
  };

  // 実際の保存処理
  const handleCreate = async () => {
    if (!loginUser) {
      alert("ログイン情報が取得できません。トップに戻ってログインし直してください。");
      navigate("/", { replace: true, state: { redirectTo: "/createrequest" } });
      return;
    }

    validateAmount(amount);
    if (!amount || amountError) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    const n = Number(amount);

    const requestData = {
      requesterId: String(loginUser.id),
      requesterName: loginUser.name,
      receiverId: String(selectedUser.id),
      receiverName: selectedUser.name,
      amount: n,
      message: message || "",
      createdAt: new Date().toLocaleString("ja-JP"),
      status: "unpaid",
    };

    try {
      const res = await fetch("http://localhost:3010/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        throw new Error("requests POST failed");
      }

      const created = await res.json();
      const requestId = created.id;

      // ✅ 改善：リンクは requestId のみ（余計なパラメータは改ざん可能なので入れない）
      const link = `/payrequest?requestId=${encodeURIComponent(requestId)}`;

      navigate("/requestcomplete", { state: { link } });
    } catch (e) {
      console.error(e);
      alert("請求の保存に失敗しました");
      setIsSubmitting(false);
    }
  };

  const isCreateDisabled = !amount || !!amountError || isSubmitting;

  return (
    <div className="page crPage">
      <div className="crHeader">
        {/* 確認画面の時は入力に戻り、入力画面の時は前のページに戻る */}
        <button
          className="crBackButton"
          onClick={() => (isConfirming ? setIsConfirming(false) : navigate(-1))}
          disabled={isSubmitting}
        >
          ＜ 戻る
        </button>
        <h2 className="crHeaderTitle">{isConfirming ? "金額の最終確認" : "請求リンクの作成"}</h2>
      </div>

      <div className="screen">
        {!isConfirming ? (
          <>
            <div className="form-group">
              <label className="input-label">請求金額</label>
              <input
                type="text"
                inputMode="numeric"
                className="text-input"
                value={amount}
                onChange={handleAmountChange}
                placeholder="3000"
              />
              <span className="currency-unit">円</span>
              {amountError && <div className="error-text">{amountError}</div>}
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

            <button className="create-link-btn" onClick={handleInitialClick} disabled={isCreateDisabled}>
              リンクを作成
            </button>
          </>
        ) : (
          <div className="confirm-section" style={{ textAlign: "center", padding: "20px" }}>
            <p style={{ color: "#666" }}>以下の内容で請求リンクを作成しますか？</p>

            <div style={{ margin: "18px 0 8px", color: "#888", fontSize: "13px" }}>
              宛先：<b style={{ color: "#333" }}>{selectedUser.name}</b>
            </div>

            <div style={{ margin: "20px 0" }}>
              <span style={{ fontSize: "14px", color: "#888" }}>請求額</span>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "#d32f2f" }}>
                ¥{Number(amount || 0).toLocaleString()}
              </div>
            </div>

            {message && (
              <div
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "30px",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "12px", color: "#888" }}>メッセージ</span>
                <p style={{ margin: "5px 0 0" }}>{message}</p>
              </div>
            )}

            <button
              className="create-link-btn"
              onClick={handleCreate}
              style={{ backgroundColor: "#4CAF50", opacity: isSubmitting ? 0.7 : 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "作成中..." : "はい、作成します"}
            </button>

            <button
              className="crBackButton"
              onClick={() => setIsConfirming(false)}
              style={{ marginTop: "15px", float: "none", color: "#666" }}
              disabled={isSubmitting}
            >
              修正する
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRequest;
