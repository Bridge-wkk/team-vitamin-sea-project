import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import RecipientList from "./RecipientList";
import Step4Screen from "./STEP4";
function Routers() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/recipientlist" element={<RecipientList />} />
        <Route path="/step4" element={<Step4Screen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;