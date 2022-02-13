import { computed, makeObservable, observable } from 'mobx';
import * as Tonal from '@tonaljs/tonal';

class Storage {
    load(): { latestScales: string[] } {
        const latestScalesStr = localStorage.getItem('latestScales');
        const latestScales: string[] = latestScalesStr ? JSON.parse(latestScalesStr) : [];
        return { latestScales };
    }

    save(latestScales: string[]): void {
        const latestScalesStr = JSON.stringify(latestScales);
        localStorage.setItem('latestScales', latestScalesStr);
    }
}

export function scaleNotes(scaleName: string): string[] {
    return !scaleName ? [] : Tonal.Scale.get(scaleName).notes;
}

export class Store {
    readonly storage = new Storage();

    scaleName = 'C major';
    latestScales: string[] = [];

    constructor() {
        makeObservable(this, {
            scaleName: observable,
            latestScales: observable,
            scaleNotes: computed,
        });
    }

    get scaleNotes(): string[] {
        return scaleNotes(this.scaleName);
    }
}