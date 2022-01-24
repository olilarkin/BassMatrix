#if IPLUG_EDITOR
#include "IControls.h"
#endif

#include "BassMatrix.h"
#include "open303/Source/DSPCode/rosic_Open303.h"

// A button control that can take a message from the DSP
class SeqLedBtnControl : public IBSwitchControl
{

public:

  SeqLedBtnControl(float x, float y, const IBitmap& bitmap, int paramIdx, rosic::Open303& in303) :
    IBSwitchControl(x, y, bitmap, paramIdx), open303Core(in303)
  {
  }

  void OnMsgFromDelegate(int msgTag, int dataSize, const void* pData) override
  {
    if (!IsDisabled() && msgTag == ISender<>::kUpdateMessage)
    {
      IByteStream stream(pData, dataSize);

      int pos = 0;
      ISenderData<1, int> d;
      pos = stream.Get(&d, pos);

      // Turn off all leds
      for (int i = 0; i < 16; i++)
      {
        IControl* pControlOff = GetUI()->GetControlWithTag(kCtrlTagLedSeq0 + i);
        double before = pControlOff->GetValue();
        pControlOff->SetValue(0.0);
        if (before != pControlOff->GetValue())
        {
          pControlOff->SetDirty(true);
        }
      }

      int step = d.vals[0];
      if (open303Core.sequencer.getSequencerMode() == rosic::AcidSequencer::RUN)
      {
        if(step == 0) { step = 15; }
        else { step = (step - 1); }
      }

      assert(step >= 0 && step <= 15);

      IControl* pControlOn = GetUI()->GetControlWithTag(kCtrlTagLedSeq0 + step);
      double before = pControlOn->GetValue();
      pControlOn->SetValue(1.0);
      if (before != pControlOn->GetValue())
      {
        pControlOn->SetDirty(true);
      }

      SetDirty(false);
    }
  }
  void OnMouseDown(float x, float y, const IMouseMod& mod) override
  {
    return;
  }

  // the embedded core dsp object:
  rosic::Open303& open303Core;
};

// A button control that can take a message from the DSP
class SeqNoteBtnControl : public IBSwitchControl
{

public:

  SeqNoteBtnControl(float x, float y, const IBitmap& bitmap, int paramIdx, rosic::Open303& in303) :
    IBSwitchControl(x, y, bitmap, paramIdx), open303Core(in303)
  {
  }

  void OnMsgFromDelegate(int msgTag, int dataSize, const void* pData) override
  {
    if (!IsDisabled() && msgTag == ISender<>::kUpdateMessage)
    {
      IByteStream stream(pData, dataSize);
      int pos = 0;
      ISenderData<1, std::array<bool, kNumberOfSeqButtons>> d;
      pos = stream.Get(&d, pos);
      std::array<bool, kNumberOfSeqButtons> sequencer = d.vals[0];
   
      for (int i = 0; i < kNumberOfSeqButtons; i++)
      {
        IControl* pControlBtn = GetUI()->GetControlWithTag(kCtrlTagBtnSeq0 + i);
        double before = pControlBtn->GetValue();
        pControlBtn->SetValue(sequencer[i] ? 1.0 : 0.0);
        if (before != pControlBtn->GetValue())
        {
          pControlBtn->SetDirty(true);
        }
      }
      SetDirty(false);
    }
  }
private:
  // the embedded core dsp object:
  rosic::Open303& open303Core;

};
