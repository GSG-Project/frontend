import "./PageState.css";

export default function PageState({ title, message, tone = "neutral", children }) {
  const isError = tone === "error";
  return (
    <div className={`page-state page-state-${tone}`} role={isError ? "alert" : "status"}>
      {title && <h2 className="page-state-title">{title}</h2>}
      {message && <p className="page-state-message">{message}</p>}
      {children && <div className="page-state-actions">{children}</div>}
    </div>
  );
}
