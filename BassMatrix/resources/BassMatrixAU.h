
#include <TargetConditionals.h>
#if TARGET_OS_IOS == 1
#import <UIKit/UIKit.h>
#else
#import <Cocoa/Cocoa.h>
#endif

#define IPLUG_AUVIEWCONTROLLER IPlugAUViewController_vBassMatrix
#define IPLUG_AUAUDIOUNIT IPlugAUAudioUnit_vBassMatrix
#import <BassMatrixAU/IPlugAUViewController.h>
#import <BassMatrixAU/IPlugAUAudioUnit.h>

//! Project version number for BassMatrixAU.
FOUNDATION_EXPORT double BassMatrixAUVersionNumber;

//! Project version string for BassMatrixAU.
FOUNDATION_EXPORT const unsigned char BassMatrixAUVersionString[];

@class IPlugAUViewController_vBassMatrix;
