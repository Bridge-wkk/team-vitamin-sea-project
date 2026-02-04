// src/Routers.js
import React, { useState, useEffect } from "react";
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
import BalanceHistory from "./BalanceHistory";
import NotYourRequest from "./NotYourRequest";
import RequestList from "./RequestList";
import TransactionDetail from "./TransactionDetail"; // ✅ 追加

function Routers() {
  const [loginUser, setLoginUser] = useState(null);
  const [loading, setLoading] = useState(true); // 復元待ちの状態

  // 自動ログアウトまでの時間（10分）
  const AUTO_LOGOUT_MS = 10 * 60 * 1000;

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

  // 2. ログイン中：10分無操作なら自動ログアウト
  useEffect(() => {
    if (!loginUser) return;

    const updateLastActive = () => {
      localStorage.setItem("lastActiveAt", String(Date.now()));
    };

    updateLastActive();

    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) =>
      window.addEventListener(event, updateLastActive, { passive: true })
    );

    const intervalId = setInterval(() => {
      const lastActive = Number(localStorage.getItem("lastActiveAt"));
      const now = Date.now();

      if (!Number.isFinite(lastActive)) return;

      if (now - lastActive > AUTO_LOGOUT_MS) {
        localStorage.removeItem("loginUserId");
        localStorage.removeItem("lastActiveAt");
        setLoginUser(null);

        window.location.href = "/";
      }
    }, 10 * 1000);

    return () => {
      clearInterval(intervalId);
      events.forEach((event) =>
        window.removeEventListener(event, updateLastActive)
      );
    };
  }, [loginUser, AUTO_LOGOUT_MS]);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* ログイン画面 */}
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

        {/* 完了画面など */}
        <Route path="/step6" element={<Step6Screen />} />
        <Route path="/requestcomplete" element={<RequestComplete />} />

        {/* 取引履歴画面（ログイン必須） */}
        <Route
          path="/transactionhistory"
          element={
            loginUser ? (
              <TransactionHistory loginUser={loginUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ✅ 取引詳細画面（ログイン必須） */}
        <Route
          path="/transaction/:kind/:id"
          element={
            loginUser ? (
              <TransactionDetail loginUser={loginUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 残高履歴画面（ログイン必須） */}
        <Route
          path="/balance"
          element={
            loginUser ? (
              <BalanceHistory loginUser={loginUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* この請求リンクはあなた宛てではありません */}
        <Route path="/notyourrequest" element={<NotYourRequest />} />

        <Route path="/requestlist" element={<RequestList loginUser={loginUser} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;
