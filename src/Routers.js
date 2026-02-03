import React, { useState } from "react"; // ★重要：状態管理(useState)を使う
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // ★Navigateを追加

// --- 各画面のインポート ---
import App from "./App";
import Login from "./Login";         // ★ログイン画面
import RecipientList from "./RecipientList";
import Step4Screen from "./STEP4";
import Step6Screen from './step6';
import CreateRequest from "./CreateRequest";
import RequestComplete from "./RequestComplete";
import PayRequest from "./PayRequest";

function Routers() {
  // ★ここで「誰がログインしているか」を一元管理します
  // 初期値 null は「誰もログインしていない」状態
  const [loginUser, setLoginUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        
        {/* 1. ログイン画面 
             ログイン成功時に setLoginUser を実行してもらうために渡す
        */}
        <Route path="/login" element={<Login setLoginUser={setLoginUser} />} />

        {/* 2. トップ画面 (App)
             loginUser があれば表示し、ユーザー情報を渡す。
             なければログイン画面へ強制移動（リダイレクト）させる
        */}
        <Route 
          path="/" 
          element={
            loginUser ? <App user={loginUser} /> : <Navigate to="/login" />
          } 
        />

        {/* 3. 請求作成画面
             「誰からの請求か」を知るために user を渡す
        */}
        <Route path="/createrequest" element={<CreateRequest user={loginUser} />} />


        {/* --- その他の画面 --- */}
        <Route path="/recipientlist" element={<RecipientList />} />
        <Route path="/step4" element={<Step4Screen />} />
        <Route path="/step6" element={<Step6Screen />} />
        <Route path="/requestcomplete" element={<RequestComplete />} />
        <Route path="/payrequest" element={<PayRequest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;