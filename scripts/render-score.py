"""Original all-strings score: recorded solo violin, violin section, viola, cello."""
from string_engine import np,RATE,note,finish,write
BEAT=60/112
track=np.zeros((round(BEAT*64*RATE),2))
roots=[45,41,43,40,45,48,41,40]
chords=[[0,3,7],[0,4,7],[0,4,7],[0,4,8],[0,3,7],[0,4,7],[0,4,7],[0,4,8]]
melody=[[76,74,72,71],[72,69,72,76],[74,71,72,74],[71,68,72,71],[76,81,79,76],[79,76,74,72],[77,76,74,72],[71,68,69,71]]
for bar in range(16):
 root=roots[bar%8];chord=chords[bar%8];at=bar*4*BEAT
 # Cello carries the pulse with two bowed half notes.
 note(track,root,at,2.15*BEAT,.6,'cello',.1)
 note(track,root+7,at+2*BEAT,2.1*BEAT,.45,'cello',.1)
 for interval in chord[:2]:note(track,root+12+interval,at,4.12*BEAT,.25,'viola',.35)
 note(track,root+24+chord[1],at,4.1*BEAT,.19,'section',-.4)
 # Quiet short bow strokes replace the piano's rhythmic role.
 for step in range(8):note(track,root+12+chord[[0,2,1,2][step%4]],at+step*.5*BEAT,.48*BEAT,.19 if step%2 else .26,'short',.4)
 # The exposed violin melody is present from the first note.
 for i,pitch in enumerate(melody[bar%8]):
  if bar>=8 and i==1:pitch+=12 if pitch<74 else 0
  note(track,pitch,at+i*BEAT,1.13*BEAT,.85 if i%2==0 else .72,'solo',-.12)
track=finish(track)
write('score-strings.wav',track)
print('Loop boundary step:',round(np.max(abs(track[0]-track[-1])),5))
