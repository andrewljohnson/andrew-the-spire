"""Original tactile combat cues: soft cut, heavy hit, shield clang, shield fracture."""
from pathlib import Path
import wave
import numpy as np
RATE=44100
out=Path('assets/audio');out.mkdir(exist_ok=True)
rng=np.random.default_rng(29)
def render(kind,duration):
 t=np.arange(round(duration*RATE))/RATE
 noise=rng.normal(0,1,len(t))
 attack=np.minimum(t/.002,1)
 if kind=='light':
  signal=.3*np.sin(2*np.pi*(220*t-145*t*t))*np.exp(-t*27)+.09*noise*np.exp(-t*55)
 elif kind=='heavy':
  signal=.42*np.sin(2*np.pi*(95*t-45*t*t))*np.exp(-t*12)+.2*np.sin(2*np.pi*173*t)*np.exp(-t*24)+.15*noise*np.exp(-t*38)
 elif kind=='blocked':
  signal=sum(a*np.sin(2*np.pi*f*t)*np.exp(-t*d) for f,a,d in [(790,.18,16),(1261,.12,22),(1933,.075,30),(2851,.035,35)])+.07*noise*np.exp(-t*90)
 else:
  # Dry fracture, then three tumbling glass/metal fragments. No bass health-hit layer.
  signal=.2*noise*np.exp(-t*70)+.16*np.sin(2*np.pi*470*t)*np.exp(-t*30)
  for at,f in [(.018,2300),(.049,1670),(.092,3100)]:
   u=np.maximum(0,t-at)
   signal+=(t>=at)*(.12*np.sin(2*np.pi*f*u)+.045*noise)*np.exp(-u*42)*np.minimum(u/.001,1)
 signal=np.tanh(signal*1.4)*attack*np.minimum((duration-t)/.012,1)
 stereo=np.column_stack([signal,signal])
 with wave.open(str(out/f'hit-{kind}.wav'),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(RATE);f.writeframes((stereo*32767).astype('<i2').tobytes())
 assert np.isfinite(stereo).all() and np.max(np.abs(stereo))<1
 print(f'{kind}: {duration:.2f}s, peak {np.max(np.abs(stereo)):.2f}')
for kind,duration in [('light',.23),('heavy',.43),('blocked',.32),('break',.30)]:render(kind,duration)
