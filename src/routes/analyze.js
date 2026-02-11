const { getBestMove } = require('../services/minimax');
const { buildPayoffMatrix } = require('../services/payoffMatrix');
const { getStrictlyDominatedRows, getDominatedMoveLabels } = require('../services/dominance');
const { Chess } = require('chess.js');

function analyzeHandler(req, res) {
  const fen = req.body?.fen;
  if (!fen || typeof fen !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "fen" in request body.' });
  }

  let game;
  try {
    game = new Chess(fen);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid FEN string.' });
  }
  const turn = game.turn();
  if (game.isCheckmate()) {
    const winner = turn === 'w' ? 'b' : 'w';
    const score = winner === 'w' ? 100000 : -100000;
    return res.status(200).json({
      fen,
      turn,
      gameOver: true,
      checkmate: true,
      winner,
      score,
      bestMove: null,
      payoffMatrix: { rowLabels: [], colLabels: [], matrix: [], rowMoveDetails: [], colMoveDetails: [] },
      dominatedRows: [],
      dominatedMoves: [],
      scoreInterpretation: winner === 'w' ? 'White wins. Score +100000.' : 'Black wins. Score -100000.',
    });
  }
  if (game.isDraw() || game.isStalemate()) {
    return res.status(200).json({
      fen,
      turn,
      gameOver: true,
      draw: true,
      winner: null,
      score: 0,
      bestMove: null,
      payoffMatrix: { rowLabels: [], colLabels: [], matrix: [], rowMoveDetails: [], colMoveDetails: [] },
      dominatedRows: [],
      dominatedMoves: [],
      scoreInterpretation: 'Draw.',
    });
  }

  const bestMoveResult = getBestMove(fen, 3);
  const payoff = buildPayoffMatrix(fen);
  const isCurrentPlayerWhite = turn === 'w';
  const dominatedIndices = getStrictlyDominatedRows(payoff.matrix, isCurrentPlayerWhite);
  const dominatedMoves = getDominatedMoveLabels(dominatedIndices, payoff.rowLabels);

  res.json({
    fen,
    turn,
    currentPlayerPerspective: turn === 'w' ? 'white' : 'black',
    bestMove: bestMoveResult
      ? {
          san: bestMoveResult.san,
          from: bestMoveResult.move.from,
          to: bestMoveResult.move.to,
          score: bestMoveResult.score,
        }
      : null,
    payoffMatrix: {
      rowLabels: payoff.rowLabels,
      colLabels: payoff.colLabels,
      matrix: payoff.matrix,
      rowMoveDetails: payoff.rowMoveDetails,
      colMoveDetails: payoff.colMoveDetails,
    },
    dominatedRows: dominatedIndices,
    dominatedMoves,
    scoreInterpretation: turn === 'w'
      ? 'Positive = White advantage (current player maximizes).'
      : 'Positive = White advantage (current player Black minimizes; prefers lower values).',
  });
}

module.exports = { analyzeHandler };
