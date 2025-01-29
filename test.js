const sqrt = Math.sqrt;

function calculateLiquidity(x, y, P_upper, P_lower) {
    return (sqrt(P_upper) * x + y) / (sqrt(P_upper) - sqrt(P_lower));
}

function calculateBalances(L, P, P_upper, P_lower) {
    let x_prime = 0;
    let y_prime = 0;

    if (P >= P_upper) {
        y_prime = L * (sqrt(P_upper) - sqrt(P_lower));
    } else if (P <= P_lower) {
        x_prime = L * (1 / sqrt(P_lower) - 1 / sqrt(P_upper));
    } else {
        x_prime = L * (1 / sqrt(P) - 1 / sqrt(P_upper));
        y_prime = L * (sqrt(P) - sqrt(P_lower));
    }

    return { x_prime, y_prime };
}

function calculateImpermanentLoss(P0, P1, P_lower, P_upper, x0, y0) {
    const L = calculateLiquidity(x0, y0, P_upper, P_lower);
    const { x_prime, y_prime } = calculateBalances(L, P1, P_upper, P_lower);

    const hodlValue = x0 * P1 + y0;
    const newLPValue = x_prime * P1 + y_prime;

    const IL = 1 - (newLPValue / hodlValue);

    return {
        IL: (IL * 100).toFixed(2) + '%',
        hodlValue: hodlValue.toFixed(2),
        newLPValue: newLPValue.toFixed(2)
    };
}

// Example Usage:
const P0 = 1000;      // Initial Price
const P1 = 1200;      // Final Price
const P_lower = 800;  // Lower Bound of Liquidity Range
const P_upper = 1500; // Upper Bound of Liquidity Range
const x0 = 1;         // Initial amount of Token 0
const y0 = 1000;      // Initial amount of Token 1

const result = calculateImpermanentLoss(P0, P1, P_lower, P_upper, x0, y0);
console.log('Impermanent Loss:', result.IL);
console.log('HODL Value:', result.hodlValue);
console.log('New LP Value:', result.newLPValue);
