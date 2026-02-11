const { Chess } = require('chess.js');
const { evaluatePosition } = require('./evaluation');

/**
 * Minimax with configurable depth. Returns score from White's perspective.
 * @param {Chess} game - chess.js game instance
 * @param {number} depth - remaining depth (0 = leaf)
 * @param {number} alpha - alpha for alpha-beta
 * @param {number} beta - beta for alpha-beta
 * @param {boolean} isMaximizing - true if current player is White (maximizer)
 * @returns {number} evaluation in centipawns
 */
function minimax(game, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || game.isGameOver()) {
    return evaluatePosition(game);
  }

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return evaluatePosition(game);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Get the best move using minimax at given depth.
 * @param {string} fen - FEN string
 * @param {number} depth - search depth (default 3)
 * @returns {{ move: object, score: number, san: string } | null}
 */
function getBestMove(fen, depth = 3) {
  const game = new Chess(fen);
  if (game.isGameOver()) return null;

  const isWhite = game.turn() === 'w';
  const moves = game.moves({ verbose: true });
  let bestMove = null;
  let bestScore = isWhite ? -Infinity : Infinity;

  for (const move of moves) {
    game.move(move);
    const score = minimax(game, depth - 1, -Infinity, Infinity, !isWhite);
    game.undo();

    const isBetter = isWhite ? score > bestScore : score < bestScore;
    if (isBetter) {
      bestScore = score;
      bestMove = { ...move, score, san: move.san };
    }
  }

  if (!bestMove) return null;
  return { move: bestMove, score: bestScore, san: bestMove.san };
}

/**
 * Get top N moves by minimax score (for payoff matrix rows/columns).
 * @param {string} fen - FEN string
 * @param {number} depth - minimax depth
 * @param {number} topN - number of moves to return (default 3)
 * @returns {Array<{ move: object, score: number, san: string }>}
 */
function getTopMoves(fen, depth = 3, topN = 3) {
  const game = new Chess(fen);
  if (game.isGameOver()) return [];

  const isWhite = game.turn() === 'w';
  const moves = game.moves({ verbose: true });
  const scored = [];

  for (const move of moves) {
    game.move(move);
    const score = minimax(game, depth - 1, -Infinity, Infinity, !isWhite);
    game.undo();
    scored.push({ ...move, score, san: move.san });
  }

  scored.sort((a, b) => (isWhite ? b.score - a.score : a.score - b.score));
  return scored.slice(0, topN);
}

module.exports = { minimax, getBestMove, getTopMoves };
