import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import RecipientList from "./RecipientList";

function Routers() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/recipientlist" element={<RecipientList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;