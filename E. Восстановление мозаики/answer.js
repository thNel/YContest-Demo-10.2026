import { createInterface } from 'readline';

const rl = createInterface({
    input: process.stdin,
    terminal: false,
});

const lines = [];
const waiters = [];

rl.on('line', (line) => {
    if (waiters.length > 0) {
        waiters.shift()(line);
    } else {
        lines.push(line);
    }
});

function nextLine() {
    if (lines.length > 0) {
        return Promise.resolve(lines.shift());
    }

    return new Promise((resolve) => {
        waiters.push(resolve);
    });
}

function send(message) {
    return new Promise((resolve) => {
        process.stdout.write(message + '\n', resolve);
    });
}

async function main() {
    const N = Number((await nextLine()).trim());

    if (N === 1) {
        await send('RESULT 1');
        rl.close();
        return;
    }

    const bits = Math.ceil(Math.log2(N));
    const code = new Array(N + 1).fill(0);

    for (let bit = 0; bit < bits; bit++) {
        const pieces = [];

        for (let piece = 1; piece <= N; piece++) {
            if (((piece - 1) & (1 << bit)) !== 0) {
                pieces.push(piece);
            }
        }

        await send(`CHECK ${pieces.join(' ')}`);

        const positions = (await nextLine())
            .trim()
            .split(/\s+/)
            .map(Number);

        for (const position of positions) {
            code[position] |= 1 << bit;
        }
    }

    const answer = [];

    for (let position = 1; position <= N; position++) {
        answer.push(code[position] + 1);
    }

    await send(`RESULT ${answer.join(' ')}`);

    rl.close();
}

main();