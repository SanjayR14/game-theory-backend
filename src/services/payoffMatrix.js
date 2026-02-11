const { Chess } = require('chess.js');
const { getTopMoves } = require('./minimax');
const { evaluateFen } = require('./evaluation');

const DEPTH = 3;
const TOP_MOVES = 3;

/**
 * Build the 3x3 Payoff Matrix for the current position (turn-aware).
 * Rows = Current player's (side to move) top 3 moves.
 * Columns = Opponent's top 3 likely responses (per row).
 * Cell value = evaluation from White's perspective (positive = White advantage).
 * For Black's turn, getTopMoves already returns Black's best moves (lowest eval); dominance uses isCurrentPlayerWhite=false.
 *
 * @param {string} fen - Current board FEN
 * @returns {{
 *   rowLabels: string[],
 *   colLabels: string[],
 *   matrix: number[][],
 *   rowMoveDetails: object[],
 *   colMoveDetails: object[]
 * }}
 */
function buildPayoffMatrix(fen) {
  const game = new Chess(fen);
  if (game.isGameOver()) {
    return { rowLabels: [], colLabels: [], matrix: [], rowMoveDetails: [], colMoveDetails: [] };
  }

  const aiTopMoves = getTopMoves(fen, DEPTH, TOP_MOVES);
  const rowLabels = aiTopMoves.map((m) => m.san);
  const rowMoveDetails = aiTopMoves.map((m) => ({ san: m.san, from: m.from, to: m.to, score: m.score }));

  // Use first row's opponent responses as column labels (same structure for all rows)
  let colLabels = [];
  const matrix = [];
  const colMoveDetailsByRow = [];

  for (let i = 0; i < aiTopMoves.length; i++) {
    const aiMove = aiTopMoves[i];
    const gameCopy = new Chess(fen);
    gameCopy.move(aiMove);
    const fenAfterAi = gameCopy.fen();
    const opponentTopMoves = getTopMoves(fenAfterAi, DEPTH, TOP_MOVES);

    if (colLabels.length === 0) {
      colLabels = opponentTopMoves.map((m) => m.san);
    }

    const rowCells = [];
    const colDetails = [];
    for (const oppMove of opponentTopMoves) {
      const gameAfter = new Chess(fenAfterAi);
      gameAfter.move(oppMove);
      const evalScore = evaluateFen(gameAfter.fen());
      rowCells.push(evalScore);
      colDetails.push({ san: oppMove.san, evaluation: evalScore });
    }
    matrix.push(rowCells);
    colMoveDetailsByRow.push(colDetails);
  }

  // Column details: use first row's response details as the "canonical" column labels
  const colMoveDetails = colMoveDetailsByRow[0] || [];

  return {
    rowLabels,
    colLabels,
    matrix,
    rowMoveDetails,
    colMoveDetails,
  };
}

module.exports = { buildPayoffMatrix, DEPTH, TOP_MOVES };
