import { useLocation, useNavigate } from "react-router-dom";
import "./RequestComplete.css";

const RequestComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const link = location.state?.link;

  return (
    <div className="rcPage">
      <div className="rcScreen">
        <p className="rcTitle">請求リンクを作成しました</p>

        <div className="rcLinkBox">
          <a className="rcLink" href={link}>
            {window.location.origin}{link}
          </a>
        </div>

        <button
          className="rcCopyButton"
          onClick={() => navigator.clipboard.writeText(window.location.origin + link)}
        >
          リンクをコピー
        </button>

        <button className="rcBackButton" onClick={() => navigate("/")}>
          トップに戻る
        </button>
      </div>
    </div>
  );
};

export default RequestComplete;
