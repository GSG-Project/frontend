import AppHeader from "../../components/AppHeader/AppHeader";
import "./Configuration.css";

export default function Configuration({ user, onLogout }) {
  return (
    <div className="configuration-page">
      <AppHeader user={user} onLogout={onLogout} />
      <main className="configuration-main">
        {/* هذه الصفحة فاضية حالياً */}
      </main>
    </div>
  );
}