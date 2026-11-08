#!/bin/sh
# Re-creates tools/ (upstream repos are NOT in git). Safe to re-run: existing clones are skipped.
# Run from the workspace root on macOS or WSL:  sh pipeline/get-tools.sh   then   bash pipeline/setup.sh
set -e
cd "$(dirname "$0")/.."
get() { name=$1 url=$2 ref=$3
  if [ -d "tools/$name/.git" ]; then echo "  = $name (already here)"; return; fi
  echo "  + $name"; git clone -q "$url" "tools/$name" && { [ -z "$ref" ] || git -C "tools/$name" checkout -q "$ref" 2>/dev/null || echo "    (pinned $ref not found; using latest)"; }; }
get lemo-opuscar        https://github.com/lemomo-ai/lemo-opuscar             bebbbe1
get threejs-skills      https://github.com/cloudai-x/threejs-skills           0e18186
get youtube-agent-skill https://github.com/Jakeschincariol/youtube-agent-skill a2feb21
get earshot             https://github.com/Leonxlnx/earshot                   591fa3e
get claude-video        https://github.com/bradautomates/claude-video         03ceb42
get claude-video-vision https://github.com/jordanrendric/claude-video-vision  4a4f990
get clipwing-skills     https://github.com/Clipwing/skills                    edbefcb
get ClaudeAnimationBase https://github.com/JohnHeibel/ClaudeAnimationBase     0ac8bf2
# hyperframes: sparse (skills/examples/themes only)
if [ ! -d tools/hyperframes/.git ]; then echo "  + hyperframes (sparse)"
  git clone -q --filter=blob:none --sparse https://github.com/heygen-com/hyperframes tools/hyperframes
  git -C tools/hyperframes sparse-checkout set skills examples themes; fi
# optional / parked: awesome-opus5-5-videos, video-use, creator-lab (uncomment if wanted)
# get creator-lab https://github.com/artemnovitckii/creator-lab 14f8356
mkdir -p skills/real-sfx; cp -r tools/clipwing-skills/skills/real-sfx/. skills/real-sfx/ 2>/dev/null || true
echo "== lemo models + samples (large: Kokoro ~350 MB, instruments ~1.4 GB)"
( cd tools/lemo-opuscar && sh tools/fetch.sh voice && sh tools/fetch.sh instruments vsco2ce vcsl salamander karoryfer freepats )
echo "== timed Kokoro (exact caption + lip timings): adds the duration output to the voice model"
python3 -c "import onnx" 2>/dev/null || python3 -m pip install --user -q onnx 2>/dev/null || pip3 install -q onnx || echo "  install onnx yourself (pip install onnx), then: python3 pipeline/make_timed_kokoro.py"
python3 pipeline/make_timed_kokoro.py tools/lemo-opuscar || true
echo "tools ready. Next: bash pipeline/setup.sh"
