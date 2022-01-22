/* Declares the BassMatrix Audio Worklet Processor */

class BassMatrix_AWP extends AudioWorkletGlobalScope.WAMProcessor
{
  constructor(options) {
    options = options || {}
    options.mod = AudioWorkletGlobalScope.WAM.BassMatrix;
    super(options);
  }
}

registerProcessor("BassMatrix", BassMatrix_AWP);
