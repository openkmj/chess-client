import { murmur3 } from "./murmur3";

const hash = (key) => {
  return murmur3(key);
};

class LookupTable {
  constructor() {
    this.table = new Map();
    this.isInit = false;
  }

  async init() {
    if (this.isInit) return;

    const buffer = await fetch("/chess-client/output.bin").then((res) =>
      res.arrayBuffer()
    );
    const view = new DataView(buffer);
    const rowCount = buffer.byteLength / 6;

    for (let i = 0; i < rowCount; i++) {
      const offset = i * 6;
      const key = view.getInt32(offset, true);
      const value = view.getInt16(offset + 4, true);
      this.table.set(key, value);
    }
    this.isInit = true;
  }

  get(key) {
    const hashedKey = hash(key);
    console.log(`${key}, ${this.table.get(hashedKey)}`);
    return this.table.get(hashedKey);
  }

  has(key) {
    const hashedKey = hash(key);
    return this.table.has(hashedKey);
  }
}

const lookupTable = new LookupTable();

export default lookupTable;
