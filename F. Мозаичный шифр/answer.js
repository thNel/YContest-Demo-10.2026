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


// ============================================================
// Метаданные
// ============================================================

const META_LENGTH = 50;

// dp[remaining][balance] — количество способов дописать
// remaining скобок, начиная с текущего balance,
// и получить корректную ПСП.

const dp = Array.from(
    { length: META_LENGTH + 1 },
    () => new Array(META_LENGTH + 2).fill(0),
);

dp[0][0] = 1;

for (let remaining = 1; remaining <= META_LENGTH; remaining++) {
    for (let balance = 0; balance <= META_LENGTH; balance++) {
        let count = 0;

        // Добавляем '('
        if (balance + 1 <= META_LENGTH) {
            count += dp[remaining - 1][balance + 1];
        }

        // Добавляем ')'
        if (balance > 0) {
            count += dp[remaining - 1][balance - 1];
        }

        dp[remaining][balance] = count;
    }
}


// ============================================================
// Число -> ПСП длины META_LENGTH
// ============================================================

function encodeMeta(value) {
    let result = '';
    let balance = 0;

    for (let position = 0; position < META_LENGTH; position++) {
        const remaining = META_LENGTH - position - 1;

        const openCount = dp[remaining][balance + 1];

        if (value < openCount) {
            result += '(';
            balance++;
        } else {
            value -= openCount;

            result += ')';
            balance--;
        }
    }

    return result;
}


// ============================================================
// ПСП длины META_LENGTH -> число
// ============================================================

function decodeMeta(meta) {
    let value = 0;
    let balance = 0;

    for (let position = 0; position < META_LENGTH; position++) {
        const remaining = META_LENGTH - position - 1;

        if (meta[position] === '(') {
            balance++;
        } else {
            value += dp[remaining][balance + 1];
            balance--;
        }
    }

    return value;
}


// ============================================================
// Кодирование
// binary -> ПСП
// ============================================================

function encode(original) {
    let source = original;

    // Если исходная длина нечётная,
    // дописываем служебный 0.
    const wasOdd = source.length % 2;

    if (wasOdd) {
        source += '0';
    }

    const n = source.length;


    // ========================================================
    // 1. Балансировка Кнута
    //
    // Ищем k, чтобы после инверсии первых k бит
    // количество 0 и 1 стало одинаковым.
    // ========================================================

    let ones = 0;

    for (let i = 0; i < n; i++) {
        if (source[i] === '1') {
            ones++;
        }
    }

    const target = n / 2;

    let k = 0;

    if (ones !== target) {
        for (let i = 0; i < n; i++) {
            if (source[i] === '0') {
                ones++;
            } else {
                ones--;
            }

            if (ones === target) {
                k = i + 1;
                break;
            }
        }
    }


    // ========================================================
    // 2. Применяем инверсию и сразу переводим:
    //
    // 0 -> (
    // 1 -> )
    //
    // После балансировки количество '(' и ')' одинаковое.
    // ========================================================

    const brackets = new Array(n);

    for (let i = 0; i < n; i++) {
        let bit = source[i];

        if (i < k) {
            bit = bit === '0' ? '1' : '0';
        }

        brackets[i] = bit === '0' ? '(' : ')';
    }


    // ========================================================
    // 3. Находим минимальный префиксный баланс
    //
    // После точки минимума делаем циклический разрез.
    //
    // Так как суммарный баланс равен 0,
    // после такого сдвига получаем ПСП.
    // ========================================================

    let balance = 0;
    let minBalance = 0;

    let r = 0;

    for (let i = 0; i < n; i++) {
        if (brackets[i] === '(') {
            balance++;
        } else {
            balance--;
        }

        if (balance < minBalance) {
            minBalance = balance;
            r = i + 1;
        }
    }


    // ========================================================
    // 4. Циклический сдвиг
    //
    // ABCDEF, r = 2
    //
    // CDEFAB
    // ========================================================

    let data;

    if (r === 0) {
        data = brackets.join('');
    } else {
        data =
            brackets.slice(r).join('') +
            brackets.slice(0, r).join('');
    }


    // ========================================================
    // 5. Метаданные
    //
    // Нужно сохранить:
    //
    // wasOdd — добавляли ли 0
    // k      — длина инвертированного префикса
    // r      — величина циклического сдвига
    //
    // Упаковываем всё в одно число.
    // ========================================================

    const metaValue =
        (wasOdd * (n + 1) + k) * n + r;

    const meta = encodeMeta(metaValue);


    // data — ПСП
    // meta — ПСП
    //
    // ПСП + ПСП = ПСП
    return data + meta;
}


// ============================================================
// Декодирование
// ПСП -> binary
// ============================================================

function decode(encoded) {
    // Последние 50 символов — метаданные.
    const meta = encoded.slice(-META_LENGTH);

    // Всё остальное — закодированная строка.
    const data = encoded.slice(0, -META_LENGTH);

    const n = data.length;


    // ========================================================
    // 1. Декодируем параметры
    // ========================================================

    const metaValue = decodeMeta(meta);

    const r = metaValue % n;

    const rest = Math.floor(metaValue / n);

    const k = rest % (n + 1);

    const wasOdd = Math.floor(rest / (n + 1));


    // ========================================================
    // 2. Отменяем циклический сдвиг
    //
    // Было:
    //
    // ABCDEF
    //
    // стало при r = 2:
    //
    // CDEFAB
    //
    // Возвращаем последние r символов в начало.
    // ========================================================

    let brackets;

    if (r === 0) {
        brackets = data;
    } else {
        brackets =
            data.slice(n - r) +
            data.slice(0, n - r);
    }


    // ========================================================
    // 3. Скобки -> биты
    //
    // ( -> 0
    // ) -> 1
    // ========================================================

    const bits = new Array(n);

    for (let i = 0; i < n; i++) {
        bits[i] = brackets[i] === '(' ? '0' : '1';
    }


    // ========================================================
    // 4. Отменяем инверсию первых k бит
    // ========================================================

    for (let i = 0; i < k; i++) {
        bits[i] = bits[i] === '0' ? '1' : '0';
    }


    // ========================================================
    // 5. Удаляем служебный 0,
    // если исходная длина была нечётной
    // ========================================================

    if (wasOdd) {
        bits.pop();
    }

    return bits.join('');
}


// ============================================================
// Основная программа
// ============================================================

async function main() {
    const run = Number((await nextLine()).trim());
    const tests = Number((await nextLine()).trim());

    if (run === 1) {
        // Первый запуск:
        // binary -> ПСП

        for (let test = 0; test < tests; test++) {
            const binary = (await nextLine()).trim();

            const result = encode(binary);

            await send(result);
        }
    } else {
        // Второй запуск:
        // ПСП -> binary

        for (let test = 0; test < tests; test++) {
            const brackets = (await nextLine()).trim();

            const result = decode(brackets);

            await send(result);
        }
    }

    rl.close();
}

main();