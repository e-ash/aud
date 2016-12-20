const aud = {
  FastBase64: {
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encLookup: [],
    Init: function() {
      for (var i = 0; i < 4096; i++) {
        this.encLookup[i] = this.chars[i >> 6] + this.chars[i & 0x3F];
      }
    },
    Encode(src) {
      var len = src.length;
      var dst = '';
      var i = 0;
      while (len > 2) {
        n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
        dst += this.encLookup[n >> 12] + this.encLookup[n & 0xFFF];
        len -= 3;
        i += 3;
      }
      if (len > 0) {
        var n1 = (src[i] & 0xFC) >> 2;
        var n2 = (src[i] & 0x03) << 4;
        if (len > 1) n2 |= (src[++i] & 0xF0) >> 4;
        dst += this.chars[n1];
        dst += this.chars[n2];
        if (len == 2) {
          var n3 = (src[i++] & 0x0F) << 2;
          n3 |= (src[i] & 0xC0) >> 6;
          dst += this.chars[n3];
        }
        if (len == 1) dst += '=';
        dst += '=';
      }
      return dst;
    }
  },
  wave: (fn = x => Math.sin(x * 2 * Math.PI), p = 1) =>
    (l = 1, f = 1000, m = 1, c = 1, r = 44100) =>
    (new Uint8ClampedArray(l * r * c | 0)).map((e, i) =>
      128 + 127 * fn((i - i % c) * f % 1 * p / r));
  makeAud: (data, channels = 1, rate = 44100) => ({
    data,
    rate,
    channels
  }),
  u32ToArray(i) {
    return [i & 0xFF, (i >> 8) & 0xFF, (i >> 16) & 0xFF, (i >> 24) & 0xFF];
  },
  u16ToArray(i) {
    return [i & 0xFF, (i >> 8) & 0xFF];
  },
  makeWav(audio) {
    const align = (audio.channels * 8) >> 3;
    const byteRate = align * audio.rate;
    const chunkSize = 36 + audio.data.length;
    const blob = new Blob([
      "RIFF",
      aud.u32ToArray(chunkSize),
      "WAVE",
      "fmt ",
      aud.u32ToArray(16),
      aud.u16ToArray(audio.channels),
      aud.u32ToArray(audio.rate),
      aud.u32ToArray(byteRate),
      aud.u16ToArray(align),
      aud.u16ToArray(8),
      "data",
      aud.u32ToArray(audio.data.length),
      audio.data
    ], {
      type: "audio/wav"
    });
    return blob;
  }
};
aud.sine = aud.wave();
aud.square = aud.wave(x => x / Math.abs(x));
aud.saw = aud.wave(x => x % 1);
aud.FastBase64.Init();
