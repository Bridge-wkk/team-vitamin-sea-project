// src/Routers.js
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- 各画面のインポート ---
import App from "./App";
import Login from "./Login";
import RecipientList from "./RecipientList";
import Step4Screen from "./STEP4"; 
import Step6Screen from './step6';
import CreateRequest from "./CreateRequest";
import RequestComplete from "./RequestComplete";
import PayRequest from "./PayRequest";

function Routers() {
  const [loginUser, setLoginUser] = useState(null);
  const [loading, setLoading] = useState(true); // 復元待ちの状態

  // 1. ページ読み込み時にログイン情報を復元する
  useEffect(() => {
    const savedId = localStorage.getItem('loginUserId');
    if (savedId) {
      fetch(`http://localhost:3010/friends/${savedId}`)
        .then(res => res.json())
        .then(data => {
          setLoginUser(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("復元エラー:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // 読み込み中は何も表示しない（真っ白を防ぐ）
  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* ログイン画面 */}
        <Route path="/" element={<Login setLoginUser={setLoginUser} />} />

        {/* 各画面へ loginUser という名前でデータを配る */}
        <Route 
          path="/home" 
          element={loginUser ? <App loginUser={loginUser} /> : <Navigate to="/" />} 
        />

        <Route 
          path="/recipientlist" 
          element={loginUser ? <RecipientList loginUser={loginUser} /> : <Navigate to="/" />} 
        />

        <Route 
          path="/step4" 
          element={loginUser ? <Step4Screen loginUser={loginUser} /> : <Navigate to="/" />} 
        />

        <Route 
          path="/payrequest" 
          element={loginUser ? <PayRequest loginUser={loginUser} /> : <Navigate to="/" />} 
        />

        <Route 
          path="/createrequest" 
          element={loginUser ? <CreateRequest loginUser={loginUser} /> : <Navigate to="/" />} 
        />

        <Route path="/step6" element={<Step6Screen />} />
        <Route path="/requestcomplete" element={<RequestComplete />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;