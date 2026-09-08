"""Original death Foley and bowed rage cue; no runtime synthesis."""
from pathlib import Path
import numpy as np,wave
R=44100;out=Path(__file__).resolve().parent.parent/'assets/audio';rng=np.random.default_rng(63)
def save(name,x):
 x=np.tanh(x);x*=.72/max(.72,abs(x).max());x[-2205:]*=np.linspace(1,0,2205)
 with wave.open(str(out/(name+'.wav')),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(R);w.writeframes((np.column_stack([x,x]) *32767).astype('<i2').tobytes())
def t(n):return np.arange(round(n*R))/R
x=t(1.35);road=np.zeros(len(x))
for at,f,g in [(0,135,.35),(.26,330,.28),(.48,720,.24),(.61,520,.16),(.72,900,.1)]:
 u=np.maximum(0,x-at);road+=(x>=at)*(g*np.sin(2*np.pi*f*u)+.09*rng.normal(size=len(x)))*np.exp(-u*24)*np.minimum(u/.002,1)
save('death-road',road)
x=t(1.55);noise=rng.normal(size=len(x));smooth=np.convolve(noise,np.ones(12)/12,mode='same');dune=smooth*.75*np.sin(np.pi*x/1.55)**1.5+.15*np.sin(2*np.pi*(95*x-20*x*x))*np.exp(-x*7)
save('death-dune',dune)
x=t(2.6);bell=sum(g*np.sin(2*np.pi*f*x+0.7*np.sin(2*np.pi*3*x))*np.exp(-x*d) for f,g,d in [(87,.25,1.3),(174,.2,1.8),(239,.12,2.2),(411,.09,3)])
u=np.maximum(0,x-.52);bell+=(x>=.52)*(.3*np.sin(2*np.pi*65*u)+rng.normal(0,.13,len(x)))*np.exp(-u*16);bell*=np.minimum(x/.005,1)
save('death-boss',bell)
# A short rising, abrasive bow scrape made from the recorded cello sustain.
from string_engine import load
sample,sr=load('cello-g.wav');x=t(.85);pos=(.3+x*.9+x*x*.45)*sr
scrape=np.interp(pos,np.arange(len(sample)),sample)*np.sin(np.pi*x/.85)*1.25
save('rage-bow',scrape)
print('Three distinct deaths and one bowed rage cue rendered.')
