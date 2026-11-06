import AppHeader from "../../components/AppHeader/AppHeader";
import "./Experiments.css";

export default function Experiments({ user, onLogout }) {
  return (
    <div className="experiments-page">
      <AppHeader user={user} onLogout={onLogout} />
      <main className="experiments-main">
        {/* هذه الصفحة فاضية حالياً */}
      </main>
    </div>
  );
}