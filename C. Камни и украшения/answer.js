import fs from 'fs';

const [j = "", s = ""] = fs.readFileSync(0, 'utf8')
    .trim()
    .split('\n');

let counter = 0;

for (const stone of s) {
    if (j.includes(stone)) {
        counter++;
    }
}

console.log(counter);
