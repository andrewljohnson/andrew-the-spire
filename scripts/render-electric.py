"""Original amplified string quartet plus sampled overdriven electric guitar."""
import ctypes as c
from string_engine import np,RATE,note,finish,write
F=c.CDLL('libfluidsynth.so.3')
def api(name,ret,args):
 f=getattr(F,name);f.restype=ret;f.argtypes=args;return f
ptr=c.c_void_p;I=c.c_int
settings=api('new_fluid_settings',ptr,[])();api('fluid_settings_setnum',I,[ptr,c.c_char_p,c.c_double])(settings,b'synth.sample-rate',RATE)
api('fluid_settings_setnum',I,[ptr,c.c_char_p,c.c_double])(settings,b'synth.gain',.55)
synth=api('new_fluid_synth',ptr,[ptr])(settings)
assert api('fluid_synth_sfload',I,[ptr,c.c_char_p,I])(synth,b'/usr/share/sounds/sf2/TimGM6mb.sf2',1)>=0
api('fluid_synth_program_change',I,[ptr,I,I])(synth,0,29)
on=api('fluid_synth_noteon',I,[ptr,I,I,I]);off=api('fluid_synth_noteoff',I,[ptr,I,I]);bend=api('fluid_synth_pitch_bend',I,[ptr,I,I])
render=api('fluid_synth_write_float',I,[ptr,I,ptr,I,I,ptr,I,I])
def guitar(duration,events):
 n=round(duration*RATE);track=np.zeros((n,2));cursor=0
 for at,kind,pitch in sorted(events,key=lambda e:e[0])+[(duration,'end',0)]:
  end=min(n,round(at*RATE));length=end-cursor
  if length>0:
   l=np.zeros(length,np.float32);r=np.zeros(length,np.float32);render(synth,length,l.ctypes.data,0,1,r.ctypes.data,0,1);track[cursor:end]=np.column_stack([l,r]);cursor=end
  if kind=='on':on(synth,0,pitch,92)
  elif kind=='off':off(synth,0,pitch)
  elif kind=='bend':bend(synth,0,pitch)
 return track
B=60/112;length=B*64
voices=[np.zeros((round(length*RATE),2)) for _ in range(4)]
roots=[45,41,43,40,45,48,41,40];chords=[[0,3,7],[0,4,7],[0,4,7],[0,4,8],[0,3,7],[0,4,7],[0,4,7],[0,4,8]]
melody=[[76,74,72,71],[72,69,72,76],[74,71,72,74],[71,68,72,71],[76,81,79,76],[79,76,74,72],[77,76,74,72],[71,68,69,71]];events=[]
for bar in range(16):
 root=roots[bar%8];chord=chords[bar%8];at=bar*4*B
 # Exactly four bowed parts: violin I, violin II, viola, cello.
 for i in range(4):
  note(voices[0],root+24+chord[i%3],at+i*B,1.08*B,.45,'solo',-.45)
  note(voices[1],root+19+chord[(i+1)%3],at+i*B,1.08*B,.35,'solo',.4)
 for i in range(2):
  note(voices[2],root+12+chord[i],at+i*2*B,2.12*B,.5,'viola',.22)
  note(voices[3],root+(7 if i else 0),at+i*2*B,2.12*B,.7,'cello',-.12)
 for i,p in enumerate(melody[bar%8]):
  when=at+i*B;events.extend([(when,'on',p-12),(when+.88*B,'off',p-12)])
  if i==0:events.extend([(when,'bend',8700),(when+.12,'bend',8192)])
# Mild saturation and short stereo chorus electrify the recorded quartet.
strings=sum(np.tanh(v*3)/2 for v in voices)
strings+=np.roll(strings,round(.014*RATE),axis=0)[:,::-1]*.18
lead=guitar(length,events)
# Guitar cabinet rolloff removes fizzy highs while keeping the pick and midrange bite.
freq=np.fft.rfftfreq(len(lead),1/RATE);lead=np.fft.irfft(np.fft.rfft(lead,axis=0)/(1+(freq[:,None]/4300)**4),n=len(lead),axis=0)
strings*=.13/max(.001,np.sqrt(np.mean(strings**2)));lead*=.105/max(.001,np.sqrt(np.mean(lead**2)))
lead+=np.roll(lead,round(B*.75*RATE),axis=0)*.17
mix=finish(strings+lead)
write('score-electric.wav',mix)
# Matching electric quartet finale and one sustained guitar resolution.
length=7.;quartet=np.zeros((round(length*RATE),2))
for pitch,patch,pan in [(81,'solo',-.4),(76,'solo',.4),(60,'viola',.2),(45,'cello',-.15)]:note(quartet,pitch,0,6.7,.55,patch,pan,False)
events=[]
for i,p in enumerate([57,60,64,69]):events.extend([(i*.35,'on',p),(i*.35+.3 if i<3 else 6.5,'off',p)])
lead=guitar(length,events);lead*=.1/max(.001,np.sqrt(np.mean(lead**2)))
write('victory-electric.wav',finish(np.tanh(quartet*2)*.7+lead,False))
api('delete_fluid_synth',None,[ptr])(synth);api('delete_fluid_settings',None,[ptr])(settings)
