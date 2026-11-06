import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import "./ComparisonResults.css";

export default function ComparisonResults({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { promptText = "", modelA, modelB, comparisonResponse } = location.state || {};

  const resultsArray = comparisonResponse?.results || [];
  const evaluationScores = comparisonResponse?.evaluation?.evaluations || [];
  const evaluationError = comparisonResponse?.evaluation_error;

  const getModelData = (modelId, fallbackIndex) => {
    const result = resultsArray.find((r) => r.model_id === modelId) || resultsArray[fallbackIndex] || {};
    const evalData = evaluationScores.find((e) => e.model_id === modelId) || {};
    
    const latencyStr = result.metadata?.latency_ms != null ? `${(result.metadata.latency_ms / 1000).toFixed(2)} s` : "Unavailable";
    const tokensStr = (result.metadata?.input_tokens != null && result.metadata?.output_tokens != null) 
      ? `${result.metadata.input_tokens} / ${result.metadata.output_tokens}` 
      : "Unavailable";
    const costStr = result.metadata?.cost != null ? `$${result.metadata.cost.toFixed(6)}` : "Unavailable";
    
    return {
      name: modelId || `Model ${fallbackIndex === 0 ? "A" : "B"}`,
      quality: evalData.overall_score != null ? evalData.overall_score.toFixed(1) : "N/A",
      latency: latencyStr,
      cost: costStr,
      tokens: tokensStr,
      status: result.status === "success" ? "Completed" : (result.status === "failed" ? "Failed" : "Unknown"),
      text: result.answer || result.error || "No response generated.",
    };
  };

  const results = {
    modelA: getModelData(modelA, 0),
    modelB: getModelData(modelB, 1),
  };

  const [isRerunning, setIsRerunning] = useState(false);
  const [rerunMessage, setRerunMessage] = useState("");

  const handleRerun = () => {
    if (isRerunning) return;
    setIsRerunning(true);
    setRerunMessage("");
    setTimeout(() => {
      setIsRerunning(false);
      setRerunMessage("Demo rerun finished.");
    }, 1200);
  };

  return (
    <div className="results-page">
      <AppHeader user={user} onLogout={onLogout} />

      <main className="results-main">
        <div className="results-header">
          <div className="results-title-group">
            <h1 className="results-title">Comparison Results</h1>
            <span className="results-subtitle">{results.modelA.name} vs. {results.modelB.name}</span>
          </div>
          <div className="results-actions">
            <button className="results-btn-outline" onClick={handleRerun} disabled={isRerunning}>
              {isRerunning ? "Rerunning..." : "Rerun"}
            </button>
            <button className="results-btn-dark" onClick={() => navigate("/compare")}>
              New Comparison
            </button>
          </div>
        </div>

        {promptText && (
          <div className="results-prompt" title={promptText}>
            <strong>Prompt</strong>
            <span>{promptText}</span>
          </div>
        )}

        {rerunMessage && <div className="results-notice">{rerunMessage}</div>}
        {evaluationError && <div className="results-error-notice"><strong>Evaluation Error:</strong> {evaluationError}</div>}

        <div className="results-summary-row">
          <div className="results-summary-card">
            <div className="results-summary-label">Quality</div>
            <div className="results-summary-values"><span>A: {results.modelA.quality}</span><span>B: {results.modelB.quality}</span></div>
          </div>
          <div className="results-summary-card">
            <div className="results-summary-label">Latency</div>
            <div className="results-summary-values"><span>A: {results.modelA.latency}</span><span>B: {results.modelB.latency}</span></div>
          </div>
          <div className="results-summary-card">
            <div className="results-summary-label">Estimated Cost</div>
            <div className="results-summary-values"><span>A: {results.modelA.cost}</span><span>B: {results.modelB.cost}</span></div>
          </div>
        </div>

        <div className="results-responses-row">
          <div className="results-response-card">
            <div className="results-response-header">
              <span>{results.modelA.name}</span>
              <span className={`results-badge ${results.modelA.status === 'Completed' ? 'completed' : 'failed'}`}>{results.modelA.status}</span>
            </div>
            <div className="results-response-body">{results.modelA.text}</div>
          </div>
          <div className="results-response-card">
            <div className="results-response-header">
              <span>{results.modelB.name}</span>
              <span className={`results-badge ${results.modelB.status === 'Completed' ? 'completed' : 'failed'}`}>{results.modelB.status}</span>
            </div>
            <div className="results-response-body">{results.modelB.text}</div>
          </div>
        </div>

        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr><th>Model</th><th>Tokens (In / Out)</th><th>Latency</th><th>Est. Cost</th><th>Quality</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{results.modelA.name}</strong></td>
                <td className={results.modelA.tokens === "Unavailable" ? "results-muted-cell" : ""}>{results.modelA.tokens}</td>
                <td>{results.modelA.latency}</td>
                <td className={results.modelA.cost === "Unavailable" ? "results-muted-cell" : ""}>{results.modelA.cost}</td>
                <td>{results.modelA.quality}</td>
                <td>{results.modelA.status}</td>
              </tr>
              <tr>
                <td><strong>{results.modelB.name}</strong></td>
                <td className={results.modelB.tokens === "Unavailable" ? "results-muted-cell" : ""}>{results.modelB.tokens}</td>
                <td>{results.modelB.latency}</td>
                <td className={results.modelB.cost === "Unavailable" ? "results-muted-cell" : ""}>{results.modelB.cost}</td>
                <td>{results.modelB.quality}</td>
                <td>{results.modelB.status}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="results-bottom-row">
          <div className="results-panel">
            <h2 className="results-panel-title">Quality Evaluation</h2>
            <div className="results-panel-scores">
              <span>Overall</span>
              <span>A: {results.modelA.quality}</span>
              <span>B: {results.modelB.quality}</span>
            </div>
            <div className="results-reasoning">
              <strong>Winner:</strong> {comparisonResponse?.evaluation?.winner_model_id || "N/A"} <br />
              <strong>Reasoning:</strong> {comparisonResponse?.evaluation?.reasoning || "No reasoning provided."}
            </div>
          </div>
          <div className="results-panel">
            <h2 className="results-panel-title">Cost vs. Quality</h2>
            <div className="results-panel-scores"><span>Overall</span><span>A: {results.modelA.quality}</span><span>B: {results.modelB.quality}</span></div>
            <div className="results-reasoning"><p className="results-muted-text">Chart placeholder.</p></div>
          </div>
          <div className="results-panel">
            <h2 className="results-panel-title">Latency vs. Quality</h2>
            <div className="results-reasoning results-center-content"><p className="results-muted-text">Chart placeholder.</p></div>
          </div>
        </div>
      </main>
    </div>
  );
}