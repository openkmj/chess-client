const C1 = 0xcc9e2d51;
const C2 = 0x1b873593;
const SEED = 42;

function mixK1(k1) {
  k1 = Math.imul(k1, C1);
  k1 = (k1 << 15) | (k1 >>> 17);
  k1 = Math.imul(k1, C2);
  return k1 >>> 0;
}

function mixH1(h1, k1) {
  h1 ^= k1;
  h1 = (h1 << 13) | (h1 >>> 19);
  h1 = Math.imul(h1, 5) + 0xe6546b64;
  return h1 >>> 0;
}

function fmix(h1, length) {
  h1 ^= length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;
  return h1;
}

export function murmur3(key) {
  let h1 = SEED;
  const len = key.length;
  const remainder = len % 4;
  const bytes = len - remainder;

  let i = 0;
  while (i < bytes) {
    let k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(i + 1) & 0xff) << 8) |
      ((key.charCodeAt(i + 2) & 0xff) << 16) |
      ((key.charCodeAt(i + 3) & 0xff) << 24);
    i += 4;

    k1 = mixK1(k1);
    h1 = mixH1(h1, k1);
  }

  for (let j = 0; j < remainder; j++) {
    const byte = key.charCodeAt(i + j) & 0xff;
    const k1 = mixK1(byte);
    h1 = mixH1(h1, k1);
  }

  return fmix(h1, len);
}
