const { Chess } = require('chess.js');
const { getPieceValue } = require('../config/pieceWeights');

/**
 * Evaluate position from White's perspective (positive = White advantage).
 * Uses material only with standard weights: P=1, N/B=3, R=5, Q=9 (in centipawns: 100,300,300,500,900).
 */
function evaluatePosition(game) {
  if (game.isGameOver()) {
    if (game.isCheckmate()) return game.turn() === 'w' ? -100000 : 100000;
    if (game.isDraw()) return 0;
  }

  let score = 0;
  const board = game.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) score += getPieceValue(piece);
    }
  }

  return score;
}

/**
 * Evaluate from a FEN string.
 */
function evaluateFen(fen) {
  const game = new Chess(fen);
  return evaluatePosition(game);
}

module.exports = { evaluatePosition, evaluateFen };
