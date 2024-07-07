let equationText = '';
let lineEquationText = '';
let parallelLineEquationText = '';

document.getElementById('calculateBtn').addEventListener('click', function() {
    const points = [];
    for (let i = 1; i <= 5; i++) {
        const pointInput = document.getElementById(`point${i}`).value.split(',').map(Number);
        if (pointInput.length !== 2 || isNaN(pointInput[0]) || isNaN(pointInput[1])) {
            alert('入力が正しくありません。例: 1,2');
            return;
        }
        const formattedPoint = pointInput.map(num => num.toFixed(3));
        points.push(formattedPoint);
    }

    const matrix = [];
    const results = [1, 1, 1, 1, 1];
    
    points.forEach(point => {
        const [x, y] = point.map(Number);
        matrix.push([x * x, x * y, y * y, x, y]);
    });

    function inverseMatrix(matrix) {
        const size = matrix.length;
        const augmented = matrix.map((row, i) => [...row, ...Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))]);

        for (let i = 0; i < size; i++) {
            let maxRow = i;
            for (let k = i + 1; k < size; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }

            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

            const divisor = augmented[i][i];
            if (divisor === 0) {
                alert('行列が逆行列を持たないため計算できません。');
                return null;
            }
            for (let j = 0; j < 2 * size; j++) {
                augmented[i][j] /= divisor;
            }

            for (let k = 0; k < size; k++) {
                if (k === i) continue;
                const factor = augmented[k][i];
                for (let j = 0; j < 2 * size; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }

        return augmented.map(row => row.slice(size));
    }

    function multiplyMatrixVector(matrix, vector) {
        return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
    }

    function solve(matrix, results) {
        const invMatrix = inverseMatrix(matrix);
        if (!invMatrix) return null;
        return multiplyMatrixVector(invMatrix, results);
    }

    const solution = solve(matrix, results);
    if (!solution) {
        document.getElementById('equation').textContent = '計算に失敗しました。';
        return;
    }

    const [A, B, C, D, E] = solution;
    
    equationText = `${A.toFixed(3)}x² + ${B.toFixed(3)}xy + ${C.toFixed(3)}y² + ${D.toFixed(3)}x + ${E.toFixed(3)}y = 1`;
    
    let conicType = '';
    const discriminant = B * B - 4 * A * C;
    if (discriminant > 0) {
        conicType = '双曲線です';
    } else if (discriminant === 0) {
        conicType = '放物線です';
    } else {
        conicType = '楕円です';
    }

    document.getElementById('equation').textContent = equationText;
    document.getElementById('conicType').textContent = conicType;

    const [x1, y1] = points[0].map(Number);
    const [x2, y2] = points[4].map(Number);
    const slope = (y2 - y1) / (x2 - x1);
    const intercept = y1 - slope * x1;

    const [x3, y3] = points[2].map(Number);
    const yOnLine = slope * x3 + intercept;
    const condition = y3 >= yOnLine ? '>=' : '<=';

    lineEquationText = `y ${condition} ${slope.toFixed(3)}x + ${intercept.toFixed(3)}`;

    if (conicType === '双曲線です') {
        const interceptParallel = y3 - slope * x3;
        const yOnLineParallel = slope * x3 + interceptParallel;
        const conditionParallel = y3 >= yOnLineParallel ? '>=' : '<=';

        if (conditionParallel == '<='){
            parallelLineEquationText = `${slope.toFixed(3)}x + ${interceptParallel.toFixed(3)} <= y <= ${slope.toFixed(3)}x + ${intercept.toFixed(3)}`;
        } else {
            parallelLineEquationText = `${slope.toFixed(3)}x + ${intercept.toFixed(3)} <= y <= ${slope.toFixed(3)}x + ${interceptParallel.toFixed(3)}`;
        }
        document.getElementById('parallelLineEquation').textContent = parallelLineEquationText;
    } else {
        document.getElementById('parallelLineEquation').textContent = '';
    }

    document.getElementById('lineEquation').textContent = lineEquationText;
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('copyBtn').addEventListener('click', function() {
    let fullText = equationText;
    if (document.getElementById('conicType').textContent === '双曲線です') {
        fullText += `\\left\\{${parallelLineEquationText}\\right\\}`;
    } else {
        fullText += `\\left\\{${lineEquationText}\\right\\}`;
    }
            
    navigator.clipboard.writeText(fullText).then(() => {
        alert('計算結果がコピーされました。');
    }, () => {
        alert('コピーに失敗しました。');
    });
}); 
