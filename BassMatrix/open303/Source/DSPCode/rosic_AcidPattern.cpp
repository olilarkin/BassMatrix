#include "rosic_AcidPattern.h"
using namespace rosic;

AcidPattern::AcidPattern()
{
  numSteps   = 16;
  stepLength = 0.5;
}

//-------------------------------------------------------------------------------------------------
// setup:

void AcidPattern::clear()
{
  for(int i=0; i<maxNumSteps; i++)
  {
    notes[i].key    = 0;
    notes[i].octave = 0;
    notes[i].accent = false;
    notes[i].slide  = false;
    notes[i].gate   = false;
  }
}

void AcidPattern::randomize()
{
  for(int i=0; i<maxNumSteps; i++)
  {
    notes[i].key = roundToInt(randomUniform(0, 11, rand()));
    notes[i].octave = roundToInt(randomUniform(-1, 1, rand()));
    notes[i].accent = roundToInt(randomUniform(0, 1, rand())) == 1;
    notes[i].slide = roundToInt(randomUniform(0, 5, rand())) == 4;
    notes[i].gate = roundToInt(randomUniform(0, 11, rand())) != 11;
    //notes[i].key = 0;
    //notes[i].octave = 0;
    //notes[i].accent = false;
    //notes[i].slide = false;
    //notes[i].gate = true;
  }
}

void AcidPattern::circularShift(int numStepsToShift)
{
  rosic::circularShift(notes, maxNumSteps, numStepsToShift);
}

//-------------------------------------------------------------------------------------------------
// inquiry:

bool AcidPattern::isEmpty() const
{
  for(int i=0; i<maxNumSteps; i++)
  {
    if( notes[i].gate == true )
      return false;
  }
  return true;
}
