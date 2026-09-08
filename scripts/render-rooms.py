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
api('fluid_synth_program_change',I,[ptr,I,I])(synth,0,27)
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

# Sparse clean-guitar phrases and warm quartet voicings; no overdrive or repeated bends.
rooms={
 'title':(78,[45,48,41,43,45,41,43,45],[69,72,71,67],.55),
 'map':(88,[48,43,45,41,48,45,41,43],[72,74,76,71],.45),
 'crossing':(100,[45,41,48,43]*4,[69,72,76,74,72,71,67,69],.7),
 'reward':(84,[48,41,45,43,48,41,43,48],[76,74,72,79],.4),
 'well':(72,[41,45,48,43,41,48,43,41],[69,67,72,74],.32),
 'boss':(106,[40,45,41,40,43,41,45,40]*2,[64,67,69,71,72,71,67,64],.75),
 'victory':(80,[48,41,43,48],[76,79,74,72],.5),
}
for room,(tempo,roots,phrase,intensity) in rooms.items():
 B=60/tempo;length=len(roots)*4*B;quartet=np.zeros((round(length*RATE),2));events=[]
 for bar,root in enumerate(roots):
  at=bar*4*B;third=3 if root in [45,40] else 4
  # Open, consonant voicings with much less high-register repetition.
  note(quartet,root,at,3.9*B,.43,'cello',.1)
  note(quartet,root+12+third,at,3.9*B,.22,'viola',.3)
  note(quartet,root+19,at,3.9*B,.17,'solo',-.35)
  note(quartet,root+24,at+2*B,1.9*B,.15,'solo',.35)
  if room in ['boss','crossing']:
   for step in [0,1.5,3]:note(quartet,root+12,at+step*B,.7*B,.15*intensity,'short',.15)
  # Guitar answers every other bar, leaving the quartet room to breathe.
  if bar%2==0:
   pitch=phrase[(bar//2)%len(phrase)]-12
   events.extend([(at+.5*B,'on',pitch),(at+2.1*B,'off',pitch),(at+2.5*B,'on',pitch+2 if room=='boss' else pitch),(at+3.75*B,'off',pitch+2 if room=='boss' else pitch)])
 lead=guitar(length,events)
 lead*=.035/max(.001,np.sqrt(np.mean(lead**2)))
 quartet*=.11/max(.001,np.sqrt(np.mean(quartet**2)))
 mix=quartet+lead
 freq=np.fft.rfftfreq(len(mix),1/RATE)
 mix=np.fft.irfft(np.fft.rfft(mix,axis=0)/(1+(freq[:,None]/3200)**4),n=len(mix),axis=0)
 mix=finish(mix)*.68
 # Half-rate stereo PCM keeps the longer, gentler arrangements inexpensive to cache.
 from pathlib import Path
 import wave
 with wave.open(str(Path(__file__).resolve().parent.parent/'assets/audio'/f'room-{room}.wav'),'wb') as w:
  w.setnchannels(2);w.setsampwidth(2);w.setframerate(RATE//2);w.writeframes((mix[::2]*32767).astype('<i2').tobytes())
 print(room,round(length,1),'seconds, peak',round(abs(mix).max(),3))
api('delete_fluid_synth',None,[ptr])(synth);api('delete_fluid_settings',None,[ptr])(settings)
