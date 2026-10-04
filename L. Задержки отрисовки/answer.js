function solution(container) {
    const rects = container.querySelectorAll(':scope > rect');
    const values = [];
    let min = Infinity;
    let max = 0;

    for (const rect of rects) {
        const value = Number(rect.getAttribute('data-value'));
        values.push(value);

        if (value < min) min = value;
        if (value > max) max = value;
    }

    const range = max - min;
    if (range === 0) return 0;

    const bucketSize = Math.ceil(range / (values.length - 1));
    const bucketCount = Math.floor(range / bucketSize) + 1;
    const bucketMin = new Array(bucketCount).fill(Infinity);
    const bucketMax = new Array(bucketCount).fill(0);

    for (const value of values) {
        const index = Math.floor((value - min) / bucketSize);

        if (value < bucketMin[index]) bucketMin[index] = value;
        if (value > bucketMax[index]) bucketMax[index] = value;
    }

    let maxGap = 0;
    let previousMax = min;

    for (let i = 0; i < bucketCount; i++) {
        if (bucketMin[i] === Infinity) continue;

        const gap = bucketMin[i] - previousMax;
        if (gap > maxGap) maxGap = gap;
        previousMax = bucketMax[i];
    }

    return maxGap;
}
