"""P3 shot list (9:16 original, style growkaz-ifverse v3.1). Usage: python3 story/build_story.py <episode>"""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.1/tools'))
from story_lib import *
BN = dict(set='bedroom', so=dict(night=True)); KN = dict(set='kitchen', so=dict(night=True, drawing=False)); SN = dict(set='street', so=dict(variant='night'))
ROWS = [['COACH RAY', '62 days'], ['DAD', '40 days'], ['ANA', '12 days'], ['JAMIE', '9 days'], ['GRAN', '3 days']]
def M(x, pose='sitPhone', expr='neutral', f=1, **k): return who('MIRA_HOME', x, pose, expr, f, seed=2, **k)
# ---------------- HOOK (A: the rule, already happening) ----------------
sh('L001', 'insert', **BN, ins='contacts', rows=ROWS, delAt=1.3, clk=[[0, '23:59:58'], [1.3, '00:00:00']], noHand=True, low=True, hookText='MIDNIGHT DELETES ONE PERSON', hookT=[0, 'L001:9'], sfx=[(1.3, 'hit', -12)])
sh('L001:13', 'scene', **BN, cam=push([760, 600, 1.55], .1), who=[M(720, 'sitPhone', 'worried', box=True)])
sh('L002', 'insert', **BN, ins='reply', to='Dad', drafts=['Hi Dad', ''], noSend=True)
sh('L003', 'scene', **SN, cam=[[960, 560, 1.2], [980, 560, 1.28]], who=[who('X1', 820, 'phone', 'worried', seed=3), who('X4', 1000, 'phone', 'nervous', f=-1, seed=4), who('X2', 1160, 'phone', 'flat', f=-1, seed=6)])
# ---------------- ACT 1 ----------------
sh('L004', 'insert', **BN, ins='contacts', rows=[['DAD', '41 days'], ['ANA', '13 days'], ['JAMIE', '10 days'], ['GRAN', '4 days'], ['THEO', '2 days']], clk=[[0, '21:14']])
sh('L004:6', 'face', **BN, who='MIRA_HOME', expr=[[0, 'sad'], ['L004:8', 'hurt']], side=-1, look=[0, .5], bgCam=[720, 520, 1.6])
sh('L004+0.3', 'insert', **BN, ins='reply', to='Dad', drafts=['hi'], noSend=True, stamp='23:40')
# ---------------- ACT 2 ----------------
sh('L005-0.4', 'scene', **BN, cam=[[760, 590, 1.35], [760, 590, 1.42]], stamp='23:55', who=[M(0, 'phone', 'nervous', walk=[600, 920, 0, 1], slow=True)])
sh('L006', 'insert', **BN, ins='callscreen', name='Dad', clk=[[0, '23:59:52'], [.6, '23:59:53'], [1.6, '23:59:54']], noHand=False)
sh('L006+0.4', 'face', **BN, who='MIRA_HOME', expr='nervous', side=-1, look=[.1, .4], bgCam=[720, 520, 1.6])
sh('L007-0.3', 'insert', **BN, ins='callscreen', name='Dad', delAt=.3, clk=[[0, '23:59:59'], [.3, '00:00:00']], sfx=[(.3, 'hit', -12)])
sh('L008', 'insert', **BN, ins='callscreen', name='Dad', delAt=-2, answerAt=0, clk=[[0, '00:00:03']])
sh('L009', 'scene', **KN, cam=push([700, 590, 1.5], .1), stamp='00:00', who=[who('DAD', 700, 'phoneEar', [[0, 'confused'], ['L009:3', 'worried']], seed=3)])
# ---------------- ACT 3 ----------------
sh('L010', 'insert', **KN, ins='contacts', rows=[['MIRA', '41 days'], ['BOB', '30 days'], ['DENTIST', '20 days'], ['SUE', '6 days'], ['GOLF CLUB', '2 days']], delAt=.3, clk=[[0, '23:59:59'], [.3, '00:00:00']])
sh('L010:6', 'face', **BN, who='MIRA_HOME', expr=[[0, 'surprised'], [.5, 'teary']], side=-1, bgCam=[720, 520, 1.6])
sh('L011', 'face', **BN, who='MIRA_HOME', expr=[[0, 'teary'], ['L011:3', 'tearsmile']], side=-1, bgCam=[720, 520, 1.6])
sh('L011:5', 'insert', **BN, ins='hand', digits='07700 900 412', ask=dict(text='Would you have called him first?', at='L011+0.1'))
finish('Midnight Deletes the Person You Ignored Longest', motif='num', tail=1.9,
       music=[(0, 'L003+', 'mystery', .36), ('L004', 'L007', 'tension', .3), ('L008', None, 'calm', .34)],
       cues=[('L006', 'phonebuzz', -14), ('L007-0.3', 'whoosh', -14)])
