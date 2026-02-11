/**
 * Identifies strictly dominated rows in the payoff matrix (turn-aware).
 * Rows = current player's moves; matrix[i][j] = evaluation from White's perspective.
 * White (current player) maximizes; Black (current player) minimizes (prefers lower/negative values).
 *
 * Strict dominance: Row i is strictly dominated by row k if:
 * - (White to move): for every column j, matrix[i][j] < matrix[k][j]
 * - (Black to move): for every column j, matrix[i][j] > matrix[k][j]
 *
 * @param {number[][]} matrix - 3x3 payoff matrix (rows = current player, cols = opponent responses)
 * @param {boolean} isAiWhite - true if current player is White (maximizer)
 * @returns {number[]} indices of strictly dominated rows (0-based)
 */
function getStrictlyDominatedRows(matrix, isAiWhite) {
  if (!matrix.length) return [];

  const dominated = [];
  const n = matrix.length;

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      let strictlyWorse = true;
      for (let j = 0; j < (matrix[i]?.length || 0); j++) {
        const payI = matrix[i][j];
        const payK = matrix[k][j];
        if (isAiWhite) {
          // AI maximizes: i dominated by k iff payI < payK for all j
          if (payI >= payK) {
            strictlyWorse = false;
            break;
          }
        } else {
          // AI minimizes: i dominated by k iff payI > payK for all j
          if (payI <= payK) {
            strictlyWorse = false;
            break;
          }
        }
      }
      if (strictlyWorse) {
        dominated.push(i);
        break;
      }
    }
  }

  return dominated;
}

/**
 * Get dominated move SANs for UI highlighting.
 * @param {number[]} dominatedIndices - indices of dominated rows
 * @param {string[]} rowLabels - row labels (move SANs)
 */
function getDominatedMoveLabels(dominatedIndices, rowLabels) {
  return dominatedIndices.map((i) => rowLabels[i]).filter(Boolean);
}

module.exports = { getStrictlyDominatedRows, getDominatedMoveLabels };
