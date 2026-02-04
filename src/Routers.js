// src/Routers.js
import React, { useState, useEffect } from "react";
// ★修正1: ここに Navigate を追加しました
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- 各画面のインポート ---
import App from "./App";
import Login from "./Login";
import RecipientList from "./RecipientList";
import Step4Screen from "./STEP4";
import Step6Screen from "./step6";
import CreateRequest from "./CreateRequest";
import RequestComplete from "./RequestComplete";
import PayRequest from "./PayRequest";
import TransactionHistory from "./TransactionHistory";

function Routers() {
  const [loginUser, setLoginUser] = useState(null);
  const [loading, setLoading] = useState(true); // 復元待ちの状態

  // 1. ページ読み込み時にログイン情報を復元する
  useEffect(() => {
    const savedId = localStorage.getItem("loginUserId");

    if (savedId) {
      fetch(`http://localhost:3010/friends/${savedId}`)
        .then((res) => res.json())
        .then((data) => {
          setLoginUser(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("復元エラー:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // 読み込み中は描画しない（復元が終わるまで待つ）
  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* ログイン画面 (パスは "/") */}
        <Route path="/" element={<Login setLoginUser={setLoginUser} />} />

        {/* ホーム */}
        <Route path="/home" element={<App loginUser={loginUser} />} />

        {/* 宛先一覧 */}
        <Route
          path="/recipientlist"
          element={<RecipientList loginUser={loginUser} />}
        />

        {/* Step4 */}
        <Route path="/step4" element={<Step4Screen loginUser={loginUser} />} />

        {/* 請求リンク作成 */}
        <Route
          path="/createrequest"
          element={<CreateRequest loginUser={loginUser} />}
        />

        {/* 請求リンク踏んだ先 */}
        <Route
          path="/payrequest"
          element={<PayRequest loginUser={loginUser} />}
        />

        {/* 送金完了画面など */}
        <Route path="/step6" element={<Step6Screen />} />
        <Route path="/requestcomplete" element={<RequestComplete />} />

        {/* 取引履歴画面 */}
        <Route
          path="/transactionhistory"
          // ★修正2: ログインしていない場合は "/" (ログイン画面) へ飛ばす
          element={loginUser ? <TransactionHistory loginUser={loginUser} /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;