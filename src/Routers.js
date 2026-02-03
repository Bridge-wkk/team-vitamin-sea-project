// src/Routers.js
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App";
import Login from "./Login";
import RecipientList from "./RecipientList";
import Step4Screen from "./STEP4";
import Step6Screen from "./step6";
import CreateRequest from "./CreateRequest";
import RequestComplete from "./RequestComplete";
import PayRequest from "./PayRequest";

function Routers() {
  // ログインユーザーの状態を管理
  const [loginUser, setLoginUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* ログイン画面：成功時に setLoginUser を実行 */}
        <Route path="/login" element={<Login setLoginUser={setLoginUser} />} />

        {/* トップ画面：userプロップスを渡す */}
        <Route 
          path="/" 
          element={
            loginUser ? <App user={loginUser} onLogout={() => setLoginUser(null)} /> // ★onLogoutを追加
      : <Navigate to="/login" />
          } 
        />

        <Route path="/createrequest" element={<CreateRequest user={loginUser} />} />

        {/* 送金STEP4：ここでも user情報を渡すように設定（★重要） */}
        <Route 
          path="/step4" 
          element={
            loginUser ? <Step4Screen user={loginUser} /> : <Navigate to="/login" />
          } 
        />

        {/* 請求作成画面 */}
        <Route path="/createrequest" element={<CreateRequest user={loginUser} />} />

        {/* その他の画面 */}
        <Route path="/recipientlist" element={<RecipientList loginUser={loginUser} />}
        />
        <Route path="/step6" element={<Step6Screen />} />
        <Route path="/requestcomplete" element={<RequestComplete />} />
        <Route path="/payrequest" element={<PayRequest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;
