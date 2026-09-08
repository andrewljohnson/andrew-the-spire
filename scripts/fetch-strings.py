"""Download the CC0 VSCO 2 CE string recordings used by our original score."""
from pathlib import Path
from urllib.request import urlretrieve
from urllib.parse import quote
root=Path(__file__).parent/'string-samples'
files={
 'violin-a.wav':'Strings/Solo Violin/Arco Vib/LLVln_ArcoVib_A4_f.wav',
 'violin-e.wav':'Strings/Solo Violin/Arco Vib/LLVln_ArcoVib_E5_f.wav',
 'section-a.wav':'Strings/Violin Section/susVib/VlnEns_susVib_A3_v2.wav',
 'viola-d.wav':'Strings/Viola Section/susvib/ViolaEns_susvib_D3_v2_1.wav',
 'cello-d.wav':'Strings/Cello Section/susvib/susvib_D2_v3_1.wav',
 'cello-g.wav':'Strings/Cello Section/susvib/susvib_G1_v3_1.wav',
 'short-d.wav':'Strings/Viola Section/spic/Violas_spic_D3_v2_rr1.wav',
}
root.mkdir(exist_ok=True)
for name,path in files.items():
 if not (root/name).exists():urlretrieve('https://raw.githubusercontent.com/sgossner/VSCO-2-CE/master/'+quote(path),root/name)
 print(name,(root/name).stat().st_size)
urlretrieve('https://raw.githubusercontent.com/sgossner/VSCO-2-CE/master/LICENSE',root/'LICENSE')
