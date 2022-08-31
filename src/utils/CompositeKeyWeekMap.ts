export class CompositeKeyWeekMap<V> {
    map = new WeakMap<object, { map?: CompositeKeyWeekMap<V>; value?: V; }>();
    get([firstKey, ...restKeys]: object[]): V | undefined {
        const entry = this.map.get(firstKey);
        return restKeys.length === 0
            ? entry?.value
            : entry?.map?.get(restKeys);
    }
    set([firstKey, ...restKeys]: object[], value: V) {
        if (!this.map.has(firstKey)) { this.map.set(firstKey, {}); }
        const entry = this.map.get(firstKey)!;
        if (restKeys.length === 0) {
            entry.value = value;
        } else {
            if (!entry.map) { entry.map = new CompositeKeyWeekMap<V>(); }
            entry.map.set(restKeys, value);
        }
    }
}