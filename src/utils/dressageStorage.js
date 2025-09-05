const DRESSAGE_STORAGE_KEY = 'dressageProgressV1';

const defaultState = {
  byHorse: {}
};

export const dressageStorage = {
  load() {
    try {
      const raw = localStorage.getItem(DRESSAGE_STORAGE_KEY);
      if (!raw) return { ...defaultState };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return { ...defaultState };
      return { ...defaultState, ...parsed, byHorse: parsed.byHorse || {} };
    } catch (e) {
      console.warn('Dressage storage load failed', e);
      return { ...defaultState };
    }
  },
  save(state) {
    try {
      const toSave = { ...defaultState, ...state, byHorse: state.byHorse || {} };
      localStorage.setItem(DRESSAGE_STORAGE_KEY, JSON.stringify(toSave));
      return true;
    } catch (e) {
      console.warn('Dressage storage save failed', e);
      return false;
    }
  },
  getHorseKey(horse) {
    if (!horse) return 'global';
    if (horse.id !== undefined && horse.id !== null) return `id:${horse.id}`;
    if (horse.name) return `name:${horse.name}`;
    return 'global';
  },
  getHorseProgress(horse) {
    const state = this.load();
    const key = this.getHorseKey(horse);
    return state.byHorse[key] || null;
  },
  setHorseProgress(horse, record) {
    const state = this.load();
    const key = this.getHorseKey(horse);
    state.byHorse[key] = record;
    this.save(state);
    return true;
  }
};

export default dressageStorage;

