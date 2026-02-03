import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import RecipientList from "./RecipientList";
import Step4Screen from "./STEP4";
import CreateRequest from "./CreateRequest";
import RequestComplete from "./RequestComplete";

function Routers() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/recipientlist" element={<RecipientList />} />
        <Route path="/step4" element={<Step4Screen />} />
        <Route path="/createrequest" element={<CreateRequest />} />
        <Route path="/requestcomplete" element={<RequestComplete />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;