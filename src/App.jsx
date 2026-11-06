import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
  const path = window.location.pathname;

  if (path === "/register") {
    return <Register />;
  }

  return <Login />;
}