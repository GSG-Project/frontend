import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import PageState from "../../components/PageState/PageState";
import { getExperiment, rerunExperiment } from "../../services/experimentService";
import { describeActionError, describeLoadError } from "../../services/format";
import { comparisonFromRun } from "../../services/normalize";
import "./ComparisonResults.css";

const CRITERIA = [
  { key: "accuracy", label: "Accuracy" },
  { key: "relevance", label: "Relevance" },
  { key: "clarity", label: "Clarity" },
  { key: "completeness", label: "Completeness" },
];

const showScore = (value) => (value == null ? "N/A" : String(value));

export default function ComparisonResults({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { promptText: statePrompt, modelA: stateModelA, modelB: stateModelB, comparisonResponse: initialResponse } = location.state || {};
  const experimentParam = searchParams.get("experiment");
  const runParam = searchParams.get("run");
  const isSignedIn = Boolean(localStorage.getItem("accessToken"));

  const [rerunResponse, setRerunResponse] = useState(null);

  const savedKey = `${experimentParam}:${runParam}`;
  const needsSavedRun = !initialResponse && !rerunResponse && Boolean(experimentParam) && isSignedIn;
  const [saved, setSaved] = useState({ key: null, response: null, error: null });

  useEffect(() => {
    if (!needsSavedRun) return undefined;
    const controller = new AbortController();
    getExperiment(experimentParam, { signal: controller.signal })
      .then((data) => {
        const response = comparisonFromRun(data, runParam);
        if (!response) throw Object.assign(new Error("This comparison has no saved run."), { status: 404 });
        setSaved({ key: savedKey, response, error: null });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setSaved({ key: savedKey, response: null, error });
      });
    return () => controller.abort();
  }, [needsSavedRun, experimentParam, runParam, savedKey]);

  const savedResponse = saved.key === savedKey ? saved.response : null;
  const savedError = saved.key === savedKey ? saved.error : null;
  const isLoadingSaved = needsSavedRun && saved.key !== savedKey;

  const comparisonResponse = rerunResponse || initialResponse || savedResponse;
  const experimentId = comparisonResponse?.experiment_id;
  const promptText = statePrompt || comparisonResponse?.prompt || "";
  const modelA = stateModelA ?? comparisonResponse?.results?.[0]?.model_id;
  const modelB = stateModelB ?? comparisonResponse?.results?.[1]?.model_id;

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
      text: result.answer || result.error?.message || "No response generated.",
      evaluated: evaluationScores.some((e) => e.model_id === modelId),
      criteria: CRITERIA.map(({ key, label }) => ({ key, label, value: evalData[key] ?? null })),
      overall: evalData.overall_score ?? null,
      strengths: evalData.strengths || "",
      weaknesses: evalData.weaknesses || "",
    };
  };

  const results = {
    modelA: getModelData(modelA, 0),
    modelB: getModelData(modelB, 1),
  };

  const [isRerunning, setIsRerunning] = useState(false);
  const [rerunMessage, setRerunMessage] = useState(null);
  const [rerunError, setRerunError] = useState("");

  const canRerun = isSignedIn && experimentId != null;
  const rerunHint = !experimentId
    ? "Run a comparison first."
    : !isSignedIn
      ? "Sign in to run this comparison again."
      : undefined;

  const handleRerun = async () => {
    if (isRerunning || !canRerun) return;
    setIsRerunning(true);
    setRerunMessage(null);
    setRerunError("");
    try {
      const result = await rerunExperiment(experimentId);
      setRerunResponse(result);
      if (result?.run_id != null) {
        setSearchParams(
          { experiment: String(result.experiment_id ?? experimentId), run: String(result.run_id) },
          { replace: true, state: location.state },
        );
      }
      const failed = (result?.results || []).filter((item) => item.status !== "success").length;
      setRerunMessage({
        runId: result?.run_id,
        text: failed > 0
          ? `New run saved. ${failed} of ${result.results.length} models failed.`
          : "New run saved. The results below are from the new run.",
      });
    } catch (error) {
      setRerunError(describeActionError(error, "rerun"));
    } finally {
      setIsRerunning(false);
    }
  };

  if (!comparisonResponse) {
    let state;
    if (isLoadingSaved) {
      state = <PageState title="Loading comparison…" />;
    } else if (experimentParam && !isSignedIn) {
      state = (
        <PageState title="Sign in to see this comparison" message="Saved comparisons are linked to your account.">
          <Link to="/login" className="results-btn-dark results-state-link">Sign in</Link>
        </PageState>
      );
    } else if (savedError) {
      const title = savedError.status === 401
        ? "Session expired"
        : savedError.status === 404 ? "Comparison not found" : "Could not load this comparison";
      state = (
        <PageState tone="error" title={title} message={describeLoadError(savedError)}>
          <Link to="/experiments" className="results-btn-outline results-state-link">Go to History</Link>
        </PageState>
      );
    } else {
      state = (
        <PageState title="No comparison to show" message="Run a new comparison, or open a saved one from your history.">
          <Link to="/compare" className="results-btn-dark results-state-link">New comparison</Link>
          <Link to="/experiments" className="results-btn-outline results-state-link">Go to History</Link>
        </PageState>
      );
    }
    return (
      <div className="results-page">
        <AppHeader user={user} onLogout={onLogout} />
        <main className="results-main">{state}</main>
      </div>
    );
  }

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
            <button
              className="results-btn-outline"
              onClick={handleRerun}
              disabled={isRerunning || !canRerun}
              title={rerunHint}
              aria-busy={isRerunning}
            >
              {isRerunning ? "Rerunning..." : "Rerun"}
            </button>
            <button className="results-btn-dark" onClick={() => navigate("/compare")}>
              New Comparison
            </button>
          </div>
        </div>

        {!isSignedIn && (
          <p className="results-notice results-guest-note" role="note">
            This comparison isn't saved because you're not signed in.{" "}
            <Link to="/login">Log in</Link> or <Link to="/register">create an account</Link> to save comparisons and run them again.
          </p>
        )}

        {promptText && (
          <div className="results-prompt" title={promptText}>
            <strong>Prompt</strong>
            <span>{promptText}</span>
          </div>
        )}

        {isRerunning && (
          <div className="results-notice" role="status">
            Sending the prompt to both models and the judge again. This can take up to a minute or two.
          </div>
        )}
        {!isRerunning && rerunMessage && (
          <div className="results-notice results-notice-success" role="status">
            {rerunMessage.text}{" "}
            <Link className="results-notice-link" to={`/experiments/${experimentId}${rerunMessage.runId != null ? `?run=${rerunMessage.runId}` : ""}`}>
              See all runs of this experiment
            </Link>
          </div>
        )}
        {!isRerunning && rerunError && <div className="results-error-notice" role="alert">{rerunError}</div>}
        {evaluationError && <div className="results-error-notice"><strong>Evaluation Error:</strong> {evaluationError}</div>}

        {/* Summary */}
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

        {/* Model responses */}
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

        {/* Metrics table */}
        <div className="results-table-container data-table-surface">
          <table className="results-table data-table">
            <thead>
              <tr><th>Model</th><th>Tokens (In / Out)</th><th>Latency</th><th>Est. Cost</th><th>Quality</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{results.modelA.name}</strong></td>
                <td data-label="Tokens (In / Out)" className={results.modelA.tokens === "Unavailable" ? "results-muted-cell" : ""}>{results.modelA.tokens}</td>
                <td data-label="Latency">{results.modelA.latency}</td>
                <td data-label="Est. Cost" className={results.modelA.cost === "Unavailable" ? "results-muted-cell" : ""}>{results.modelA.cost}</td>
                <td data-label="Quality">{results.modelA.quality}</td>
                <td data-label="Status">{results.modelA.status}</td>
              </tr>
              <tr>
                <td><strong>{results.modelB.name}</strong></td>
                <td data-label="Tokens (In / Out)" className={results.modelB.tokens === "Unavailable" ? "results-muted-cell" : ""}>{results.modelB.tokens}</td>
                <td data-label="Latency">{results.modelB.latency}</td>
                <td data-label="Est. Cost" className={results.modelB.cost === "Unavailable" ? "results-muted-cell" : ""}>{results.modelB.cost}</td>
                <td data-label="Quality">{results.modelB.quality}</td>
                <td data-label="Status">{results.modelB.status}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quality evaluation */}
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

            {(results.modelA.evaluated || results.modelB.evaluated) && (
              <>
                <h3 className="results-subheading">Scores by criterion</h3>
                <div className="data-table-surface">
                  <table className="data-table results-criteria-table">
                    <thead>
                      <tr>
                        <th scope="col">Model</th>
                        {CRITERIA.map(({ key, label }) => <th scope="col" key={key}>{label}</th>)}
                        <th scope="col">Overall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[results.modelA, results.modelB].filter((model) => model.evaluated).map((model) => (
                        <tr key={model.name}>
                          <th scope="row">{model.name}</th>
                          {model.criteria.map(({ key, label, value }) => (
                            <td key={key} data-label={label}>{showScore(value)}</td>
                          ))}
                          <td data-label="Overall">{showScore(model.overall)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="results-footnote">Scores are from 1 to 10.</p>

                <h3 className="results-subheading">Strengths and weaknesses</h3>
                <div className="results-feedback">
                  {[results.modelA, results.modelB].filter((model) => model.evaluated).map((model) => (
                    <div className="results-feedback-item" key={model.name}>
                      <h4 className="results-feedback-model">{model.name}</h4>
                      <dl>
                        <dt>Strengths</dt>
                        <dd>{model.strengths || "N/A"}</dd>
                        <dt>Weaknesses</dt>
                        <dd>{model.weaknesses || "N/A"}</dd>
                      </dl>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
