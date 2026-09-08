"""Sample-timed attack counts and a warm ascending armor power-up."""
from pathlib import Path
import wave
import numpy as np
R=44100
root=Path(__file__).resolve().parent.parent/'assets/audio'
def write(name,s):
 assert np.isfinite(s).all() and abs(s).max()<1
 with wave.open(str(root/name),'wb') as w:
  w.setnchannels(2);w.setsampwidth(2);w.setframerate(R);w.writeframes((np.column_stack([s,s])*32767).astype('<i2').tobytes())
for count in range(1,22):
 gap=max(.045,min(.085,.65/max(1,count-1)))
 s=np.zeros(round(((count-1)*gap+.05)*R))
 for i in range(count):
  t=np.arange(round(.035*R))/R
  rng=np.random.default_rng(80+i)
  pulse=(np.sin(2*np.pi*(740*t-3800*t*t))*.32+rng.normal(0,1,len(t))*.095)*np.exp(-t*125)*np.minimum(t/.001,1)*np.minimum((.035-t)/.006,1)
  start=round(i*gap*R);s[start:start+len(t)]+=pulse
 write(f'tats-{count}.wav',s)
 if count==1:write('hit-light.wav',s)
# Blooming major arpeggio over a smooth upward sweep; no metallic impact transient.
t=np.arange(round(.72*R))/R
s=.1*np.sin(2*np.pi*(190*t+420*t*t))*np.sin(np.pi*t/.72)**2
for i,f in enumerate([392,494,587,784]):
 u=np.maximum(0,t-i*.075)
 env=(1-np.exp(-u*42))*np.exp(-u*6)*(t>=i*.075)
 s+=(np.sin(2*np.pi*f*u)*.15+np.sin(2*np.pi*f*2*u)*.025)*env
s*=np.minimum((.72-t)/.06,1)
write('guard.wav',s)
print('21 counted attack bursts and armor power-up generated')
