
const PIECE_VALUES = {
  p: 100,   // Pawn = 1 (scale 100 for centipawns)
  n: 300,   // Knight = 3
  b: 300,   // Bishop = 3
  r: 500,   // Rook = 5
  q: 900,   // Queen = 9
  k: 0      // King not used in simple material eval (no endgame table)
};

function getPieceValue(piece) {
  if (!piece) return 0;
  const value = PIECE_VALUES[piece.type] || 0;
  return piece.color === 'w' ? value : -value;
}

module.exports = { PIECE_VALUES, getPieceValue };
