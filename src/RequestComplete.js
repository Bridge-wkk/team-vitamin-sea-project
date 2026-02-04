import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./RequestComplete.css";

const RequestComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const link = location.state?.link;
  const [copied, setCopied] = useState(false);

  const fullLink = window.location.origin + link;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);

      // 2秒後に元に戻す
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert("コピーに失敗しました");
    }
  };

  return (
    <div className="rcPage">
      <div className="rcScreen">
        <p className="rcTitle">請求リンクを作成しました</p>

        <div className="rcLinkBox">
          <a className="rcLink" href={link}>
            {fullLink}
          </a>
        </div>

        <button
          className="rcCopyButton"
          onClick={handleCopy}
          disabled={!link}
        >
          {copied ? "コピーしました！" : "リンクをコピー"}
        </button>

        <button className="rcBackButton" onClick={() => navigate("/home")}>
          トップに戻る
        </button>
      </div>
    </div>
  );
};

export default RequestComplete;
