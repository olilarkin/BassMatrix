#pragma once

#if IPLUG_EDITOR
#include "IControls.h"
#endif

#include "BassMatrix.h"
#include "open303/Source/DSPCode/rosic_Open303.h"

// A button control that can take a message from the DSP
class SeqLedBtnControl : public IBSwitchControl
{
public:
  SeqLedBtnControl(float x, float y, const IBitmap& bitmap, int paramIdx, rosic::Open303& in303);
  void OnMsgFromDelegate(int msgTag, int dataSize, const void* pData) override;
  void OnMouseDown(float x, float y, const IMouseMod& mod) override;

private:
  // the embedded core dsp object:
  rosic::Open303& open303Core;
};

// A button control that can take a message from the DSP
class SeqNoteBtnControl : public IBSwitchControl
{
public:
  SeqNoteBtnControl(float x, float y, const IBitmap& bitmap, int paramIdx);
  void OnMsgFromDelegate(int msgTag, int dataSize, const void* pData) override;
  void OnMouseDown(float x, float y, const IMouseMod& mod) override;
protected:
  int mParamIdx;
};
