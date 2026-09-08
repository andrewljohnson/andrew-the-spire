"""Small offline sampler for the CC0 VSCO 2 bowed-string recordings."""
from pathlib import Path
import wave
import numpy as np
RATE=44100
ROOT=Path(__file__).resolve().parent
SAMPLES={}
def load(name):
 if name in SAMPLES:return SAMPLES[name]
 with wave.open(str(ROOT/'string-samples'/name),'rb') as w:
  channels=w.getnchannels();rate=w.getframerate();width=w.getsampwidth();raw=w.readframes(w.getnframes())
  if width==2:x=np.frombuffer(raw,'<i2').astype(float)/32768
  elif width==3:
   b=np.frombuffer(raw,np.uint8).reshape(-1,3);v=b[:,0].astype(np.int32)+(b[:,1].astype(np.int32)<<8)+(b[:,2].astype(np.int32)<<16);x=((v^8388608)-8388608)/8388608
  else:raise ValueError(width)
  x=x.reshape(-1,channels).mean(1)
 # Remove recording lead-in while preserving the actual bow onset.
 onset=np.flatnonzero(abs(x)>max(abs(x))*.045)[0];x=x[max(0,onset-round(rate*.018)):]
 rms=np.sqrt(np.mean(x[round(rate*.15):round(rate*.8)]**2));x*=.12/max(.001,rms)
 SAMPLES[name]=(x,rate);return x,rate
PATCHES={'solo':[('violin-a.wav',69),('violin-e.wav',76)],'section':[('section-a.wav',69)],'viola':[('viola-d.wav',62)],'cello':[('cello-g.wav',43),('cello-d.wav',50)],'short':[('short-d.wav',62)]}
def note(track,midi,at,duration,level,patch,pan=0,circular=True):
 name,root=min(PATCHES[patch],key=lambda v:abs(v[1]-midi));sample,sr=load(name)
 t=np.arange(round(duration*RATE))/RATE
 positions=t*sr*2**((midi-root)/12)
 voice=np.interp(positions,np.arange(len(sample)),sample,left=0,right=0)
 # Preserve recorded articulation and vibrato; no synthetic oscillators.
 release=min(.18,duration*.3);env=np.minimum(t/.012,1)*np.minimum((duration-t)/release,1)
 voice*=env*level
 start=round(at*RATE);idx=start+np.arange(len(voice))
 if circular:idx%=len(track)
 else:
  keep=idx<len(track);idx=idx[keep];voice=voice[keep]
 track[idx,0]+=voice*np.sqrt((1-pan)/2);track[idx,1]+=voice*np.sqrt((1+pan)/2)
def finish(track,circular=True):
 dry=track.copy()
 for delay,gain in [(.031,.12),(.053,.1),(.089,.075),(.137,.05),(.211,.03)]:
  n=round(delay*RATE)
  if circular:track+=np.roll(dry,n,axis=0)[:,::-1]*gain
  else:track[n:]+=dry[:-n,::-1]*gain
 peak=np.max(abs(track));track*=.77/max(peak,.01)
 if not circular:track[-round(.3*RATE):]*=np.linspace(1,0,round(.3*RATE))[:,None]
 return track
def write(name,track):
 path=ROOT.parent/'assets/audio'/name
 assert np.isfinite(track).all() and np.max(abs(track))<1
 with wave.open(str(path),'wb') as w:
  w.setnchannels(2);w.setsampwidth(2);w.setframerate(RATE);w.writeframes((track*32767).astype('<i2').tobytes())
 print(name,round(len(track)/RATE,2),'seconds; peak',round(np.max(abs(track)),3),'RMS',round(np.sqrt(np.mean(track**2)),3))
