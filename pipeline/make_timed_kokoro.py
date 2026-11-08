"""One-time: make a Kokoro model that also REPORTS phoneme durations (for exact caption + lip sync).
Adds the encoder's own duration tensor ('/encoder/Gather_output_0', frames per phoneme) as a graph output named 'duration',
which kokoro-onnx's create_timed() reads. The audio is unchanged.  Needs: pip install onnx
   python3 pipeline/make_timed_kokoro.py [tools/lemo-opuscar]"""
import sys, os
import onnx
from onnx import helper, TensorProto
LIB = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('LIB', 'tools/lemo-opuscar')
src = os.path.join(LIB, 'core/tts/kokoro-v1.0.onnx'); dst = os.path.join(LIB, 'core/tts/kokoro-v1.0-timed.onnx')
m = onnx.load(src); g = m.graph
if 'duration' not in [o.name for o in g.output]:
    g.node.append(helper.make_node('Identity', ['/encoder/Gather_output_0'], ['duration'], name='expose_duration'))
    g.output.append(helper.make_tensor_value_info('duration', TensorProto.INT64, None))
onnx.save(m, dst); print('wrote', dst)
