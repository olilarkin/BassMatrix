#include "BassMatrix.h"
#include "IPlug_include_in_plug_src.h"
#include "o303Controls.h"
#include "open303/Source/DSPCode/rosic_Open303.h"

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
    sprintf(buf, "%s %d", "Sequencer button", i - kBtnSeq0);

    GetParam(i)->InitBool(buf, false);
    if ((i - kBtnSeq0) / 16 == 5)
    {
      GetParam(i)->InitBool(buf, true);
    }

    if ((i - kBtnSeq0) / 16 == 16) // Turn on all the gate buttons
    {
      GetParam(i)->InitBool(buf, true);
    }

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
    const IBitmap knobLittleBitmap = pGraphics->LoadBitmap(PNGFX1LITTLE_FN, 127);
    const IBitmap knobBigBitmap = pGraphics->LoadBitmap(PNGFX1BIG_FN, 127);
    pGraphics->AttachControl(new IBKnobControl(210, 30, knobLittleBitmap, kParamWaveForm));
    pGraphics->AttachControl(new IBKnobControl(310, 30, knobLittleBitmap, kParamTuning));
    pGraphics->AttachControl(new IBKnobControl(410, 30, knobLittleBitmap, kParamCutOff));
    pGraphics->AttachControl(new IBKnobControl(510, 30, knobLittleBitmap, kParamResonance));
    pGraphics->AttachControl(new IBKnobControl(610, 30, knobLittleBitmap, kParamEnvMode));
    pGraphics->AttachControl(new IBKnobControl(710, 30, knobLittleBitmap, kParamDecay));
    pGraphics->AttachControl(new IBKnobControl(810, 30, knobLittleBitmap, kParamAccent));

    pGraphics->AttachControl(new IBKnobControl(210, 130, knobBigBitmap, kParamTempo));
