# Third-party components

Install dependencies from their official registries/releases. Their licenses are separate from the workflow and runtime source.

- HyperFrames 0.9.58: npm package `hyperframes`; preserve its installed license and notices.
- GSAP 3.15.1: npm package `gsap`; see its included license and [official licensing page](https://gsap.com/community/standard-license/).
- Kokoro ONNX 0.6.1: [official project](https://github.com/thewh1teagle/kokoro-onnx), MIT.
- Kokoro-82M model and voice assets: [official model repository](https://huggingface.co/hexgrad/Kokoro-82M), Apache-2.0. Download hashes are pinned in `setup_models.py`.
- Font assets shipped by installed dependencies retain their applicable upstream licenses. The generic example renderer uses the CSS `sans-serif` family and copies no custom font assets into generated jobs.
- FFmpeg: use an official/reputable distribution and comply with that build's LGPL/GPL licensing and applicable codec requirements.

Model weights, fonts, FFmpeg binaries and node_modules are not redistributed in the runtime ZIP. Content and image rights remain the operator's responsibility.

The generic card renderer uses the CSS `sans-serif` family and does not copy the earlier Inter font assets into rendered jobs. Installed dependencies retain their own upstream asset notices.
