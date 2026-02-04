import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateRequest.css";

const CreateRequest = ({ loginUser }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  // ★ RecipientListから渡された相手の情報を受け取る
  const selectedUser = state?.selectedUser; 

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    if (!amount) {
      alert("金額を入力してください");
      return;
    }

    // ★ 保存するデータを作成
    const requestData = {
      requesterId: loginUser.id,
      requesterName: loginUser.name,
      targetId: selectedUser?.id || "なし", // 相手のID
      targetName: selectedUser?.name || "宛先指定なし", // 相手の名前
      amount: Number(amount),
      message: message,
      createdAt: new Date().toLocaleString('ja-JP')
    };

    try {
      // db.json に保存
      await fetch("http://localhost:3010/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      // 完了画面へ移動し、作成したリンクを渡す
      const link = `/payrequest?requesterId=${loginUser.id}&amount=${amount}`;
      navigate("/requestcomplete", { state: { link } });

    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  if (!loginUser) return <div className="page">読み込み中...</div>;

  return (
    <div className="page">
      <div className="screen">
        <h2 className="screen-title">請求リンクの作成</h2>

        {/* ★ 修正：誰に請求するかを表示するエリアを追加 */}
        {selectedUser && (
          <div style={{ textAlign: 'center', marginBottom: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>請求先</p>
            <img src={selectedUser.icon} style={{ width: '50px', borderRadius: '50%', margin: '5px 0' }} alt="" />
            <p style={{ fontWeight: 'bold', margin: 0 }}>{selectedUser.name} 様</p>
          </div>
        )}

        <div className="form-group">
          <label className="input-label">請求金額</label>
          <input
            type="number"
            className="text-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="3000"
          />
          <span className="currency-unit">円</span>
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

        <button onClick={handleCreate} className="create-link-btn">
          リンクを作成
        </button>

        <button className="back-btn" onClick={() => navigate("/")}>
          トップ画面に戻る
        </button>
      </div>
    </div>
  );
};

export default CreateRequest;