#include "BassMatrix.h"
#include "IPlug_include_in_plug_src.h"
#include "o303Controls.h"

#if IPLUG_EDITOR
#include "IControls.h"
#endif

BassMatrix::BassMatrix(const InstanceInfo& info)
: Plugin(info, MakeConfig(kNumParams, kNumPresets))
{
  GetParam(kParamCutOff)->InitDouble("Cut off", 500.0, 314.0, 2394.0, 1.0, "Hz");
  GetParam(kParamResonance)->InitDouble("Resonace", 50.0, 0.0, 100.0, 1.0, "%");
  GetParam(kParamWaveForm)->InitDouble("Waveform", 0.0, 0.0, 1.0, 0.1, "|\\|\\ |_|_%");
  GetParam(kParamTuning)->InitDouble("Tuning", 440.0, 400.0, 480.0, 1.0, "%");
  GetParam(kParamEnvMode)->InitDouble("Env mode", 25.0, 0.0, 100.0, 1.0, "%");
  GetParam(kParamDecay)->InitDouble("Decay", 400.0, 200.0, 2000.0, 1.0, "ms");
  GetParam(kParamAccent)->InitDouble("Accent", 50.0, 0.0, 100.0, 1.0, "%");
  GetParam(kParamVolume)->InitDouble("Volume", -6.0, -100.0, 0.0, 0.1, "dB");
  GetParam(kParamTempo)->InitDouble("Tempo", 120.0, 0.0, 300.0, 1.0, "bpm");
  GetParam(kParamDrive)->InitDouble("Drive", 36.9, 0.0, 50.0, 1.0, "bpm");

  GetParam(kParamHostSync)->InitBool("Host Sync", false);
  GetParam(kParamKeySync)->InitBool("Key Sync", false);
  GetParam(kParamInternalSync)->InitBool("Internal Sync", true);
  GetParam(kParamMidiPlay)->InitBool("Midi Play", false);

  for (int i = kBtnSeq0; i < kBtnSeq0 + kNumberOfSeqButtons; ++i)
  {
      char buf[256];
      sprintf(buf, "%s %d", "Sequenser button", i - kBtnSeq0);
      GetParam(i)->InitBool(buf, false);
  }


#if IPLUG_EDITOR // http://bit.ly/2S64BDd
  mMakeGraphicsFunc = [&]() {
    return MakeGraphics(*this, PLUG_WIDTH, PLUG_HEIGHT, PLUG_FPS);
  };
  
  mLayoutFunc = [&](IGraphics* pGraphics) {
    const IRECT bounds = pGraphics->GetBounds();
    const IRECT innerBounds = bounds.GetPadded(-10.f);
    const IRECT sliderBounds = innerBounds.GetFromLeft(150).GetMidVPadded(100);
    const IRECT versionBounds = innerBounds.GetFromTRHC(300, 20);
    const IRECT titleBounds = innerBounds.GetCentredInside(200, 50);

    if (pGraphics->NControls()) {
      pGraphics->GetBackgroundControl()->SetTargetAndDrawRECTs(bounds);
      return;
    }

    pGraphics->SetLayoutOnResize(true);
    pGraphics->AttachCornerResizer(EUIResizerMode::Size, true);
    pGraphics->LoadFont("Roboto-Regular", ROBOTO_FN);
//    pGraphics->AttachPanelBackground(COLOR_RED);
    pGraphics->LoadBitmap(BACKGROUND_FN, 1, true);
    pGraphics->AttachBackground(BACKGROUND_FN);

    const IBitmap knobRotateBitmap = pGraphics->LoadBitmap(PNG6062_FN, 127);
    const IBitmap knobTempoBitmap = pGraphics->LoadBitmap(PNGFX1_FN, 127);
    pGraphics->AttachControl(new IBKnobControl(210, 30, knobTempoBitmap, kParamWaveForm));
    pGraphics->AttachControl(new IBKnobControl(310, 30, knobTempoBitmap, kParamTuning));
    pGraphics->AttachControl(new IBKnobControl(410, 30, knobTempoBitmap, kParamCutOff));
    pGraphics->AttachControl(new IBKnobControl(510, 30, knobTempoBitmap, kParamResonance));
    pGraphics->AttachControl(new IBKnobControl(610, 30, knobTempoBitmap, kParamEnvMode));
    pGraphics->AttachControl(new IBKnobControl(710, 30, knobTempoBitmap, kParamDecay));
    pGraphics->AttachControl(new IBKnobControl(810, 30, knobTempoBitmap, kParamAccent));

    pGraphics->AttachControl(new IBKnobControl(310, 130, knobTempoBitmap, kParamTempo));
    pGraphics->AttachControl(new IBKnobControl(510, 130, knobTempoBitmap, kParamDrive));
    pGraphics->AttachControl(new IBKnobControl(710, 130, knobTempoBitmap, kParamVolume));

    // Led buttons
    const IBitmap ledBtnBitmap = pGraphics->LoadBitmap(PNGBTNLED_FN, 2, true);
    for (int i = 0; i < 16; i++)
    {
        pGraphics->AttachControl(new SeqLedBtnControl(130.f + i * (ledBtnBitmap.W() / 2 + 6), 310.f, ledBtnBitmap, kLedBtn0 + i, open303Core), kCtrlTagLedSeq0 + i, "Sequencer");
    }

    // Sequencer tones buttons
    const IBitmap btnSeqBitmap = pGraphics->LoadBitmap(PNGBTNSEQ_FN, 2, true);
    for (int i = 0; i < 16; i++)
    {
        for (int j = 0; j < 12; j++)
        {
            pGraphics->AttachControl(new SeqNoteBtnControl(140.f + i * (btnSeqBitmap.W() / 2 + 26), 380.f + j * (btnSeqBitmap.H() + 1),
                btnSeqBitmap, kBtnSeq0 + 16 * j + i, open303Core),
                kCtrlTagBtnSeq0 + 16 * j + i, "Sequencer");
        }
    }

    // Properties buttons
    for (int i = 0; i < 16; i++)
    {
        for (int j = 0; j < 5; j++)
        {
            pGraphics->AttachControl(new SeqNoteBtnControl(140.f + i * (btnSeqBitmap.W() / 2 + 26), 660.f + j * (btnSeqBitmap.H() + 1),
                btnSeqBitmap, kBtnProp0 + 16 * j + i, open303Core),
                kCtrlTagBtnProp0 + 16 * j + i, "Sequencer");
        }
    }

    const IBitmap btnHostSyncBitmap = pGraphics->LoadBitmap(PNGHOSTSYNC_FN, 2, true);
    pGraphics->AttachControl(new IBSwitchControl(10, 800, btnHostSyncBitmap, kParamHostSync));
    const IBitmap btnKeySyncBitmap = pGraphics->LoadBitmap(PNGKEYSYNC_FN, 2, true);
    pGraphics->AttachControl(new IBSwitchControl(110, 800, btnKeySyncBitmap, kParamKeySync));
    const IBitmap btnInternalSyncBitmap = pGraphics->LoadBitmap(PNGINTERNALSYNC_FN, 2, true);
    pGraphics->AttachControl(new IBSwitchControl(220, 800, btnInternalSyncBitmap, kParamInternalSync));
    const IBitmap btnMidiPlayBitmap = pGraphics->LoadBitmap(PNGMIDIPLAY_FN, 2, true);
    pGraphics->AttachControl(new IBSwitchControl(330, 800, btnMidiPlayBitmap, kParamMidiPlay));

    //pGraphics->AttachControl(new ITextControl(titleBounds, "BassMatrix", IText(30)), kCtrlTagTitle);
    //WDL_String buildInfoStr;
    //GetBuildInfoStr(buildInfoStr, __DATE__, __TIME__);
    //pGraphics->AttachControl(new ITextControl(versionBounds, buildInfoStr.Get(), DEFAULT_TEXT.WithAlign(EAlign::Far)), kCtrlTagVersionNumber);
  };
#endif
}

#if IPLUG_EDITOR
void BassMatrix::OnParentWindowResize(int width, int height)
{
  if(GetUI())
    GetUI()->Resize(width, height, 1.f, false);
}
#endif

#if IPLUG_DSP
void BassMatrix::ProcessBlock(sample** inputs, sample** outputs, int nFrames)
{ 
  const int nChans = NOutChansConnected();
  const double gain = GetParam(kParamGain)->Value() / 100.;
  
  for (int s = 0; s < nFrames; s++) {
    for (int c = 0; c < nChans; c++) {
      outputs[c][s] = inputs[c][s] * gain;
    }
  }
}
#endif
