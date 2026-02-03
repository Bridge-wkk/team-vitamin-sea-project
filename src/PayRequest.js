import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PayRequest = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requesterName = params.get("from");
  const amount = Number(params.get("amount"));
  const message = params.get("message");

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <button onClick={() => navigate("/")}>＜ 戻る</button>

      <h3>{requesterName} さんからの請求</h3>

      <p style={{ fontSize: "20px", fontWeight: "bold" }}>
        {amount.toLocaleString()} 円
      </p>

      {message && <p>「{message}」</p>}

      <button
        style={{
          marginTop: "20px",
          padding: "12px 40px",
          background: "#d32f2f",
          color: "#fff",
          border: "none",
          borderRadius: "20px"
        }}
        onClick={() => navigate("/requestcomplete")}
      >
        送金する
      </button>
    </div>
  );
};

export default PayRequest;
