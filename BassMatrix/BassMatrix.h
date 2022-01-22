#pragma once

#include "IPlug_include_in_plug_hdr.h"
#include "IControls.h"
#include "open303/Source/DSPCode/rosic_Open303.h"

const int kNumPresets = 1;
const int kNumberOfPropButtons = 5 * 16;
const int kNumberOfSeqButtons = 12 * 16 + kNumberOfPropButtons;

enum EParams
{
	kParamCutOff = 0,
	kParamResonance,
	kParamWaveForm,
	kParamTuning,
	kParamEnvMode,
	kParamDecay,
	kParamAccent,
	kParamVolume,
	kParamTempo,
	kParamDrive,
	kParamHostSync,
	kParamKeySync,
	kParamInternalSync,
	kParamMidiPlay,

	kBtnSeq0,

	kBtnProp0 = kBtnSeq0 + 16 * 12,

	kLedBtn0 = kBtnProp0 + kNumberOfPropButtons,
	kLedBtn1,
	kLedBtn2,
	kLedBtn3,
	kLedBtn4,
	kLedBtn5,
	kLedBtn6,
	kLedBtn7,
	kLedBtn8,
	kLedBtn9,
	kLedBtn10,
	kLedBtn11,
	kLedBtn12,
	kLedBtn13,
	kLedBtn14,
	kLedBtn15,

	kNumParams
};

enum ECtrlTags
{
  kCtrlTagVersionNumber = 0,
  kCtrlTagBtnSeq0,

  kCtrlTagBtnProp0 = kCtrlTagBtnSeq0 + 16 * 12,

  kCtrlTagLedSeq0 = kCtrlTagBtnProp0 + 16 * 5,
  kCtrlTagLedSeq1,
  kCtrlTagLedSeq2,
  kCtrlTagLedSeq3,
  kCtrlTagLedSeq4,
  kCtrlTagLedSeq5,
  kCtrlTagLedSeq6,
  kCtrlTagLedSeq7,
  kCtrlTagLedSeq8,
  kCtrlTagLedSeq9,
  kCtrlTagLedSeq10,
  kCtrlTagLedSeq11,
  kCtrlTagLedSeq12,
  kCtrlTagLedSeq13,
  kCtrlTagLedSeq14,
  kCtrlTagLedSeq15,

  kNumCtrlTags
};

using namespace iplug;
using namespace igraphics;

class BassMatrix final : public Plugin
{
public:
  BassMatrix(const InstanceInfo& info);

#if IPLUG_EDITOR
  void OnParentWindowResize(int width, int height) override;
  bool OnHostRequestingSupportedViewConfiguration(int width, int height) override { return true; }
#endif


	void ProcessMidiMsg(const IMidiMsg& msg) override;
	void OnReset() override;
	void OnParamChange(int paramIdx) override;
	void OnIdle() override;
	bool OnMessage(int msgTag, int ctrlTag, int dataSize, const void* pData) override;

  
#if IPLUG_DSP // http://bit.ly/2S64BDd
  void ProcessBlock(double** inputs, double** outputs, int nFrames) override;
#endif

protected:
	IMidiQueue mMidiQueue;

private:
  // the embedded core dsp object:
  rosic::Open303 open303Core;
	ISender<1, 1, int> mLedSeqSender;
};