//    pGraphics->AttachControl(new IBKnobControl(510, 130, knobBigBitmap, kParamDrive));
    pGraphics->AttachControl(new IBKnobControl(810 - 75, 130, knobBigBitmap, kParamVolume));

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
    pGraphics->AttachControl(new IBSwitchControl(140, 800, btnHostSyncBitmap, kParamHostSync));
    const IBitmap btnKeySyncBitmap = pGraphics->LoadBitmap(PNGKEYSYNC_FN, 2, true);
    pGraphics->AttachControl(new IBSwitchControl(250, 800, btnKeySyncBitmap, kParamKeySync));
    const IBitmap btnInternalSyncBitmap = pGraphics->LoadBitmap(PNGINTERNALSYNC_FN, 2, true);
    pGraphics->AttachControl(new IBSwitchControl(360, 800, btnInternalSyncBitmap, kParamInternalSync));
    const IBitmap btnMidiPlayBitmap = pGraphics->LoadBitmap(PNGMIDIPLAY_FN, 2, true);
    pGraphics->AttachControl(new IBSwitchControl(470, 800, btnMidiPlayBitmap, kParamMidiPlay));

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
void BassMatrix::ProcessBlock(PLUG_SAMPLE_DST** inputs, PLUG_SAMPLE_DST** outputs, int nFrames)
{
  // Channel declaration.
  PLUG_SAMPLE_DST* out01 = outputs[0];  PLUG_SAMPLE_DST* out02 = outputs[1];

  // No sample accurate leds, because they will not be accurate anyway.
  mLedSeqSender.PushData({ kCtrlTagLedSeq0, {open303Core.sequencer.getStep()} });

  if (open303Core.sequencer.getSequencerMode() == rosic::AcidSequencer::HOST_SYNC)
  {
    //static bool firstTime = true;
    //if (firstTime)
    //{
    //  firstTime = false;
    //  // No sample accurate sequencer, because it will not be accurate anyway
    //  std::array<bool, kNumberOfSeqButtons> seq{ false, true, false, true };
    //  mSequencerSender.PushData({ kCtrlTagBtnSeq0, {seq} });
    //}

    open303Core.sequencer.setTempo(GetTempo());
    if (!GetTransportIsRunning())
    {
      *out01++ = *out02++ = 0.0;
      return; // Silence
    }
  }

  if ((open303Core.sequencer.getSequencerMode() == rosic::AcidSequencer::RUN ||
    open303Core.sequencer.getSequencerMode() == rosic::AcidSequencer::HOST_SYNC) &&
    !open303Core.sequencer.isRunning())
  {
    open303Core.noteOn(36, 64, 0.0);
  }

  for (int offset = 0; offset < nFrames; ++offset)
  {
    if (open303Core.sequencer.getSequencerMode() == rosic::AcidSequencer::HOST_SYNC)
    {
      if (GetSamplePos() < 0.0) // At least Cubase can give a negative sample pos in the beginning.
      {
        *out01++ = *out02++ = 0.0;
        break; // Next frame
      }
    }

    //if (open303Core.sequencer.getSequencerMode() == rosic::AcidSequencer::HOST_SYNC &&
    //    GetSamplePos() + offset != mLastSamplePos + 1) // Transport has changed
    //{
    //  double maxSamplePos = GetSamplesPerBeat() * 4.0;
    //  int currentSampleInSequence = static_cast<int>(GetSamplePos()) % static_cast<int>(maxSamplePos);
    //  double samplesPerStep = maxSamplePos / 16.0;
    //  int currentStepInSequence = (int)((double)currentSampleInSequence / samplesPerStep);
    //  open303Core.sequencer.setStep(currentStepInSequence, 0);
    //}

    while (!mMidiQueue.Empty())
    {
      IMidiMsg msg = mMidiQueue.Peek();
      if (msg.mOffset > offset) break;

      if (msg.StatusMsg() == IMidiMsg::kNoteOn)
      {
        open303Core.noteOn(msg.NoteNumber(), 64, 0.0);
      }
      else if (msg.StatusMsg() == IMidiMsg::kNoteOff)
      {
        open303Core.noteOn(msg.NoteNumber(), 0, 0.0);
      }

      mMidiQueue.Remove();
    }

//    mLastSamplePos = GetSamplePos();

    *out01++ = *out02++ = open303Core.getSample();
  }
  mMidiQueue.Flush(nFrames);
}

#ifdef WEB_API
void BassMatrix::OnIdle()
{
  mLedSeqSender.TransmitData(*this);
}
#endif

void BassMatrix::OnReset()
{
  open303Core.setSampleRate(GetSampleRate());

  open303Core.filter.setMode(rosic::TeeBeeFilter::TB_303); // Should be LP_12
  open303Core.setAmpSustain(-60.0);
  open303Core.setTanhShaperDrive(36.9);
  open303Core.setTanhShaperOffset(4.37);
  open303Core.setPreFilterHighpass(44.5);
  open303Core.setFeedbackHighpass(150.0);
  open303Core.setPostFilterHighpass(24.0);
  open303Core.setSquarePhaseShift(189.0);

#ifndef OLAS_WEB_PLUGIN
  rosic::AcidPattern* p = open303Core.sequencer.getPattern(0);
  srand(static_cast<unsigned int>(time(0)));
  p->randomize();

  open303Core.setTuning(440.0);
  open303Core.setCutoff(1000.0);
  open303Core.setResonance(50.0);
  open303Core.setEnvMod(0.25);
  open303Core.setDecay(400.0);
  open303Core.setAccent(0.5);
  open303Core.setVolume(-6.0);
  open303Core.setWaveform(0.0); // Default  open303Core.setWaveform(0.85);

  open303Core.sequencer.setMode(rosic::AcidSequencer::RUN);

#endif
}

void BassMatrix::ProcessMidiMsg(const IMidiMsg& msg)
{
  TRACE;
  mMidiQueue.Add(msg); // Take care of MIDI events in ProcessBlock()
}

