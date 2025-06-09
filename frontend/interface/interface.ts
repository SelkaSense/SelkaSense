
export function evaluateTokenRisk(tokenData: any): string {
  const risk = riskRadar(tokenData);
  const volatility = volatilityPredict(tokenData);
  return `${risk} | ${volatility}`;
}

function bindUIEvents() {
  const scanBtn = document.getElementById("scan-button");
  scanBtn?.addEventListener("click", () => {
    const data = gatherTokenInput();
    const result = evaluateTokenRisk(data);
    alert(result);
  });
}
