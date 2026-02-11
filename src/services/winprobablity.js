const winProbability = (req, res) => {
  const { fen } = req.body || {};

  if (!fen) {
    return res.status(400).json({ error: "Missing 'fen' in body" });
  }

  const base = 0.5;
  const noise = randomGaussian(0, 0.18);
  let prob = base + noise;

  prob = Math.max(0.05, Math.min(0.95, prob));
  prob = Number(prob.toFixed(2));

  const parts = fen.split(" ");
  const toMove =
    parts.length > 1 && parts[1] === "w" ? "white" : "black";

  const winChance = Math.round(prob * 100);

  return res.json({
    fen,
    sideToMove: toMove,
    winProbability: prob,
    message: `${capitalize(toMove)} has a ${winChance}% chance of winning this position.`,
    mock: true,
  });
};

function randomGaussian(mean = 0, stdDev = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  const num = Math.sqrt(-2.0 * Math.log(u)) *
              Math.cos(2.0 * Math.PI * v);

  return num * stdDev + mean;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  winProbability,
};