#ifdef DWEB_API
void BassMatrix::OnParamChange(int paramIdx)
{
  double value = GetParam(paramIdx)->Value();

  // Note buttons
  if (paramIdx >= kBtnSeq0 && paramIdx < kBtnSeq0 + kNumberOfSeqButtons - kNumberOfPropButtons)
  {
    int seqNr = paramIdx - kBtnSeq0;
    rosic::AcidPattern* p = open303Core.sequencer.getPattern(open303Core.sequencer.getActivePattern());
    if (value == 1.0)
    {
      p->setKey(seqNr % 16, 11 - seqNr / 16); // Take care of the key notes
    }
    return;
  }

  // Note properties buttons
  if (paramIdx >= kBtnProp0 && paramIdx < kBtnProp0 + kNumberOfPropButtons)
  {
    int seqNr = (paramIdx - kBtnProp0) % 16;
    int rowNr = (paramIdx - kBtnProp0) / 16;
    rosic::AcidPattern* p = open303Core.sequencer.getPattern(open303Core.sequencer.getActivePattern());
    if (rowNr == 0)
    {
      p->setOctave(seqNr, value == 1.0 ? 1 : 0);
    }
    if (rowNr == 1)
    {
      p->setOctave(seqNr, value == 1.0 ? -1 : 0);
    }
    if (rowNr == 2)
    {
      p->setAccent(seqNr, value == 1.0 ? true : false);
    }
    if (rowNr == 3)
    {
      p->setSlide(seqNr, value == 1.0 ? true : false);
    }
    if (rowNr == 4)
    {
      p->setGate(seqNr, value == 1.0 ? true : false);
    }
    return;
  }

  switch (paramIdx) {
  case kParamResonance:
    open303Core.setResonance(value);
    break;
  case kParamCutOff:
    open303Core.setCutoff(value);
    break;
  case kParamWaveForm:
    open303Core.setWaveform(value);
    break;
  case kParamTuning:
    open303Core.setTuning(value);
    break;
  case kParamEnvMode:
    open303Core.setEnvMod(value);
    break;
  case kParamDecay:
    open303Core.setDecay(value);
    break;
  case kParamAccent:
    open303Core.setAccent(value);
    break;
  case kParamVolume:
    open303Core.setVolume(value);
    break;
  case kParamTempo:
    open303Core.sequencer.setTempo(value);
    break;
  case kParamDrive:
    open303Core.setTanhShaperDrive(value);
    break;
  case kParamHostSync:
    if (value == 1.0)
    {
      open303Core.sequencer.setMode(rosic::AcidSequencer::HOST_SYNC);
    }
    //GetControlWithTag(kParamInternalSync)->SetValue(false);
    //GetControlWithTag(kParamKeySync)->SetValue(false);
    //GetControlWithTag(kParamMidiPlay)->SetValue(false);
    break;
  case kParamInternalSync:
    if (value == 1.0)
    {
      open303Core.sequencer.setMode(rosic::AcidSequencer::RUN);
    }
    //GetControlWithTag(kParamHostSync)->SetValue(false);
    //GetControlWithTag(kParamKeySync)->SetValue(false);
    //GetControlWithTag(kParamMidiPlay)->SetValue(false);
    break;
  case kParamKeySync:
    if (value == 1.0)
    {
      open303Core.sequencer.setMode(rosic::AcidSequencer::KEY_SYNC);
    }
    //GetControlWithTag(kParamHostSync)->SetValue(false);
    //GetControlWithTag(kParamInternalSync)->SetValue(false);
    //GetControlWithTag(kParamMidiPlay)->SetValue(false);
    break;
  case kParamMidiPlay:
    if (value == 1.0)
    {
      open303Core.sequencer.setMode(rosic::AcidSequencer::OFF);
    }
    //GetControlWithTag(kParamHostSync)->SetValue(false);
    //GetControlWithTag(kParamInternalSync)->SetValue(false);
    //GetControlWithTag(kParamKeySync)->SetValue(false);
    break;

  default:
    break;
  }
}

bool BassMatrix::OnMessage(int msgTag, int ctrlTag, int dataSize, const void* pData)
{
  return false;
}
#endif // WEB_API


#endif
