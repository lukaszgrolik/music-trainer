import { action, makeObservable, observable } from 'mobx';

export class ProgressionsControl {
    showDiagrams = false;
    showScales = false;

    constructor() {
        makeObservable(this, {
            showDiagrams: observable,
            setShowDiagrams: action,
            showScales: observable,
            setShowScales: action,
        });
    }

    setShowDiagrams(val: boolean) {
        this.showDiagrams = val;
    }

    setShowScales(val: boolean) {
        this.showScales = val;
    }
}