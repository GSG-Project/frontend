import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";

export default function Compare() {
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState("prompt");
  const [promptText, setPromptText] = useState("");
  const [modelA, setModelA] = useState("");
  const [modelB, setModelB] = useState("");
  const [executionState, setExecutionState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const models = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "claude-3", label: "Claude 3" },
    { value: "gpt-3.5", label: "GPT-3.5" },
    { value: "llama-3", label: "Llama 3" },
  ];

  const handleRunComparison = () => {
    if (executionState === "running") return;

    if (inputMode === "dataset") {
      setErrorMessage("Dataset comparison is not available yet. Please use Single Prompt.");
      return;
    }

    if (!promptText.trim() || !modelA || !modelB) {
      setErrorMessage("Please enter a prompt and select both models.");
      return;
    }

    if (modelA === modelB) {
      setErrorMessage("Please select two different models.");
      return;
    }

    setErrorMessage("");
    setExecutionState("running");

    // Temporary frontend simulation. This will be replaced by the backend request.
    window.setTimeout(() => {
      navigate("/results", {
        state: {
          promptText: promptText.trim(),
          modelA,
          modelB,
        },
      });
    }, 1500);
  };

  return (
    <div className="page-wrapper">
      <style>{`
        .page-wrapper {
          --primary: #6D4AFF;
          --secondary: #A78BFA;
          --bg-light: #F3EFFF;
          --text-main: #171426;
          --white: #FFFFFF;
          --border: #E5E7EB;
          --danger: #EF4444;
          --success: #10B981;

          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: var(--bg-light);
          color: var(--text-main);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .page-wrapper,
        .page-wrapper * {
          box-sizing: border-box;
        }

        .main-content {
          flex: 1;
          padding: 12px 20px;
          max-width: 1366px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-rows: 1.2fr 1fr;
          gap: 12px;
          min-height: 0;
        }

        .top-section {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 12px;
          min-height: 0;
        }

        .form-section {
          background-color: var(--white);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .form-title {
          font-size: 1.15rem;
          font-weight: 600;
        }

        .btn-primary {
          background-color: var(--primary);
          color: var(--white);
          border: none;
          padding: 7px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.85rem;
        }

        .btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .tab {
          padding: 5px 10px;
          border: 1px solid var(--border);
          background: var(--white);
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .tab.active {
          background-color: var(--secondary);
          color: var(--white);
          border-color: var(--secondary);
        }

        .input-group {
          margin-bottom: 8px;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }

        .input-group label {
          margin-bottom: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .textarea-field {
          width: 100%;
          flex: 1;
          min-height: 50px;
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          resize: none;
          font-size: 0.85rem;
          font-family: inherit;
        }

        .textarea-field:focus,
        .select-field:focus {
          outline: none;
          border-color: var(--primary);
        }

        .selectors-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 8px;
          flex-shrink: 0;
        }

        .select-field {
          width: 100%;
          padding: 7px 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background-color: var(--white);
          font-size: 0.85rem;
        }

        .evaluation-criteria {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background-color: var(--bg-light);
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .link-btn {
          color: var(--primary);
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          font-size: 0.8rem;
        }

        .dataset-section {
          background-color: #fafafa;
          border: 2px dashed var(--border);
          border-radius: 8px;
          padding: 12px;
          position: relative;
          opacity: 0.7;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .future-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 0.7rem;
          color: #888;
        }

        .dataset-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .dataset-preview {
          background-color: var(--white);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px;
          margin: 8px 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-height: 0;
        }

        .preview-line {
          height: 6px;
          background-color: #e5e7eb;
          border-radius: 4px;
          width: 100%;
        }

        .preview-line.short {
          width: 70%;
        }

        .dataset-note {
          margin-top: 8px;
          color: #777;
          font-size: 0.78rem;
          line-height: 1.4;
        }

        .error-message {
          margin-top: 6px;
          color: var(--danger);
          font-size: 0.78rem;
        }

        .status-section {
          background-color: var(--white);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-shrink: 0;
        }

        .status-legend {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 0.75rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .dot.pending { background-color: #9CA3AF; }
        .dot.running { background-color: #F59E0B; }
        .dot.completed { background-color: var(--success); }
        .dot.failed { background-color: var(--danger); }

        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          flex: 1;
          min-height: 0;
        }

        .result-card {
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px;
          background-color: var(--white);
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .result-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 6px;
          flex-shrink: 0;
        }

        .badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .badge.completed { background-color: #d1fae5; color: #065f46; }
        .badge.failed { background-color: #fee2e2; color: #991b1b; }
        .badge.running { background-color: #fef3c7; color: #92400e; }

        .skeleton-line {
          height: 8px;
          background-color: #f3f4f6;
          border-radius: 4px;
          margin-bottom: 6px;
        }

        .skeleton-line.short { width: 60%; }

        .retry-btn,
        .dataset-btn-outline {
          background-color: var(--white);
          border: 1px solid var(--border);
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          width: fit-content;
          font-size: 0.8rem;
        }

        .dataset-btn-outline:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        @media (max-width: 1024px) {
          .page-wrapper {
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }

          .main-content {
            grid-template-rows: auto auto;
            height: auto;
          }

          .top-section {
            grid-template-columns: 1fr;
          }

          .form-section {
            min-height: 380px;
          }

          .dataset-section {
            min-height: 220px;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }

          .result-card {
            min-height: 150px;
          }

          .status-section {
            min-height: 260px;
          }
        }

        @media (max-width: 600px) {
          .main-content {
            padding: 10px;
          }

          .form-section,
          .status-section {
            padding: 12px;
          }

          .form-header,
          .status-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .selectors-row {
            grid-template-columns: 1fr;
          }

          .input-group {
            min-height: auto;
          }

          .textarea-field {
            min-height: 120px;
          }

          .status-legend {
            gap: 8px;
          }
        }
      `}</style>

      <AppHeader />

      <main className="main-content">
        <div className="top-section">
          <section className="form-section">
            <div className="form-header">
              <h1 className="form-title">New Comparison</h1>
              <button
                className="btn-primary"
                onClick={handleRunComparison}
                disabled={executionState === "running"}
              >
                {executionState === "running" ? "Running..." : "Run Comparison"}
              </button>
            </div>

            <div className="tabs">
              <button
                type="button"
                className={`tab ${inputMode === "prompt" ? "active" : ""}`}
                onClick={() => {
                  setInputMode("prompt");
                  setErrorMessage("");
                }}
              >
                Single Prompt
              </button>

              <button
                type="button"
                className={`tab ${inputMode === "dataset" ? "active" : ""}`}
                onClick={() => {
                  setInputMode("dataset");
                  setErrorMessage("");
                }}
              >
                Dataset
              </button>
            </div>

            {inputMode === "prompt" ? (
              <div className="input-group">
                <label htmlFor="comparison-prompt">Prompt</label>
                <textarea
                  id="comparison-prompt"
                  className="textarea-field"
                  placeholder="Enter prompt..."
                  value={promptText}
                  onChange={(event) => {
                    setPromptText(event.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                />
              </div>
            ) : (
              <div className="input-group">
                <label>Dataset</label>
                <div className="dataset-preview">
                  <p className="dataset-note">
                    Dataset comparison is planned for a future version. For now, use Single Prompt.
                  </p>
                </div>
              </div>
            )}

            <div className="selectors-row">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="model-a">Model A</label>
                <select
                  id="model-a"
                  className="select-field"
                  value={modelA}
                  onChange={(event) => setModelA(event.target.value)}
                >
                  <option value="">Select model</option>
                  {models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="model-b">Model B</label>
                <select
                  id="model-b"
                  className="select-field"
                  value={modelB}
                  onChange={(event) => setModelB(event.target.value)}
                >
                  <option value="">Select model</option>
                  {models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="evaluation-criteria">
              <span>Evaluation Criteria: Predefined rubric</span>
              <button type="button" className="link-btn" disabled>
                View
              </button>
            </div>

            {errorMessage && (
              <p className="error-message" role="alert">
                {errorMessage}
              </p>
            )}
          </section>

          <aside className="dataset-section">
            <span className="future-badge">Future</span>
            <h2 className="dataset-title">Dataset</h2>
            <button
              type="button"
              className="dataset-btn-outline"
              disabled
              style={{ alignSelf: "flex-start", marginBottom: "8px" }}
            >
              Choose CSV / JSONL file
            </button>
            <div className="dataset-preview" aria-label="Dataset preview placeholder">
              <div className="preview-line" />
              <div className="preview-line" />
              <div className="preview-line short" />
            </div>
            <button
              type="button"
              className="dataset-btn-outline"
              disabled
              style={{ marginBottom: "6px" }}
            >
              Validation status
            </button>
            <button
              type="button"
              className="dataset-btn-outline"
              disabled
              style={{ alignSelf: "flex-start" }}
            >
              Use Dataset
            </button>
          </aside>
        </div>

        <section className="status-section">
          <div className="status-header">
            <h2 className="form-title" style={{ fontSize: "1.05rem" }}>
              Execution Status
            </h2>
            <div className="status-legend">
              <div className="legend-item"><span className="dot pending" /> Pending</div>
              <div className="legend-item"><span className="dot running" /> Running</div>
              <div className="legend-item"><span className="dot completed" /> Completed</div>
              <div className="legend-item"><span className="dot failed" /> Failed</div>
            </div>
          </div>

          <div className="results-grid">
            <div className="result-card">
              <div className="result-card-header">
                <strong>Model A</strong>
                {executionState === "running" && <span className="badge running">Running</span>}
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {executionState === "idle" && (
                  <p style={{ color: "#888", fontSize: "0.85rem" }}>
                    Waiting to start...
                  </p>
                )}
                {executionState === "running" && (
                  <p style={{ fontSize: "0.85rem" }}>Generating response...</p>
                )}
              </div>
            </div>

            <div className="result-card">
              <div className="result-card-header">
                <strong>Model B</strong>
                {executionState === "running" && <span className="badge running">Running</span>}
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {executionState === "idle" && (
                  <p style={{ color: "#888", fontSize: "0.85rem" }}>
                    Waiting to start...
                  </p>
                )}
                {executionState === "running" && (
                  <p style={{ fontSize: "0.85rem" }}>Generating response...</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
