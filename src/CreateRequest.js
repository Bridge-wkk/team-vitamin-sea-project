// src/CreateRequest.jsx
import React from "react";
import "./App.css";           // ★重要：App.jsと同じレイアウトを使うため読み込む
import "./CreateRequest.css"; // この画面専用のスタイル

const CreateRequest = () => {

  const handleCreate = () => {
    console.log("リンク作成ボタンが押されました");
  };

  const handleBack = () => {
    console.log("戻るボタンが押されました");
  };

  return (
    // ★App.jsと同じ「page > screen」の入れ子構造にします
    <div className="page">
      <div className="screen">
        
        {/* タイトル */}
        <h2 className="screen-title">請求リンクの作成</h2>

        {/* 金額入力 */}
        <div className="form-group">
          <label className="input-label">請求金額</label>
          <input 
            type="number" 
            className="text-input" 
            placeholder="3000" 
          />
          <span className="currency-unit">円</span>
        </div>

        {/* メッセージ入力 */}
        <div className="form-group">
          <label className="input-label">メッセージ（任意）</label>
          <textarea 
            className="text-input" 
            placeholder="飲み会代お願いします！"
            rows="4" 
            style={{ resize: "none" }}
          ></textarea>
        </div>

        {/* 作成ボタン */}
        <button className="create-link-btn" onClick={handleCreate}>
          <span className="actionText">リンクを作成</span>
        </button>

        {/* 戻るボタン */}
        <button className="back-btn" onClick={handleBack}>
          トップ画面に戻る
        </button>

      </div>
    </div>
  );
};

export default CreateRequest;