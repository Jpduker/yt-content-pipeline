"""Outro test: four sign-off/subscribe endings, one per line (labelled)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
sh('L001-0.3', 'outro', 'cut', cap=False, v='iris', tag='A  1930s CARTOON IRIS-OUT', line='See you between the ifs!')
sh('L002-0.3', 'outro', {'type': 'dipWhite'}, cap=False, v='silent', tag='B  SILENT-FILM CARD')
sh('L003-0.3', 'outro', {'type': 'push'}, cap=False, v='button', tag='C  HERO PRESSES SUBSCRIBE', line='New what if every day')
sh('L004-0.3', 'outro', {'type': 'bands'}, cap=False, v='ident', tag='D  CHANNEL IDENT + END SCREEN')
finish('Outro Test', motif='num', tail=3.0, music=[(0, None, 'playful', .4)])
