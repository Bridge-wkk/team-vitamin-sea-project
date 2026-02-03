import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PayRequest = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requesterName = params.get("from") ?? "";
  const amountStr = params.get("amount") ?? "0";
  const amount = Number(amountStr);
  const message = params.get("message") ?? "";

  // Step6Screen が要求する形に合わせて用意
  // （本来は icon もユーザー情報から取る）
  const selectedUser = {
    name: requesterName,
    icon: "https://placehold.jp/150x150.png" // 仮画像
  };

  const handleSend = () => {
    // 送金完了画面へ遷移（stateで渡す）
    navigate("/step6", {
      state: {
        selectedUser,
        amount,
        message
      }
    });
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <button onClick={() => navigate("/")}>＜ 戻る</button>

      <h3>{requesterName} さんからの請求</h3>

      <p style={{ fontSize: "20px", fontWeight: "bold" }}>
        {Number.isFinite(amount) ? amount.toLocaleString() : "0"} 円
      </p>

      {message && <p>「{message}」</p>}

      <button
        style={{
          marginTop: "20px",
          padding: "12px 40px",
          background: "#d32f2f",
          color: "#fff",
          border: "none",
          borderRadius: "20px",
          cursor: "pointer"
        }}
        onClick={handleSend}
      >
        送金する
      </button>
    </div>
  );
};

export default PayRequest;
