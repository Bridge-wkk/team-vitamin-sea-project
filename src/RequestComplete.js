import React from "react";
import "./RequestComplete.css";
import { useNavigate } from "react-router-dom";

export default function RequestComplete({
  requestUrl = "https://example.com/request/abcd1234", // 仮置き
  onCopy,
  onBackToTop,
}) {
  const navigate = useNavigate();
  return (
    <div className="rcPage">
      <div className="rcScreen">
        <div className="rcTitle">請求リンクが作成されました</div>

        {/* リンク表示エリア */}
        <div className="rcLinkBox">
          <a
            className="rcLink"
            href={requestUrl}
            target="_blank"
            rel="noreferrer"
          >
            {requestUrl}
          </a>
        </div>

        {/* ボタン */}
        <button
          className="rcCopyButton"
          type="button"
          onClick={() => {
            // 仮：押したらコピー関数を呼ぶ（未指定なら簡易コピー）
            if (onCopy) return onCopy(requestUrl);

            // ここだけ「仮でも動く」ようにしておく
            if (navigator.clipboard?.writeText) {
              navigator.clipboard.writeText(requestUrl);
              alert("リンクをコピーしました");
            } else {
              alert("この環境では自動コピーできません");
            }
          }}
        >
          リンクをコピー
        </button>

        <button
          className="rcBackButton"
          type="button"
          onClick={() => navigate("/")}
        >
          トップ画面に戻る
        </button>
      </div>
    </div>
  );
}
