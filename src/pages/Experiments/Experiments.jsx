import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import PageState from "../../components/PageState/PageState";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { deleteExperiment, getExperiments, HISTORY_PAGE_SIZE } from "../../services/experimentService";
import { normalizeExperimentSummary } from "../../services/normalize";
import { describeActionError, describeLoadError, EMPTY, formatDate } from "../../services/format";
import "../../styles/history.css";
import "./Experiments.css";

const MODEL_SLOTS = [0, 1];

function readPage(searchParams) {
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default function Experiments({ user, onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const isSignedIn = Boolean(localStorage.getItem("accessToken"));

  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${page}:${reloadKey}`;
  const [response, setResponse] = useState({ key: null, experiments: [], count: 0, error: null });

  useEffect(() => {
    if (!isSignedIn) return undefined;

    const controller = new AbortController();

    getExperiments({ page, signal: controller.signal })
      .then((data) => {
        if (!Array.isArray(data?.results)) throw new Error("The history API returned an unexpected response.");
        setResponse({
          key: requestKey,
          experiments: data.results.map(normalizeExperimentSummary),
          count: data.count ?? data.results.length,
          error: null,
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setResponse({ key: requestKey, experiments: [], count: 0, error });
      });

    return () => controller.abort();
  }, [page, requestKey, isSignedIn]);

  let status = "ready";
  if (response.key !== requestKey) status = "loading";
  else if (response.error) status = "error";
  const state = { ...response, status };

  const goToPage = (nextPage) => {
    setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {});
  };

  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  const askToDelete = (experiment) => {
    setDeleteError("");
    setNotice("");
    setPendingDelete(experiment);
  };

  const cancelDelete = () => {
    if (isDeleting) return;
    if (deleteError) setReloadKey((key) => key + 1);
    setPendingDelete(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteExperiment(pendingDelete.id);
      setNotice(`Deleted “${pendingDelete.title}”.`);
      setPendingDelete(null);
      if (state.experiments.length === 1 && page > 1) goToPage(page - 1);
      else setReloadKey((key) => key + 1);
    } catch (error) {
      setDeleteError(describeActionError(error, "delete"));
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(state.count / HISTORY_PAGE_SIZE));

  function renderContent() {
    if (!isSignedIn) {
      return (
        <PageState title="Sign in to see your history" message="Your saved experiments are linked to your account.">
          <Link to="/login" className="history-btn-primary">Sign in</Link>
        </PageState>
      );
    }

    if (state.status === "loading") {
      return <PageState title="Loading experiments…" />;
    }

    if (state.status === "error") {
      const { error } = state;
      if (error?.status === 401) {
        return (
          <PageState tone="error" title="Session expired" message={describeLoadError(error)}>
            <Link to="/login" className="history-btn-primary">Sign in again</Link>
          </PageState>
        );
      }
      if (error?.status === 404 && page > 1) {
        return (
          <PageState tone="error" title="Page not found" message={`There is no page ${page} in your history.`}>
            <button type="button" className="history-btn" onClick={() => goToPage(1)}>Go to the first page</button>
          </PageState>
        );
      }
      return (
        <PageState tone="error" title="Could not load your experiments" message={describeLoadError(error)}>
          <button type="button" className="history-btn" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
        </PageState>
      );
    }

    if (state.experiments.length === 0) {
      return (
        <PageState
          title="No experiments yet"
          message="Comparisons you run while signed in are saved here."
        >
          <Link to="/compare" className="history-btn-primary">New comparison</Link>
        </PageState>
      );
    }

    return (
      <>
        {/* Experiments table */}
        <div className="data-table-surface">
          <table className="data-table experiments-table">
            <colgroup>
              <col className="experiments-col-title" />
              {MODEL_SLOTS.map((slot) => <col key={slot} className="experiments-col-model" />)}
              <col className="experiments-col-date" />
              <col className="experiments-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Experiment</th>
                {MODEL_SLOTS.map((slot) => (
                  <th scope="col" key={slot}>Model {slot + 1}</th>
                ))}
                <th scope="col">Date</th>
                <th scope="col" className="experiments-actions-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.experiments.map((experiment) => (
                <tr key={experiment.id}>
                  <td className="experiments-title-cell">
                    <Link
                      to={`/experiments/${experiment.id}`}
                      className="experiments-title"
                      title={experiment.prompt}
                    >
                      {experiment.title}
                    </Link>
                    {experiment.runCount != null && (
                      <span className="experiments-run-count">
                        {experiment.runCount} {experiment.runCount === 1 ? "run" : "runs"}
                      </span>
                    )}
                  </td>
                  {MODEL_SLOTS.map((slot) => {
                    const model = experiment.models[slot];
                    const label = `Model ${slot + 1}`;
                    if (!model) return <td key={slot} data-label={label} className="history-muted">{EMPTY}</td>;
                    const isWinner = experiment.latestRun?.winnerModelId === model.id;
                    return (
                      <td key={slot} data-label={label}>
                        <span className="experiments-model">
                          {model.name}
                          {isWinner && <span className="history-winner-tag" title="Winner of the latest run">Winner</span>}
                        </span>
                      </td>
                    );
                  })}
                  <td className="experiments-date" data-label="Date">
                    <time dateTime={experiment.createdAt || undefined}>{formatDate(experiment.createdAt)}</time>
                  </td>
                  <td className="experiments-actions-cell">
                    <div className="experiments-actions">
                      <Link
                        to={`/experiments/${experiment.id}`}
                        className="history-btn history-btn-small"
                        aria-label={`View experiment: ${experiment.title}`}
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        className="history-btn history-btn-small history-btn-danger"
                        onClick={() => askToDelete(experiment)}
                        aria-label={`Delete experiment: ${experiment.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="experiments-pagination" aria-label="History pages">
            <button type="button" className="history-btn history-btn-small" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
              Previous
            </button>
            <span className="history-muted">Page {page} of {totalPages}</span>
            <button type="button" className="history-btn history-btn-small" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
              Next
            </button>
          </nav>
        )}
      </>
    );
  }

  return (
    <div className="history-page">
      <AppHeader user={user} onLogout={onLogout} />
      <main className="history-main">
        <div className="history-heading">
          <div>
            <h1 className="history-title">History</h1>
            <p className="history-subtitle">
              {state.status === "ready" && state.count > 0
                ? `${state.count} saved ${state.count === 1 ? "experiment" : "experiments"}, newest first.`
                : "Your saved experiments, newest first."}
            </p>
          </div>
          <Link to="/compare" className="history-btn-primary">New comparison</Link>
        </div>

        {notice && <p className="history-notice history-notice-success" role="status">{notice}</p>}

        {renderContent()}
      </main>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this experiment?"
        message={
          pendingDelete && (
            <>
              <strong>“{pendingDelete.title}”</strong> and all of its runs, answers and scores will be
              deleted permanently. This cannot be undone.
            </>
          )
        }
        confirmLabel="Delete"
        busyLabel="Deleting…"
        busy={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
