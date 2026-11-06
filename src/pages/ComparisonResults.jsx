import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";

const modelNames = {
  "gpt-4": "GPT-4",
  "claude-3": "Claude 3",
  "gpt-3.5": "GPT-3.5",
  "llama-3": "Llama 3",
};

function getModelName(modelId, fallbackName) {
  return modelNames[modelId] || modelId || fallbackName;
}

export default function ComparisonResults() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read the selected models and prompt sent from the Compare page.
  const comparison = location.state || {};
  const modelAName = getModelName(comparison.modelA, "Model A");
  const modelBName = getModelName(comparison.modelB, "Model B");
  const promptText = comparison.promptText || "";

  // These values are temporary examples until the backend is connected.
  const results = {
    modelA: {
      name: modelAName,
      quality: "8.5",
      latency: "1.24 s",
      cost: "$0.0034",
      tokens: "1200 / 450",
      status: "Completed",
      text: `This is sample response content for ${modelAName}. A real response from the selected model will appear here after backend integration.`,
    },
    modelB: {
      name: modelBName,
      quality: "7.2",
      latency: "2.50 s",
      cost: "Unavailable",
      tokens: "Unavailable",
      status: "Completed",
      text: `This is sample response content for ${modelBName}. Real response content and usage information will appear here after backend integration.`,
    },
  };

  const [isRerunning, setIsRerunning] = useState(false);
  const [rerunMessage, setRerunMessage] = useState("");

  const handleRerun = () => {
    if (isRerunning) return;

    setIsRerunning(true);
    setRerunMessage("");

    // Temporary UI simulation. Replace this with a backend request later.
    window.setTimeout(() => {
      setIsRerunning(false);
      setRerunMessage(
        "Demo rerun finished. Real model execution is not connected yet."
      );
    }, 1200);
  };

  const handleNewComparison = () => {
    navigate("/compare");
  };

  return (
    <div className="results-page-wrapper">
      <style>{`
        .results-page-wrapper {
          --results-primary: #6D4AFF;
          --results-bg: #F3EFFF;
          --results-text: #171426;
          --results-white: #FFFFFF;
          --results-border: #E5E7EB;
          --results-success: #10B981;
          --results-muted: #6B7280;

          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 100vh;
          height: 100vh;
          overflow: hidden;
          background-color: var(--results-bg);
          color: var(--results-text);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .results-page-wrapper,
        .results-page-wrapper * {
          box-sizing: border-box;
        }

        .results-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 1400px;
          min-height: 0;
          margin: 0 auto;
          padding: 12px 24px;
        }

        .results-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          gap: 16px;
        }

        .results-title-group {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px 12px;
        }

        .results-page-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .results-page-subtitle {
          color: var(--results-muted);
          font-size: 0.85rem;
        }

        .results-demo-label {
          color: #805B00;
          background: #FFF4CC;
          border-radius: 4px;
          padding: 3px 7px;
          font-size: 0.68rem;
          font-weight: 600;
        }

        .results-actions {
          display: flex;
          flex-shrink: 0;
          gap: 8px;
        }

        .results-btn-outline,
        .results-btn-dark {
          padding: 6px 14px;
          border: 1px solid var(--results-border);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .results-btn-outline {
          background: transparent;
          color: var(--results-text);
        }

        .results-btn-dark {
          border-color: var(--results-text);
          background: var(--results-text);
          color: var(--results-white);
        }

        .results-btn-outline:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .results-notice {
          flex-shrink: 0;
          padding: 7px 10px;
          border: 1px solid #E9D8A6;
          border-radius: 6px;
          background: #FFFBEB;
          color: #805B00;
          font-size: 0.75rem;
        }

        .results-prompt {
          display: flex;
          align-items: baseline;
          gap: 8px;
          min-width: 0;
          flex-shrink: 0;
          padding: 8px 12px;
          border: 1px solid var(--results-border);
          border-radius: 6px;
          background: var(--results-white);
          color: var(--results-muted);
          font-size: 0.78rem;
        }

        .results-prompt strong {
          flex-shrink: 0;
          color: var(--results-text);
        }

        .results-prompt span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .results-summary-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          flex-shrink: 0;
        }

        .results-summary-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 14px;
          border: 1px solid var(--results-border);
          border-radius: 6px;
          background: var(--results-white);
        }

        .results-summary-label {
          color: var(--results-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .results-summary-values {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .results-responses-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          flex: 1.2;
          gap: 12px;
          min-height: 0;
        }

        .results-response-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
          border: 1px solid var(--results-border);
          border-radius: 6px;
          background: var(--results-white);
        }

        .results-response-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--results-border);
          background: #FAFAFA;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .results-badge {
          flex-shrink: 0;
          padding: 2px 8px;
          border-radius: 4px;
          background: #D1FAE5;
          color: #065F46;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .results-response-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          color: #4B5563;
          font-size: 0.85rem;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .results-table-container {
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid var(--results-border);
          border-radius: 6px;
          background: var(--results-white);
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.8rem;
        }

        .results-table th,
        .results-table td {
          padding: 8px 12px;
          border-bottom: 1px solid var(--results-border);
        }

        .results-table th {
          background: #FAFAFA;
          color: var(--results-muted);
          font-weight: 600;
        }

        .results-table tbody tr:last-child td {
          border-bottom: none;
        }

        .results-muted-cell {
          color: var(--results-muted);
        }

        .results-bottom-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          flex: 1;
          gap: 12px;
          min-height: 0;
        }

        .results-panel {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
          padding: 12px;
          border: 1px solid var(--results-border);
          border-radius: 6px;
          background: var(--results-white);
        }

        .results-panel-title {
          margin: 0 0 8px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .results-panel-scores {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px dashed var(--results-border);
          font-size: 0.8rem;
        }

        .results-skeleton-lines {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 6px;
        }

        .results-s-line {
          height: 6px;
          border-radius: 4px;
          background: #F3F4F6;
        }

        .results-s-line.short {
          width: 70%;
        }

        .results-panel-footer {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
          color: var(--results-muted);
          font-size: 0.75rem;
        }

        .results-link-text {
          color: var(--results-text);
          text-decoration: underline;
          cursor: pointer;
        }

        .results-chart-container {
          position: relative;
          flex: 1;
          min-height: 80px;
          margin: 10px 10px 15px 15px;
          border-bottom: 1px solid var(--results-border);
          border-left: 1px solid var(--results-border);
        }

        .results-axis-label {
          position: absolute;
          color: var(--results-muted);
          font-size: 0.65rem;
        }

        .results-axis-label.y-axis {
          top: -10px;
          left: -10px;
        }

        .results-axis-label.x-axis {
          right: 0;
          bottom: -15px;
        }

        .results-data-point {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 12px;
          height: 12px;
          transform: translate(-50%, 50%);
          border: 1.5px solid #333;
          border-radius: 50%;
          background: var(--results-white);
          font-size: 0.6rem;
        }

        .results-point-a {
          bottom: 80%;
          left: 30%;
        }

        .results-point-b {
          bottom: 40%;
          left: 70%;
        }

        @media (max-width: 1024px) {
          .results-page-wrapper {
            height: auto;
            min-height: 100vh;
            overflow: visible;
          }

          .results-main-content {
            height: auto;
          }

          .results-summary-row,
          .results-bottom-row {
            grid-template-columns: 1fr;
          }

          .results-responses-row {
            grid-template-columns: 1fr;
            flex: none;
          }

          .results-response-card {
            min-height: 180px;
          }

          .results-panel {
            min-height: 180px;
          }

          .results-chart-container {
            min-height: 150px;
          }
        }

        @media (max-width: 600px) {
          .results-main-content {
            padding: 12px;
          }

          .results-page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .results-actions {
            width: 100%;
          }

          .results-actions button {
            flex: 1;
          }

          .results-table-container {
            overflow-x: auto;
          }

          .results-table {
            min-width: 620px;
          }
        }
      `}</style>

      <AppHeader />

      <main className="results-main-content">
        <div className="results-page-header">
          <div className="results-title-group">
            <h1 className="results-page-title">Comparison Results</h1>
            <span className="results-page-subtitle">
              {modelAName} vs. {modelBName}
            </span>
            <span className="results-demo-label">Demo data</span>
          </div>

          <div className="results-actions">
            <button
              className="results-btn-outline"
              onClick={handleRerun}
              disabled={isRerunning}
            >
              {isRerunning ? "Rerunning..." : "Rerun"}
            </button>

            <button
              className="results-btn-dark"
              onClick={handleNewComparison}
            >
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

        {rerunMessage && (
          <div className="results-notice" role="status">
            {rerunMessage}
          </div>
        )}

        <div className="results-summary-row">
          <div className="results-summary-card">
            <div className="results-summary-label">Quality</div>
            <div className="results-summary-values">
              <span>A: {results.modelA.quality}</span>
              <span>B: {results.modelB.quality}</span>
            </div>
          </div>

          <div className="results-summary-card">
            <div className="results-summary-label">Latency</div>
            <div className="results-summary-values">
              <span>A: {results.modelA.latency}</span>
              <span>B: {results.modelB.latency}</span>
            </div>
          </div>

          <div className="results-summary-card">
            <div className="results-summary-label">Estimated Cost</div>
            <div className="results-summary-values">
              <span>A: {results.modelA.cost}</span>
              <span>B: {results.modelB.cost}</span>
            </div>
          </div>
        </div>

        <div className="results-responses-row">
          <div className="results-response-card">
            <div className="results-response-header">
              <span>{results.modelA.name}</span>
              <span className="results-badge">{results.modelA.status}</span>
            </div>
            <div className="results-response-body">{results.modelA.text}</div>
          </div>

          <div className="results-response-card">
            <div className="results-response-header">
              <span>{results.modelB.name}</span>
              <span className="results-badge">{results.modelB.status}</span>
            </div>
            <div className="results-response-body">{results.modelB.text}</div>
          </div>
        </div>

        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Tokens (In / Out)</th>
                <th>Latency</th>
                <th>Est. Cost</th>
                <th>Quality</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{results.modelA.name}</strong></td>
                <td>{results.modelA.tokens}</td>
                <td>{results.modelA.latency}</td>
                <td>{results.modelA.cost}</td>
                <td>{results.modelA.quality}</td>
                <td>{results.modelA.status}</td>
              </tr>
              <tr>
                <td><strong>{results.modelB.name}</strong></td>
                <td className="results-muted-cell">{results.modelB.tokens}</td>
                <td>{results.modelB.latency}</td>
                <td>{results.modelB.cost}</td>
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
            <div className="results-skeleton-lines">
              <div className="results-s-line" />
              <div className="results-s-line" />
              <div className="results-s-line short" />
            </div>
            <div className="results-panel-footer">
              <span>• Details</span>
              <span className="results-link-text">View rubric</span>
            </div>
          </div>

          <div className="results-panel">
            <h2 className="results-panel-title">Cost vs. Quality</h2>
            <div className="results-panel-scores">
              <span>Overall</span>
              <span>A: {results.modelA.quality}</span>
              <span>B: {results.modelB.quality}</span>
            </div>
            <div className="results-skeleton-lines">
              <div className="results-s-line" />
              <div className="results-s-line" />
              <div className="results-s-line short" />
            </div>
            <div className="results-panel-footer">
              <span>• Details</span>
            </div>
          </div>

          <div className="results-panel">
            <h2 className="results-panel-title">Latency vs. Quality</h2>
            <div className="results-chart-container">
              <span className="results-axis-label y-axis">Quality ↑</span>
              <span className="results-axis-label x-axis">Latency →</span>
              <div className="results-data-point results-point-a">A</div>
              <div className="results-data-point results-point-b">B</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
