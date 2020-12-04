export function randomSample<T>(arr: T[]): T {
    const i = Math.floor(Math.random() * arr.length);
    return arr[i];
}

export function randomSamples<T>(arr: T[], n: number): T[] {
    const items = arr.slice();
    const res = new Array(n).fill(undefined);

    for (let i = 0; i < n; i++) {
        if (items.length === 0) break;
        const randomIndex = Math.floor(Math.random() * items.length);
        res[i] = items.splice(randomIndex, 1)[0];
    }

    return res;
}

export function intersection<T>(...arrays: T[][]): T[] {
    const rest = arrays.slice(1);

    return arrays[0].reduce((memo: T[], val) => {
        const includesVal = (arr: T[]) => arr.includes(val);
        const ok = rest.every(includesVal);

        if (ok) memo.push(val);

        return memo;
    }, []);
}
