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
  const [loginUser, setLoginUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setLoginUser={setLoginUser} />} />

        <Route
          path="/"
          element={loginUser ? <App user={loginUser} /> : <Navigate to="/login" />}
        />

        {/* ここは1個だけ */}
        <Route path="/createrequest" element={<CreateRequest user={loginUser} />} />

        <Route
        path="/recipientlist"
        element={<RecipientList loginUser={loginUser} />}
        />
        <Route
        path="/step4"
        element={<Step4Screen loginUser={loginUser} />}
        />
        <Route path="/step6" element={<Step6Screen />} />
        <Route path="/requestcomplete" element={<RequestComplete />} />
        <Route path="/payrequest" element={<PayRequest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;
