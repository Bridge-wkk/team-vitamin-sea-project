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
import BalanceHistory from "./BalanceHistory"; // ★追加

function Routers() {
  const [loginUser, setLoginUser] = useState(null);
  const [loading, setLoading] = useState(true); // 復元待ちの状態

  // ★ 自動ログアウトまでの時間（10分）
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

  // ★ 2. ログイン中：10分無操作なら自動ログアウト
  useEffect(() => {
    if (!loginUser) return;

    // 最後に操作した時刻を更新する
    const updateLastActive = () => {
      localStorage.setItem("lastActiveAt", String(Date.now()));
    };

    // ログインした瞬間も一度記録
    updateLastActive();

    // ユーザー操作を検知するイベント
    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) =>
      window.addEventListener(event, updateLastActive, { passive: true })
    );

    // 一定間隔で「最後の操作から10分経ったか」をチェック
    const intervalId = setInterval(() => {
      const lastActive = Number(localStorage.getItem("lastActiveAt"));
      const now = Date.now();

      if (!Number.isFinite(lastActive)) return;

      // 10分超えたらログアウト
      if (now - lastActive > AUTO_LOGOUT_MS) {
        localStorage.removeItem("loginUserId");
        localStorage.removeItem("lastActiveAt");
        setLoginUser(null);

        // ログイン画面へ
        window.location.href = "/";
      }
    }, 10 * 1000); // 10秒ごとにチェック

    // 後始末（コンポーネント破棄やログアウト時）
    return () => {
      clearInterval(intervalId);
      events.forEach((event) =>
        window.removeEventListener(event, updateLastActive)
      );
    };
  }, [loginUser, AUTO_LOGOUT_MS]);

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
          element={
            loginUser ? (
              <TransactionHistory loginUser={loginUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ★追加: 残高履歴画面 (ログイン必須) */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;