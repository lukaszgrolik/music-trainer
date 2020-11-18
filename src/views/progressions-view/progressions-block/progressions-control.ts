import { action, makeObservable, observable } from 'mobx';

export class ProgressionsControl {
    showDiagrams = false;
    showScales = false;
    volume = -12;

    constructor() {
        makeObservable(this, {
            volume: observable,
            setVolume: action,
            showDiagrams: observable,
            setShowDiagrams: action,
            showScales: observable,
            setShowScales: action,
        });
    }

    setVolume(val: number) {
        this.volume = val;
    }

    setShowDiagrams(val: boolean) {
        this.showDiagrams = val;
    }

    setShowScales(val: boolean) {
        this.showScales = val;
    }
}