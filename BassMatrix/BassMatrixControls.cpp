#include "BassMatrixControls.h"

SeqLedBtnControl::SeqLedBtnControl(float x, float y, const IBitmap& bitmap, int paramIdx, rosic::Open303& in303) :
  IBSwitchControl(x, y, bitmap, paramIdx), open303Core(in303)
{
}

void SeqLedBtnControl::OnMsgFromDelegate(int msgTag, int dataSize, const void* pData)
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
      // A very special correction here. I have not figured out yet why the
      // sequencer in RUN mode behaves different than other moded.
      if (step == 0) { step = 15; }
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
void SeqLedBtnControl::OnMouseDown(float x, float y, const IMouseMod& mod)
{
  return;
}


// A button control that can take a message from the DSP
SeqNoteBtnControl::SeqNoteBtnControl(float x, float y, const IBitmap& bitmap, int paramIdx) :
  IBSwitchControl(x, y, bitmap, paramIdx), mParamIdx(paramIdx)
{
}

void SeqNoteBtnControl::OnMsgFromDelegate(int msgTag, int dataSize, const void* pData)
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

void SeqNoteBtnControl::OnMouseDown(float x, float y, const IMouseMod& mod)
{
  if (mParamIdx - kBtnSeq0 < kNumberOfSeqButtons - kNumberOfPropButtons)
  {
    // For the notes. Turn off all note buttons on the same column and then turn on the button just pressed.
    for (int row = 0; row < kNumberOfNoteBtns; ++row)
    {
      int col = (mParamIdx - kBtnSeq0) % 16;
      IControl* pControlBtn = GetUI()->GetControlWithTag(kCtrlTagBtnSeq0 + col + 16 * row);
      double before = pControlBtn->GetValue();
      pControlBtn->SetValue(0.0);
      if (before != 0.0)
      {
        pControlBtn->SetDirty(true);
      }
      if (kBtnSeq0 + col + row * 16 == mParamIdx)
      {
        pControlBtn->SetValue(1.0);
        if (before != 1.0)
        {
          pControlBtn->SetDirty(true);
        }
      }
    }
  }
  else
  {
    int col = (mParamIdx - kBtnSeq0) % 16;
    int row = (mParamIdx - kBtnSeq0) / 16;
    IControl* pControlBtn = GetUI()->GetControlWithTag(kCtrlTagBtnProp0 + (row - kNumberOfNoteBtns) * 16 + col);
    if (row == kNumberOfNoteBtns || row == kNumberOfNoteBtns + 1) // Up or down
    { // Up is pressed.
      IControl* pControlBtnUp;
      IControl* pControlBtnDown;

      if (row == kNumberOfNoteBtns)
      {
        pControlBtnUp = pControlBtn;
        pControlBtnDown = GetUI()->GetControlWithTag(kCtrlTagBtnProp0 + col + 16);
      }
      else
      {
        pControlBtnUp = GetUI()->GetControlWithTag(kCtrlTagBtnProp0 + col);
        pControlBtnDown = pControlBtn;
      }

      double upBefore = pControlBtnUp->GetValue();
      double downBefore = pControlBtnDown->GetValue();

      if (row == kNumberOfNoteBtns) // Up
      {
        if (1.0 == pControlBtnUp->GetValue())
        { // We wants neither up or down
          pControlBtnUp->SetValue(0.0);
          pControlBtnDown->SetValue(0.0);
        }
        else if (0.0 == pControlBtnUp->GetValue())
        {
          pControlBtnUp->SetValue(1.0);
          pControlBtnDown->SetValue(0.0);
        }
      }
      else // Down
      {
        if (1.0 == pControlBtnDown->GetValue())
        { // We wants neither up or down
          pControlBtnUp->SetValue(0.0);
          pControlBtnDown->SetValue(0.0);
        }
        else if (0.0 == pControlBtnDown->GetValue())
        {
          pControlBtnUp->SetValue(0.0);
          pControlBtnDown->SetValue(1.0);
        }
      }

      if (upBefore != pControlBtnUp->GetValue())
      {
        pControlBtnUp->SetDirty(true);
      }
      if (downBefore != pControlBtnDown->GetValue())
      {
        pControlBtnDown->SetDirty(true);
      }
    }
    else // Accent, glide or gate
    {
      pControlBtn->SetValue(pControlBtn->GetValue() == 1.0 ? 0.0 : 1.0);
      pControlBtn->SetDirty(true);
    }
  }
}
