import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Compare from "./pages/Compare";
import ComparisonResults from "./pages/ComparisonResults";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/compare" replace />} />

        <Route path="/compare" element={<Compare />} />

        <Route path="/results" element={<ComparisonResults />} />

        <Route path="*" element={<Navigate to="/compare" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;