'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addScoreAction, updateScoreAction, deleteScoreAction } from './actions';
import type { Score } from '@/types';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState('');
  const [editDate, setEditDate] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const supabase = createClient();

  const fetchScores = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_date', { ascending: false });

    setScores((data || []) as Score[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  async function handleAddScore(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const scoreNum = parseInt(newScore, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45.');
      return;
    }

    if (!newDate) {
      setError('Please select a date.');
      return;
    }

    // Check for duplicate date
    const duplicate = scores.find((s) => s.played_date === newDate);
    if (duplicate) {
      setError('You already have a score for this date.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('score', newScore);
      formData.append('date', newDate);
      
      await addScoreAction(formData);
      
      setSuccess(
        scores.length >= 5
          ? 'Score added. Your oldest score was replaced.'
          : 'Score added successfully.'
      );
      setNewScore('');
      setNewDate('');
      await fetchScores();
    } catch (err: any) {
      setError(err.message || 'Failed to add score.');
    }

    setSubmitting(false);
  }

  async function handleEditSave(id: string) {
    setError('');
    const scoreNum = parseInt(editScore, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45.');
      return;
    }
    if (!editDate) {
      setError('Please select a date.');
      return;
    }

    // Check duplicate date excluding current
    const duplicate = scores.find(
      (s) => s.played_date === editDate && s.id !== id
    );
    if (duplicate) {
      setError('You already have a score for this date.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('score', editScore);
      formData.append('date', editDate);

      await updateScoreAction(formData);
      
      setEditingId(null);
      await fetchScores();
    } catch (err: any) {
      setError(err.message || 'Failed to update score.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteScoreAction(id);
      setDeleteConfirm(null);
      await fetchScores();
    } catch (err: any) {
      setError(err.message || 'Failed to delete score.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Scores</h1>
        <p className="mt-1 text-sm text-gray-400">
          Enter your golf scores. You can have up to 5 active scores at a time.
        </p>
      </div>

      {/* Score capacity indicator */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full ${
                i <= scores.length ? 'bg-accent shadow-[0_0_8px_currentColor]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-gray-400">
          {scores.length}/5 scores entered
        </span>
      </div>

      {/* Warning banner */}
      {scores.length >= 5 && (
        <div className="mb-6 rounded-lg border border-coral/20 bg-coral/10 px-4 py-3">
          <p className="text-xs font-bold text-coral">
            You have 5 scores. Adding a new score will replace your oldest entry
            ({scores.length > 0 ? formatDate(scores[scores.length - 1].played_date) : ''}).
          </p>
        </div>
      )}

      {/* Error / Success messages */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/30 px-4 py-3">
          <p className="text-xs font-bold text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-accent/20 bg-accent/10 px-4 py-3">
          <p className="text-xs font-bold text-accent">{success}</p>
        </div>
      )}

      {/* Add score form */}
      <form
        onSubmit={handleAddScore}
        className="mb-8 card p-6"
      >
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-400 uppercase">Add New Score</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="score"
              className="mb-1.5 block text-xs font-medium text-gray-400"
            >
              Score (1–45)
            </label>
            <input
              id="score"
              type="number"
              min={1}
              max={45}
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              placeholder="Enter score"
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="date"
              className="mb-1.5 block text-xs font-medium text-gray-400"
            >
              Date Played
            </label>
            <input
              id="date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="input-field [color-scheme:dark]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Adding…' : 'Add Score'}
          </button>
        </div>
      </form>

      {/* Score cards */}
      <div className="space-y-4">
        {scores.length === 0 ? (
          <div className="card border-dashed border-white/20 py-12 text-center bg-transparent">
            <p className="text-sm font-medium text-gray-400">
              No scores yet. Add your first score above.
            </p>
          </div>
        ) : (
          scores.map((score, i) => (
            <div
              key={score.id}
              className="flex items-center justify-between card !p-4"
            >
              {editingId === score.id ? (
                /* Inline editing */
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                    className="input-field !w-24"
                  />
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="input-field !w-auto [color-scheme:dark]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(score.id)}
                      className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xl font-black text-white shadow-inner">
                      {score.score}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {formatDate(score.played_date)}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent mt-0.5">
                        Position #{i + 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {deleteConfirm === score.id ? (
                      <>
                        <span className="mr-2 text-xs font-medium text-coral">Delete this score?</span>
                        <button
                          onClick={() => handleDelete(score.id)}
                          className="rounded-lg bg-coral px-4 py-2 text-xs font-bold text-white hover:bg-red-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white"
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(score.id);
                            setEditScore(String(score.score));
                            setEditDate(score.played_date);
                            setError('');
                          }}
                          className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(score.id)}
                          className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-coral/50 hover:bg-coral/10 hover:text-coral"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
