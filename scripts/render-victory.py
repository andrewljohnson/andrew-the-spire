"""Original all-strings victory cadence, using the same recorded ensemble."""
from string_engine import np,RATE,note,finish,write
track=np.zeros((round(RATE*7),2))
for i,midi in enumerate([69,72,76,81,79,81]):note(track,midi,i*.35,.55,.75,'solo',-.12,False)
for midi in [57,60,64]:note(track,midi,2.1,4.4,.38,'viola',.3,False)
for midi in [72,76,81]:note(track,midi,2.1,4.5,.42,'section',-.3,False)
note(track,45,2.1,4.6,.6,'cello',.1,False)
write('victory-strings.wav',finish(track,False))
