AudioWorkletGlobalScope.WAM = AudioWorkletGlobalScope.WAM || {}; AudioWorkletGlobalScope.WAM.BassMatrix = { ENVIRONMENT: 'WEB' };


// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof AudioWorkletGlobalScope.WAM.BassMatrix !== 'undefined' ? AudioWorkletGlobalScope.WAM.BassMatrix : {};

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = function(status, toThrow) {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === 'object';
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

var nodeFS;
var nodePath;

if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }

// include: node_shell_read.js


read_ = function shell_read(filename, binary) {
  var ret = tryParseAsDataURI(filename);
  if (ret) {
    return binary ? ret : ret.toString();
  }
  if (!nodeFS) nodeFS = require('fs');
  if (!nodePath) nodePath = require('path');
  filename = nodePath['normalize'](filename);
  return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
};

readBinary = function readBinary(filename) {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
};

// end include: node_shell_read.js
  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }

  arguments_ = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  process['on']('unhandledRejection', abort);

  quit_ = function(status) {
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };

} else
if (ENVIRONMENT_IS_SHELL) {

  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      var data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  readBinary = function readBinary(f) {
    var data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit === 'function') {
    quit_ = function(status) {
      quit(status);
    };
  }

  if (typeof print !== 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console === 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr !== 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document !== 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {

// include: web_or_worker_shell_read.js


  read_ = function(url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  };

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = function(url) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  readAsync = function(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = function(title) { document.title = title };
} else
{
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];

if (Module['thisProgram']) thisProgram = Module['thisProgram'];

if (Module['quit']) quit_ = Module['quit'];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message




var STACK_ALIGN = 16;

function alignMemory(size, factor) {
  if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
  return Math.ceil(size / factor) * factor;
}

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length-1] === '*') {
        return 4; // A pointer
      } else if (type[0] === 'i') {
        var bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

// include: runtime_functions.js


// Wraps a JS function as a wasm function with a given signature.
function convertJsFunctionToWasm(func, sig) {

  // If the type reflection proposal is available, use the new
  // "WebAssembly.Function" constructor.
  // Otherwise, construct a minimal wasm module importing the JS function and
  // re-exporting it.
  if (typeof WebAssembly.Function === "function") {
    var typeNames = {
      'i': 'i32',
      'j': 'i64',
      'f': 'f32',
      'd': 'f64'
    };
    var type = {
      parameters: [],
      results: sig[0] == 'v' ? [] : [typeNames[sig[0]]]
    };
    for (var i = 1; i < sig.length; ++i) {
      type.parameters.push(typeNames[sig[i]]);
    }
    return new WebAssembly.Function(type, func);
  }

  // The module is static, with the exception of the type section, which is
  // generated based on the signature passed in.
  var typeSection = [
    0x01, // id: section,
    0x00, // length: 0 (placeholder)
    0x01, // count: 1
    0x60, // form: func
  ];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
    'i': 0x7f, // i32
    'j': 0x7e, // i64
    'f': 0x7d, // f32
    'd': 0x7c, // f64
  };

  // Parameters, length + signatures
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }

  // Return values, length + signatures
  // With no multi-return in MVP, either 0 (void) or 1 (anything else)
  if (sigRet == 'v') {
    typeSection.push(0x00);
  } else {
    typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
  }

  // Write the overall length of the type section back into the section header
  // (excepting the 2 bytes for the section id and length)
  typeSection[1] = typeSection.length - 2;

  // Rest of the module is static
  var bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
    0x01, 0x00, 0x00, 0x00, // version: 1
  ].concat(typeSection, [
    0x02, 0x07, // import section
      // (import "e" "f" (func 0 (type 0)))
      0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
    0x07, 0x05, // export section
      // (export "f" (func 0 (type 0)))
      0x01, 0x01, 0x66, 0x00, 0x00,
  ]));

   // We can compile this wasm module synchronously because it is very small.
  // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    'e': {
      'f': func
    }
  });
  var wrappedFunc = instance.exports['f'];
  return wrappedFunc;
}

var freeTableIndexes = [];

// Weak map of functions in the table to their indexes, created on first use.
var functionsInTableMap;

function getEmptyTableSlot() {
  // Reuse a free index if there is one, otherwise grow.
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  // Grow the table
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
  }
  return wasmTable.length - 1;
}

// Add a wasm function to the table.
function addFunctionWasm(func, sig) {
  // Check if the function is already in the table, to ensure each function
  // gets a unique index. First, create the map if this is the first use.
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    for (var i = 0; i < wasmTable.length; i++) {
      var item = wasmTable.get(i);
      // Ignore null values.
      if (item) {
        functionsInTableMap.set(item, i);
      }
    }
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }

  // It's not in the table, add it now.

  var ret = getEmptyTableSlot();

  // Set the new value.
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    wasmTable.set(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    var wrapped = convertJsFunctionToWasm(func, sig);
    wasmTable.set(ret, wrapped);
  }

  functionsInTableMap.set(func, ret);

  return ret;
}

function removeFunction(index) {
  functionsInTableMap.delete(wasmTable.get(index));
  freeTableIndexes.push(index);
}

// 'sig' parameter is required for the llvm backend but only when func is not
// already a WebAssembly function.
function addFunction(func, sig) {

  return addFunctionWasm(func, sig);
}

// end include: runtime_functions.js
// include: runtime_debug.js


// end include: runtime_debug.js
function makeBigInt(low, high, unsigned) {
  return unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0));
}

var tempRet0 = 0;

var setTempRet0 = function(value) {
  tempRet0 = value;
};

var getTempRet0 = function() {
  return tempRet0;
};



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
var noExitRuntime = Module['noExitRuntime'] || true;

if (typeof WebAssembly !== 'object') {
  abort('no native wasm support detected');
}

// include: runtime_safe_heap.js


// In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

/** @param {number} ptr
    @param {number} value
    @param {string} type
    @param {number|boolean=} noSafe */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch (type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @param {number} ptr
    @param {string} type
    @param {number|boolean=} noSafe */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch (type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}

// end include: runtime_safe_heap.js
// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}

// C calling interface.
/** @param {string|null=} returnType
    @param {Array=} argTypes
    @param {Arguments|Array=} args
    @param {Object=} opts */
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    'string': function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    'array': function(arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };

  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);

  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}

/** @param {string=} returnType
    @param {Array=} argTypes
    @param {Object=} opts */
function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  // When the function takes numbers and returns a number, we can just return
  // the original function
  var numericArgs = argTypes.every(function(type){ return type === 'number'});
  var numericRet = returnType !== 'string';
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((Uint8Array|Array<number>), number)} */
function allocate(slab, allocator) {
  var ret;

  if (allocator == ALLOC_STACK) {
    ret = stackAlloc(slab.length);
  } else {
    ret = _malloc(slab.length);
  }

  if (slab.subarray || slab.slice) {
    HEAPU8.set(/** @type {!Uint8Array} */(slab), ret);
  } else {
    HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
}

// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(heap.subarray(idx, endPtr));
  } else {
    var str = '';
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = heap[idx++];
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      var u1 = heap[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      var u2 = heap[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) ++len;
    else if (u <= 0x7FF) len += 2;
    else if (u <= 0xFFFF) len += 3;
    else len += 4;
  }
  return len;
}

// end include: runtime_strings.js
// include: runtime_strings_extra.js


// runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAPU8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;

function UTF16ToString(ptr, maxBytesToRead) {
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var str = '';

    // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
    // will always evaluate to true. The loop is then terminated on the first null char.
    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) break;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }

    return str;
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)] = codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr, maxBytesToRead) {
  var i = 0;

  var str = '';
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0) break;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated
    @param {boolean=} dontAddNull */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}

/** @param {boolean=} dontAddNull */
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[((buffer++)>>0)] = str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)] = 0;
}

// end include: runtime_strings_extra.js
// Memory management

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// end include: runtime_stack_check.js
// include: runtime_assertions.js


// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  runtimeInitialized = true;

  
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  runtimeExited = true;
}

function postRun() {

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

/** @param {string|number=} what */
function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  what += '';
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  var e = new WebAssembly.RuntimeError(what);

  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// include: URIUtils.js


function hasPrefix(str, prefix) {
  return String.prototype.startsWith ?
      str.startsWith(prefix) :
      str.indexOf(prefix) === 0;
}

// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  return hasPrefix(filename, dataURIPrefix);
}

var fileURIPrefix = "file://";

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return hasPrefix(filename, fileURIPrefix);
}

// end include: URIUtils.js
var wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAAB7YKAgAAzYAF/AX9gAAF/YAJ/fwF/YAF/AGACf38AYAN/f38Bf2ADf39/AGAEf39/fwBgBX9/f39/AGAEf39/fwF/YAN/f3wAYAZ/f39/f38AYAV/f39/fwF/YAAAYAV/fn5+fgBgBH9/f3wAYAR/f3x/AGACf3wAYAJ/fAF/YAF/AXxgA398fwF8YAR/fn5/AGACf38BfGACf3wBfGAHf39/f39/fwBgAn99AGADf3x/AGAGf3x/f39/AX9gAn5/AX9gBH5+fn4Bf2ACfH8BfGADf39+AGADf399AGAMf398fHx8f39/f39/AGACf34AYAN/fn4AYAN/fX8AYAZ/f39/f38Bf2AHf39/f39/fwF/YBl/f39/f39/f39/f39/f39/f39/f39/f39/AX9gA39/fAF/YAN+f38Bf2ACfn4Bf2ABfAF+YAJ/fwF+YAR/f39+AX5gAX0BfWACfn4BfWABfAF8YAJ+fgF8YAN8fHwBfAKwg4CAABEDZW52BHRpbWUAAANlbnYIc3RyZnRpbWUACQNlbnYMX19jeGFfYXRleGl0AAUDZW52GGVtc2NyaXB0ZW5fYXNtX2NvbnN0X2ludAAFA2VudhVfZW1iaW5kX3JlZ2lzdGVyX3ZvaWQABANlbnYVX2VtYmluZF9yZWdpc3Rlcl9ib29sAAgDZW52G19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZwAEA2VudhxfZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nAAYDZW52Fl9lbWJpbmRfcmVnaXN0ZXJfZW12YWwABANlbnYYX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyAAgDZW52Fl9lbWJpbmRfcmVnaXN0ZXJfZmxvYXQABgNlbnYcX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldwAGA2VudgpfX2dtdGltZV9yAAIDZW52DV9fbG9jYWx0aW1lX3IAAgNlbnYFYWJvcnQADQNlbnYWZW1zY3JpcHRlbl9yZXNpemVfaGVhcAAAA2VudhVlbXNjcmlwdGVuX21lbWNweV9iaWcABQOGhoCAAIQGDQUFAAICAgkGBggBBwIFAgIEAgQCBAgCAgAAAAAAAAAAAAAAAAQAAwYAAgAABQAoAgAMAgkABQITLgIWCQAHAAAKAhEXEQMTFxACABcCAgAGAAAAAgAAAgQEBAQICAIDBgMDAwcEBgQEBAwDAgIKCAcEBBAECgoEBAIEAgIFGQMCBQIFAwMAAAMFBgUAAwcEAAQAAwUEBAoEBAACAAAFAgIFFggABRoaMgICAgIFAAACBgIFAgICBQUABAAAABQUABMTABIAAgIDAgASBQAAAgAEAAAFAAQhAAACAgIAAAACBAUAAAAAAgAGBxYDAAIEAAMSEgACAAIEAAQAAAQAAAUAAgAAAAQAAAACBQICAgACAgAAAAAGAAAAAgADAgcCBQUFCQIAAAACAAUAAAwDCQQEBgMAAAEAAAMCAAADAwIGJwcABwAAAwMEBAICAAMEAwQCAgQDBAADBgAFAAIACREGCQYAAAYDDw8HBwgFBQAACQgHBwoKBgYKCBAHAwADAAMACQkDBCAHBgYGDwcIBwgDBAMHBg8HCAoFAgICAgAlBQAAAgUCAAACAhgCBgACAAYGAAAAAAIAAAIABAMHBAIIAAICBQgABAAABAAFAwIGCyQEAgACAAUCAAAEAAAAAAYAAQEAAAANAQEDAwMDAwMDAwMDAwEBAQEBAQMDAwMDAwMDAwMDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ0AAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBDQIFBQICAgICAgAwAQkFBQUAAAUCHgwmBgAHKRwcCAUbBCsAACIADhUjBwsYLC0JAAUCHwUFBQUAAAABAQEBAgAAAAACAB0dDhUBAQ4ZFS8RDg4EDjEEAAMEAAIAAgIAAAADAwMDAAMAAQ0AAAMDAwMDAwUFBQkHBwcHBwgHCAsICAgLCwsAAwICBAAOHioFBQUABQADAAEDAASHgICAAAFwAbUBtQEFh4CAgAABAYACgIACBpWAgIAAA38BQZDFwAILfwBB5DsLfwBBhz8LB9eDgIAAGwZtZW1vcnkCABFfX3dhc21fY2FsbF9jdG9ycwARBGZyZWUAggYGbWFsbG9jAIEGGV9faW5kaXJlY3RfZnVuY3Rpb25fdGFibGUBAAxjcmVhdGVNb2R1bGUAxwIbX1pOM1dBTTlQcm9jZXNzb3I0aW5pdEVqalB2AJQDCHdhbV9pbml0AJUDDXdhbV90ZXJtaW5hdGUAlgMKd2FtX3Jlc2l6ZQCXAwt3YW1fb25wYXJhbQCYAwp3YW1fb25taWRpAJkDC3dhbV9vbnN5c2V4AJoDDXdhbV9vbnByb2Nlc3MAmwMLd2FtX29ucGF0Y2gAnAMOd2FtX29ubWVzc2FnZU4AnQMOd2FtX29ubWVzc2FnZVMAngMOd2FtX29ubWVzc2FnZUEAnwMNX19nZXRUeXBlTmFtZQD3AypfX2VtYmluZF9yZWdpc3Rlcl9uYXRpdmVfYW5kX2J1aWx0aW5fdHlwZXMA+QMQX19lcnJub19sb2NhdGlvbgCHBQtfZ2V0X3R6bmFtZQC2BQ1fZ2V0X2RheWxpZ2h0ALcFDV9nZXRfdGltZXpvbmUAuAUJc3RhY2tTYXZlAJIGDHN0YWNrUmVzdG9yZQCTBgpzdGFja0FsbG9jAJQGCdKCgIAAAQBBAQu0ASo4b3BxcnR1dnd4eXp7fH1+f4ABgQGCAYMBhAFXhQGGAYgBTWlrbYkBiwGNAY4BjwGQAZEBkgGTAZQBlQGWAUeXAZgBmQE5mgGbAZwBnQGeAZ8BoAGhAaIBowFapAGlAaYBpwGoAakBqgHqAf0B/gGAAoECzwHQAfABggLlBaYCrQK/AocBwAJqbG7BAsICqgLEAsoC0ALWAtgCigOLA40DjAPwAtkC2gL0AoQDiAP5AvsC/QKGA9sC3ALdAtMC3gLfAtUC0APgAuEC4gLjAtED5ALSA+UC8wLmAucC6ALpAvcChQOJA/oC/AKDA4cD6gLXAo4DjwOQA88DkQOSA5QDogOjA+sCpAOlA6YDpwOoA6kDqgPBA84D5QPZA9MEiQWbBZwFsQXnBeoF6AXpBe4F6wXwBYAG/QXzBewF/wX8BfQF7QX+BfkF9gUK37eHgACEBgUAEPsEC7kFAU9/IwAhA0EQIQQgAyAEayEFIAUkACAFIAA2AgwgBSACNgIIIAUoAgwhBiABKAIAIQcgASgCBCEIIAYgByAIEJwCGkGACCEJQQghCiAJIApqIQsgCyEMIAYgDDYCAEGwASENIAYgDWohDkEAIQ8gDiAPIA8QExpBwAEhECAGIBBqIREgERAUGkHEASESIAYgEmohE0GABCEUIBMgFBAVGkHcASEVIAYgFWohFkEgIRcgFiAXEBYaQfQBIRggBiAYaiEZQSAhGiAZIBoQFhpBjAIhGyAGIBtqIRxBBCEdIBwgHRAXGkGkAiEeIAYgHmohH0EEISAgHyAgEBcaQbwCISEgBiAhaiEiQQAhIyAiICMgIyAjEBgaIAEoAhwhJCAGICQ2AmQgASgCICElIAYgJTYCaCABKAIYISYgBiAmNgJsQTQhJyAGICdqISggASgCDCEpQYABISogKCApICoQGUHEACErIAYgK2ohLCABKAIQIS1BgAEhLiAsIC0gLhAZQdQAIS8gBiAvaiEwIAEoAhQhMUGAASEyIDAgMSAyEBkgAS0AMCEzQQEhNCAzIDRxITUgBiA1OgCMASABLQBMITZBASE3IDYgN3EhOCAGIDg6AI0BIAEoAjQhOSABKAI4ITogBiA5IDoQGiABKAI8ITsgASgCQCE8IAEoAkQhPSABKAJIIT4gBiA7IDwgPSA+EBsgAS0AKyE/QQEhQCA/IEBxIUEgBiBBOgAwIAUoAgghQiAGIEI2AnhB/AAhQyAGIENqIUQgASgCUCFFQQAhRiBEIEUgRhAZIAEoAgwhRxAcIUggBSBINgIEIAUgRzYCAEGdCiFJQZAKIUpBKiFLIEogSyBJIAUQHUGwASFMIAYgTGohTUGjCiFOQSAhTyBNIE4gTxAZQRAhUCAFIFBqIVEgUSQAIAYPC6IBARF/IwAhA0EQIQQgAyAEayEFIAUkACAFIAA2AgggBSABNgIEIAUgAjYCACAFKAIIIQYgBSAGNgIMQYABIQcgBiAHEB4aIAUoAgQhCEEAIQkgCCEKIAkhCyAKIAtHIQxBASENIAwgDXEhDgJAIA5FDQAgBSgCBCEPIAUoAgAhECAGIA8gEBAZCyAFKAIMIRFBECESIAUgEmohEyATJAAgEQ8LXgELfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBEEAIQUgAyAFNgIIQQghBiADIAZqIQcgByEIIAMhCSAEIAggCRAfGkEQIQogAyAKaiELIAskACAEDwuDAQEOfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQVBgCAhBiAFIAYQIBpBECEHIAUgB2ohCEEAIQkgCCAJECEaQRQhCiAFIApqIQtBACEMIAsgDBAhGiAEKAIIIQ0gBSANECJBECEOIAQgDmohDyAPJAAgBQ8LgwEBDn8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFQYAgIQYgBSAGECMaQRAhByAFIAdqIQhBACEJIAggCRAhGkEUIQogBSAKaiELQQAhDCALIAwQIRogBCgCCCENIAUgDRAkQRAhDiAEIA5qIQ8gDyQAIAUPC4MBAQ5/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBUGAICEGIAUgBhAlGkEQIQcgBSAHaiEIQQAhCSAIIAkQIRpBFCEKIAUgCmohC0EAIQwgCyAMECEaIAQoAgghDSAFIA0QJkEQIQ4gBCAOaiEPIA8kACAFDwvpAQEYfyMAIQRBICEFIAQgBWshBiAGJAAgBiAANgIYIAYgATYCFCAGIAI2AhAgBiADNgIMIAYoAhghByAGIAc2AhwgBigCFCEIIAcgCDYCACAGKAIQIQkgByAJNgIEIAYoAgwhCkEAIQsgCiEMIAshDSAMIA1HIQ5BASEPIA4gD3EhEAJAAkAgEEUNAEEIIREgByARaiESIAYoAgwhEyAGKAIQIRQgEiATIBQQigYaDAELQQghFSAHIBVqIRZBgAQhF0EAIRggFiAYIBcQiwYaCyAGKAIcIRlBICEaIAYgGmohGyAbJAAgGQ8LkAMBM38jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACNgIEIAUoAgwhBkEAIQcgBSAHNgIAIAUoAgghCEEAIQkgCCEKIAkhCyAKIAtHIQxBASENIAwgDXEhDgJAIA5FDQAgBSgCBCEPQQAhECAPIREgECESIBEgEkohE0EBIRQgEyAUcSEVAkACQCAVRQ0AA0AgBSgCACEWIAUoAgQhFyAWIRggFyEZIBggGUghGkEAIRtBASEcIBogHHEhHSAbIR4CQCAdRQ0AIAUoAgghHyAFKAIAISAgHyAgaiEhICEtAAAhIkEAISNB/wEhJCAiICRxISVB/wEhJiAjICZxIScgJSAnRyEoICghHgsgHiEpQQEhKiApICpxISsCQCArRQ0AIAUoAgAhLEEBIS0gLCAtaiEuIAUgLjYCAAwBCwsMAQsgBSgCCCEvIC8QkQYhMCAFIDA2AgALCyAFKAIIITEgBSgCACEyQQAhMyAGIDMgMSAyIDMQJ0EQITQgBSA0aiE1IDUkAA8LTAEGfyMAIQNBECEEIAMgBGshBSAFIAA2AgwgBSABNgIIIAUgAjYCBCAFKAIMIQYgBSgCCCEHIAYgBzYCFCAFKAIEIQggBiAINgIYDwuhAgEmfyMAIQVBICEGIAUgBmshByAHJAAgByAANgIcIAcgATYCGCAHIAI2AhQgByADNgIQIAcgBDYCDCAHKAIcIQhBGCEJIAcgCWohCiAKIQtBFCEMIAcgDGohDSANIQ4gCyAOECghDyAPKAIAIRAgCCAQNgIcQRghESAHIBFqIRIgEiETQRQhFCAHIBRqIRUgFSEWIBMgFhApIRcgFygCACEYIAggGDYCIEEQIRkgByAZaiEaIBohG0EMIRwgByAcaiEdIB0hHiAbIB4QKCEfIB8oAgAhICAIICA2AiRBECEhIAcgIWohIiAiISNBDCEkIAcgJGohJSAlISYgIyAmECkhJyAnKAIAISggCCAoNgIoQSAhKSAHIClqISogKiQADwvMBgFxfyMAIQBB0AAhASAAIAFrIQIgAiQAQQAhAyADEAAhBCACIAQ2AkxBzAAhBSACIAVqIQYgBiEHIAcQtQUhCCACIAg2AkhBICEJIAIgCWohCiAKIQsgAigCSCEMQSAhDUHgCiEOIAsgDSAOIAwQARogAigCSCEPIA8oAgghEEE8IREgECARbCESIAIoAkghEyATKAIEIRQgEiAUaiEVIAIgFTYCHCACKAJIIRYgFigCHCEXIAIgFzYCGEHMACEYIAIgGGohGSAZIRogGhC0BSEbIAIgGzYCSCACKAJIIRwgHCgCCCEdQTwhHiAdIB5sIR8gAigCSCEgICAoAgQhISAfICFqISIgAigCHCEjICMgImshJCACICQ2AhwgAigCSCElICUoAhwhJiACKAIYIScgJyAmayEoIAIgKDYCGCACKAIYISkCQCApRQ0AIAIoAhghKkEBISsgKiEsICshLSAsIC1KIS5BASEvIC4gL3EhMAJAAkAgMEUNAEF/ITEgAiAxNgIYDAELIAIoAhghMkF/ITMgMiE0IDMhNSA0IDVIITZBASE3IDYgN3EhOAJAIDhFDQBBASE5IAIgOTYCGAsLIAIoAhghOkGgCyE7IDogO2whPCACKAIcIT0gPSA8aiE+IAIgPjYCHAtBICE/IAIgP2ohQCBAIUEgQRCRBiFCIAIgQjYCFCACKAIcIUNBACFEIEMhRSBEIUYgRSBGTiFHQSshSEEtIUlBASFKIEcgSnEhSyBIIEkgSxshTCACKAIUIU1BASFOIE0gTmohTyACIE82AhRBICFQIAIgUGohUSBRIVIgUiBNaiFTIFMgTDoAACACKAIcIVRBACFVIFQhViBVIVcgViBXSCFYQQEhWSBYIFlxIVoCQCBaRQ0AIAIoAhwhW0EAIVwgXCBbayFdIAIgXTYCHAsgAigCFCFeQSAhXyACIF9qIWAgYCFhIGEgXmohYiACKAIcIWNBPCFkIGMgZG0hZSACKAIcIWZBPCFnIGYgZ28haCACIGg2AgQgAiBlNgIAQe4KIWkgYiBpIAIQiwUaQSAhaiACIGpqIWsgayFsQZA/IW0gbSBsEIEFGkGQPyFuQdAAIW8gAiBvaiFwIHAkACBuDwspAQN/IwAhBEEQIQUgBCAFayEGIAYgADYCDCAGIAE2AgggBiACNgIEDwtaAQh/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AgggBCgCDCEFQQAhBiAFIAY2AgBBACEHIAUgBzYCBEEAIQggBSAINgIIIAQoAgghCSAFIAk2AgwgBQ8LbgEJfyMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCDCEGIAUoAgghByAHEKsBIQggBiAIEKwBGiAFKAIEIQkgCRCtARogBhCuARpBECEKIAUgCmohCyALJAAgBg8LTAEHfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUgBhAeGkEQIQcgBCAHaiEIIAgkACAFDwtNAQd/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGEMMBGkEQIQcgBCAHaiEIIAgkACAFDwtnAQx/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQZBASEHIAYgB2ohCEEBIQlBASEKIAkgCnEhCyAFIAggCxDEARpBECEMIAQgDGohDSANJAAPC0wBB38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFIAYQHhpBECEHIAQgB2ohCCAIJAAgBQ8LZwEMfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGQQEhByAGIAdqIQhBASEJQQEhCiAJIApxIQsgBSAIIAsQyAEaQRAhDCAEIAxqIQ0gDSQADwtMAQd/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGEB4aQRAhByAEIAdqIQggCCQAIAUPC2cBDH8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBkEBIQcgBiAHaiEIQQEhCUEBIQogCSAKcSELIAUgCCALEMkBGkEQIQwgBCAMaiENIA0kAA8LmgkBlQF/IwAhBUEwIQYgBSAGayEHIAckACAHIAA2AiwgByABNgIoIAcgAjYCJCAHIAM2AiAgByAENgIcIAcoAiwhCCAHKAIgIQkCQAJAIAkNACAHKAIcIQogCg0AIAcoAighCyALDQBBASEMQQAhDUEBIQ4gDSAOcSEPIAggDCAPEK8BIRAgByAQNgIYIAcoAhghEUEAIRIgESETIBIhFCATIBRHIRVBASEWIBUgFnEhFwJAIBdFDQAgBygCGCEYQQAhGSAYIBk6AAALDAELIAcoAiAhGkEAIRsgGiEcIBshHSAcIB1KIR5BASEfIB4gH3EhIAJAICBFDQAgBygCKCEhQQAhIiAhISMgIiEkICMgJE4hJUEBISYgJSAmcSEnICdFDQAgCBBQISggByAoNgIUIAcoAighKSAHKAIgISogKSAqaiErIAcoAhwhLCArICxqIS1BASEuIC0gLmohLyAHIC82AhAgBygCECEwIAcoAhQhMSAwIDFrITIgByAyNgIMIAcoAgwhM0EAITQgMyE1IDQhNiA1IDZKITdBASE4IDcgOHEhOQJAIDlFDQAgCBBRITogByA6NgIIIAcoAhAhO0EAITxBASE9IDwgPXEhPiAIIDsgPhCvASE/IAcgPzYCBCAHKAIkIUBBACFBIEAhQiBBIUMgQiBDRyFEQQEhRSBEIEVxIUYCQCBGRQ0AIAcoAgQhRyAHKAIIIUggRyFJIEghSiBJIEpHIUtBASFMIEsgTHEhTSBNRQ0AIAcoAiQhTiAHKAIIIU8gTiFQIE8hUSBQIFFPIVJBASFTIFIgU3EhVCBURQ0AIAcoAiQhVSAHKAIIIVYgBygCFCFXIFYgV2ohWCBVIVkgWCFaIFkgWkkhW0EBIVwgWyBccSFdIF1FDQAgBygCBCFeIAcoAiQhXyAHKAIIIWAgXyBgayFhIF4gYWohYiAHIGI2AiQLCyAIEFAhYyAHKAIQIWQgYyFlIGQhZiBlIGZOIWdBASFoIGcgaHEhaQJAIGlFDQAgCBBRIWogByBqNgIAIAcoAhwha0EAIWwgayFtIGwhbiBtIG5KIW9BASFwIG8gcHEhcQJAIHFFDQAgBygCACFyIAcoAighcyByIHNqIXQgBygCICF1IHQgdWohdiAHKAIAIXcgBygCKCF4IHcgeGoheSAHKAIcIXogdiB5IHoQjAYaCyAHKAIkIXtBACF8IHshfSB8IX4gfSB+RyF/QQEhgAEgfyCAAXEhgQECQCCBAUUNACAHKAIAIYIBIAcoAighgwEgggEggwFqIYQBIAcoAiQhhQEgBygCICGGASCEASCFASCGARCMBhoLIAcoAgAhhwEgBygCECGIAUEBIYkBIIgBIIkBayGKASCHASCKAWohiwFBACGMASCLASCMAToAACAHKAIMIY0BQQAhjgEgjQEhjwEgjgEhkAEgjwEgkAFIIZEBQQEhkgEgkQEgkgFxIZMBAkAgkwFFDQAgBygCECGUAUEAIZUBQQEhlgEglQEglgFxIZcBIAgglAEglwEQrwEaCwsLC0EwIZgBIAcgmAFqIZkBIJkBJAAPC04BCH8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFIAYQsAEhB0EQIQggBCAIaiEJIAkkACAHDwtOAQh/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGELEBIQdBECEIIAQgCGohCSAJJAAgBw8LqQIBI38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCCCADKAIIIQQgAyAENgIMQYAIIQVBCCEGIAUgBmohByAHIQggBCAINgIAQcABIQkgBCAJaiEKIAoQKyELQQEhDCALIAxxIQ0CQCANRQ0AQcABIQ4gBCAOaiEPIA8QLCEQIBAoAgAhESARKAIIIRIgECASEQMAC0GkAiETIAQgE2ohFCAUEC0aQYwCIRUgBCAVaiEWIBYQLRpB9AEhFyAEIBdqIRggGBAuGkHcASEZIAQgGWohGiAaEC4aQcQBIRsgBCAbaiEcIBwQLxpBwAEhHSAEIB1qIR4gHhAwGkGwASEfIAQgH2ohICAgEDEaIAQQpgIaIAMoAgwhIUEQISIgAyAiaiEjICMkACAhDwtiAQ5/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQMiEFIAUoAgAhBkEAIQcgBiEIIAchCSAIIAlHIQpBASELIAogC3EhDEEQIQ0gAyANaiEOIA4kACAMDwtEAQh/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQMiEFIAUoAgAhBkEQIQcgAyAHaiEIIAgkACAGDws8AQZ/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQMxpBECEFIAMgBWohBiAGJAAgBA8LPAEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEDQaQRAhBSADIAVqIQYgBiQAIAQPCzwBBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBA1GkEQIQUgAyAFaiEGIAYkACAEDwtBAQd/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQQAhBSAEIAUQNkEQIQYgAyAGaiEHIAckACAEDws8AQZ/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQNxpBECEFIAMgBWohBiAGJAAgBA8LPgEHfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEM4BIQVBECEGIAMgBmohByAHJAAgBQ8LPAEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEDcaQRAhBSADIAVqIQYgBiQAIAQPCzwBBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBA3GkEQIQUgAyAFaiEGIAYkACAEDws8AQZ/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQNxpBECEFIAMgBWohBiAGJAAgBA8LpwEBE38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAUQygEhBiAGKAIAIQcgBCAHNgIEIAQoAgghCCAFEMoBIQkgCSAINgIAIAQoAgQhCkEAIQsgCiEMIAshDSAMIA1HIQ5BASEPIA4gD3EhEAJAIBBFDQAgBRBGIREgBCgCBCESIBEgEhDLAQtBECETIAQgE2ohFCAUJAAPC0MBB38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBCgCACEFIAUQggZBECEGIAMgBmohByAHJAAgBA8LRgEHfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBEEBIQUgBCAFEQAAGiAEENMFQRAhBiADIAZqIQcgByQADwvhAQEafyMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCDCEGIAYQOiEHIAUoAgghCCAHIQkgCCEKIAkgCkohC0EBIQwgCyAMcSENAkAgDUUNAEEAIQ4gBSAONgIAAkADQCAFKAIAIQ8gBSgCCCEQIA8hESAQIRIgESASSCETQQEhFCATIBRxIRUgFUUNASAFKAIEIRYgBSgCACEXIBYgFxA7GiAFKAIAIRhBASEZIBggGWohGiAFIBo2AgAMAAsACwtBECEbIAUgG2ohHCAcJAAPC0gBCX8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBBCEFIAQgBWohBiAGEDwhB0EQIQggAyAIaiEJIAkkACAHDwuWAgEifyMAIQJBICEDIAIgA2shBCAEJAAgBCAANgIYIAQgATYCFCAEKAIYIQUgBRA9IQYgBCAGNgIQIAQoAhAhB0EBIQggByAIaiEJQQAhCkEBIQsgCiALcSEMIAUgCSAMED4hDSAEIA02AgwgBCgCDCEOQQAhDyAOIRAgDyERIBAgEUchEkEBIRMgEiATcSEUAkACQCAURQ0AIAQoAhQhFSAEKAIMIRYgBCgCECEXQQIhGCAXIBh0IRkgFiAZaiEaIBogFTYCACAEKAIMIRsgBCgCECEcQQIhHSAcIB10IR4gGyAeaiEfIAQgHzYCHAwBC0EAISAgBCAgNgIcCyAEKAIcISFBICEiIAQgImohIyAjJAAgIQ8LSAEJfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEFAhBUECIQYgBSAGdiEHQRAhCCADIAhqIQkgCSQAIAcPC0gBCX8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBBQIQVBAiEGIAUgBnYhB0EQIQggAyAIaiEJIAkkACAHDwt4AQ5/IwAhA0EQIQQgAyAEayEFIAUkACAFIAA2AgwgBSABNgIIIAIhBiAFIAY6AAcgBSgCDCEHIAUoAgghCEECIQkgCCAJdCEKIAUtAAchC0EBIQwgCyAMcSENIAcgCiANELYBIQ5BECEPIAUgD2ohECAQJAAgDg8L6wEBH38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBECEFIAQgBWohBkECIQcgBiAHEF4hCCADIAg2AghBFCEJIAQgCWohCkEAIQsgCiALEF4hDCADIAw2AgQgAygCBCENIAMoAgghDiANIQ8gDiEQIA8gEEshEUEBIRIgESAScSETAkACQCATRQ0AIAQQYiEUIAMoAgQhFSADKAIIIRYgFSAWayEXIBQgF2shGCAYIRkMAQsgAygCCCEaIAMoAgQhGyAaIBtrIRwgHCEZCyAZIR1BECEeIAMgHmohHyAfJAAgHQ8LUAIFfwF8IwAhA0EQIQQgAyAEayEFIAUgADYCDCAFIAE2AgggBSACOQMAIAUoAgwhBiAFKAIIIQcgBiAHNgIAIAUrAwAhCCAGIAg5AwggBg8L2wICK38CfiMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIIIAQgATYCBCAEKAIIIQVBFCEGIAUgBmohB0EAIQggByAIEF4hCSAEIAk2AgAgBCgCACEKQRAhCyAFIAtqIQxBAiENIAwgDRBeIQ4gCiEPIA4hECAPIBBGIRFBASESIBEgEnEhEwJAAkAgE0UNAEEAIRRBASEVIBQgFXEhFiAEIBY6AA8MAQsgBRBgIRcgBCgCACEYQQQhGSAYIBl0IRogFyAaaiEbIAQoAgQhHCAbKQMAIS0gHCAtNwMAQQghHSAcIB1qIR4gGyAdaiEfIB8pAwAhLiAeIC43AwBBFCEgIAUgIGohISAEKAIAISIgBSAiEF8hI0EDISQgISAjICQQYUEBISVBASEmICUgJnEhJyAEICc6AA8LIAQtAA8hKEEBISkgKCApcSEqQRAhKyAEICtqISwgLCQAICoPC+sBAR9/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQRAhBSAEIAVqIQZBAiEHIAYgBxBeIQggAyAINgIIQRQhCSAEIAlqIQpBACELIAogCxBeIQwgAyAMNgIEIAMoAgQhDSADKAIIIQ4gDSEPIA4hECAPIBBLIRFBASESIBEgEnEhEwJAAkAgE0UNACAEEGMhFCADKAIEIRUgAygCCCEWIBUgFmshFyAUIBdrIRggGCEZDAELIAMoAgghGiADKAIEIRsgGiAbayEcIBwhGQsgGSEdQRAhHiADIB5qIR8gHyQAIB0PC3gBCH8jACEFQRAhBiAFIAZrIQcgByAANgIMIAcgATYCCCAHIAI6AAcgByADOgAGIAcgBDoABSAHKAIMIQggBygCCCEJIAggCTYCACAHLQAHIQogCCAKOgAEIActAAYhCyAIIAs6AAUgBy0ABSEMIAggDDoABiAIDwvZAgEtfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIIIAQgATYCBCAEKAIIIQVBFCEGIAUgBmohB0EAIQggByAIEF4hCSAEIAk2AgAgBCgCACEKQRAhCyAFIAtqIQxBAiENIAwgDRBeIQ4gCiEPIA4hECAPIBBGIRFBASESIBEgEnEhEwJAAkAgE0UNAEEAIRRBASEVIBQgFXEhFiAEIBY6AA8MAQsgBRBkIRcgBCgCACEYQQMhGSAYIBl0IRogFyAaaiEbIAQoAgQhHCAbKAIAIR0gHCAdNgIAQQMhHiAcIB5qIR8gGyAeaiEgICAoAAAhISAfICE2AABBFCEiIAUgImohIyAEKAIAISQgBSAkEGUhJUEDISYgIyAlICYQYUEBISdBASEoICcgKHEhKSAEICk6AA8LIAQtAA8hKkEBISsgKiArcSEsQRAhLSAEIC1qIS4gLiQAICwPC2MBB38jACEEQRAhBSAEIAVrIQYgBiAANgIMIAYgATYCCCAGIAI2AgQgBiADNgIAIAYoAgwhByAGKAIIIQggByAINgIAIAYoAgAhCSAHIAk2AgQgBigCBCEKIAcgCjYCCCAHDws+AQd/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQzQEhBUEQIQYgAyAGaiEHIAckACAFDwuuAwMsfwR8Bn0jACEDQSAhBCADIARrIQUgBSQAIAUgADYCHCAFIAE2AhggBSACNgIUIAUoAhwhBkEBIQcgBSAHOgATIAUoAhghCCAFKAIUIQlBAyEKIAkgCnQhCyAIIAtqIQwgBSAMNgIMQQAhDSAFIA02AggCQANAIAUoAgghDiAGEDohDyAOIRAgDyERIBAgEUghEkEBIRMgEiATcSEUIBRFDQEgBSgCCCEVIAYgFRBIIRYgFhBJIS8gL7YhMyAFIDM4AgQgBSgCDCEXQQghGCAXIBhqIRkgBSAZNgIMIBcrAwAhMCAwtiE0IAUgNDgCACAFKgIEITUgBSoCACE2IDUgNpMhNyA3EEohOCA4uyExRPFo44i1+OQ+ITIgMSAyYyEaQQEhGyAaIBtxIRwgBS0AEyEdQQEhHiAdIB5xIR8gHyAccSEgQQAhISAgISIgISEjICIgI0chJEEBISUgJCAlcSEmIAUgJjoAEyAFKAIIISdBASEoICcgKGohKSAFICk2AggMAAsACyAFLQATISpBASErICogK3EhLEEgIS0gBSAtaiEuIC4kACAsDwtYAQp/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBUEEIQYgBSAGaiEHIAQoAgghCCAHIAgQSyEJQRAhCiAEIApqIQsgCyQAIAkPC1ACCX8BfCMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBEEIIQUgBCAFaiEGQQUhByAGIAcQTCEKQRAhCCADIAhqIQkgCSQAIAoPCysCA38CfSMAIQFBECECIAEgAmshAyADIAA4AgwgAyoCDCEEIASLIQUgBQ8L9AEBH38jACECQRAhAyACIANrIQQgBCQAIAQgADYCCCAEIAE2AgQgBCgCCCEFIAUQUSEGIAQgBjYCACAEKAIAIQdBACEIIAchCSAIIQogCSAKRyELQQEhDCALIAxxIQ0CQAJAIA1FDQAgBCgCBCEOIAUQUCEPQQIhECAPIBB2IREgDiESIBEhEyASIBNJIRRBASEVIBQgFXEhFiAWRQ0AIAQoAgAhFyAEKAIEIRhBAiEZIBggGXQhGiAXIBpqIRsgGygCACEcIAQgHDYCDAwBC0EAIR0gBCAdNgIMCyAEKAIMIR5BECEfIAQgH2ohICAgJAAgHg8LUAIHfwF8IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGELMBIQlBECEHIAQgB2ohCCAIJAAgCQ8L0wEBF38jACEEQSAhBSAEIAVrIQYgBiQAIAYgADYCGCAGIAE2AhQgBiACNgIQIAMhByAGIAc6AA8gBigCGCEIIAYtAA8hCUEBIQogCSAKcSELAkACQCALRQ0AIAYoAhQhDCAGKAIQIQ0gCCgCACEOIA4oAvABIQ8gCCAMIA0gDxEFACEQQQEhESAQIBFxIRIgBiASOgAfDAELQQEhE0EBIRQgEyAUcSEVIAYgFToAHwsgBi0AHyEWQQEhFyAWIBdxIRhBICEZIAYgGWohGiAaJAAgGA8LegEMfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIIIAMoAgghBCAEEFAhBQJAAkAgBUUNACAEEFEhBiADIAY2AgwMAQtBACEHQQAhCCAIIAc6ALA/QbA/IQkgAyAJNgIMCyADKAIMIQpBECELIAMgC2ohDCAMJAAgCg8LggEBDX8jACEEQRAhBSAEIAVrIQYgBiQAIAYgADYCDCAGIAE2AgggBiACNgIEIAYoAgwhByAGIQggCCADNgIAIAYoAgghCSAGKAIEIQogBigCACELQQAhDEEBIQ0gDCANcSEOIAcgDiAJIAogCxC0ASAGGkEQIQ8gBiAPaiEQIBAkAA8LKwEFfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQoAgghBSAFDwtPAQl/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQQgBCgCCCEFAkACQCAFRQ0AIAQoAgAhBiAGIQcMAQtBACEIIAghBwsgByEJIAkPC+gBAhR/A3wjACEDQSAhBCADIARrIQUgBSQAIAUgADYCHCAFIAE2AhggBSACOQMQIAUoAhwhBiAFKAIYIQcgBSsDECEXIAUgFzkDCCAFIAc2AgBBtgohCEGkCiEJQfUAIQogCSAKIAggBRAdIAUoAhghCyAGIAsQUyEMIAUrAxAhGCAMIBgQVCAFKAIYIQ0gBSsDECEZIAYoAgAhDiAOKAL8ASEPIAYgDSAZIA8RCgAgBSgCGCEQIAYoAgAhESARKAIcIRJBAyETQX8hFCAGIBAgEyAUIBIRBwBBICEVIAUgFWohFiAWJAAPC1gBCn8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFQQQhBiAFIAZqIQcgBCgCCCEIIAcgCBBLIQlBECEKIAQgCmohCyALJAAgCQ8LUwIGfwJ8IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABOQMAIAQoAgwhBSAEKwMAIQggBSAIEFUhCSAFIAkQVkEQIQYgBCAGaiEHIAckAA8LfAILfwN8IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABOQMAIAQoAgwhBUGYASEGIAUgBmohByAHEFwhCCAEKwMAIQ0gCCgCACEJIAkoAhQhCiAIIA0gBSAKERQAIQ4gBSAOEF0hD0EQIQsgBCALaiEMIAwkACAPDwtlAgl/AnwjACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE5AwAgBCgCDCEFQQghBiAFIAZqIQcgBCsDACELIAUgCxBdIQxBBSEIIAcgDCAIELcBQRAhCSAEIAlqIQogCiQADwvUAQIWfwJ8IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQQAhBSADIAU2AggCQANAIAMoAgghBiAEEDohByAGIQggByEJIAggCUghCkEBIQsgCiALcSEMIAxFDQEgAygCCCENIAQgDRBTIQ4gDhBYIRcgAyAXOQMAIAMoAgghDyADKwMAIRggBCgCACEQIBAoAvwBIREgBCAPIBggEREKACADKAIIIRJBASETIBIgE2ohFCADIBQ2AggMAAsAC0EQIRUgAyAVaiEWIBYkAA8LWAIJfwJ8IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQQghBSAEIAVqIQZBBSEHIAYgBxBMIQogBCAKEFkhC0EQIQggAyAIaiEJIAkkACALDwubAQIMfwZ8IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABOQMAIAQoAgwhBUGYASEGIAUgBmohByAHEFwhCCAEKwMAIQ4gBSAOEF0hDyAIKAIAIQkgCSgCGCEKIAggDyAFIAoRFAAhEEEAIQsgC7chEUQAAAAAAADwPyESIBAgESASELkBIRNBECEMIAQgDGohDSANJAAgEw8L1wECFX8DfCMAIQRBMCEFIAQgBWshBiAGJAAgBiAANgIsIAYgATYCKCAGIAI5AyAgAyEHIAYgBzoAHyAGKAIsIQggBi0AHyEJQQEhCiAJIApxIQsCQCALRQ0AIAYoAighDCAIIAwQUyENIAYrAyAhGSANIBkQVSEaIAYgGjkDIAtBxAEhDiAIIA5qIQ8gBigCKCEQIAYrAyAhG0EIIREgBiARaiESIBIhEyATIBAgGxBAGkEIIRQgBiAUaiEVIBUhFiAPIBYQWxpBMCEXIAYgF2ohGCAYJAAPC+kCAix/An4jACECQSAhAyACIANrIQQgBCQAIAQgADYCGCAEIAE2AhQgBCgCGCEFQRAhBiAFIAZqIQdBACEIIAcgCBBeIQkgBCAJNgIQIAQoAhAhCiAFIAoQXyELIAQgCzYCDCAEKAIMIQxBFCENIAUgDWohDkECIQ8gDiAPEF4hECAMIREgECESIBEgEkchE0EBIRQgEyAUcSEVAkACQCAVRQ0AIAQoAhQhFiAFEGAhFyAEKAIQIRhBBCEZIBggGXQhGiAXIBpqIRsgFikDACEuIBsgLjcDAEEIIRwgGyAcaiEdIBYgHGohHiAeKQMAIS8gHSAvNwMAQRAhHyAFIB9qISAgBCgCDCEhQQMhIiAgICEgIhBhQQEhI0EBISQgIyAkcSElIAQgJToAHwwBC0EAISZBASEnICYgJ3EhKCAEICg6AB8LIAQtAB8hKUEBISogKSAqcSErQSAhLCAEICxqIS0gLSQAICsPC0UBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBC/ASEFIAUoAgAhBkEQIQcgAyAHaiEIIAgkACAGDwu1AQIJfwx8IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABOQMAIAQoAgwhBSAFKAI0IQZBAiEHIAYgB3EhCAJAAkAgCEUNACAEKwMAIQsgBSsDICEMIAsgDKMhDSANEIYFIQ4gBSsDICEPIA4gD6IhECAQIREMAQsgBCsDACESIBIhEQsgESETIAUrAxAhFCAFKwMYIRUgEyAUIBUQuQEhFkEQIQkgBCAJaiEKIAokACAWDwtOAQh/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGEMEBIQdBECEIIAQgCGohCSAJJAAgBw8LXQELfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGQQEhByAGIAdqIQggBRBiIQkgCCAJcCEKQRAhCyAEIAtqIQwgDCQAIAoPCz0BB38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBBRIQVBECEGIAMgBmohByAHJAAgBQ8LWgEIfyMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCDCEGIAUoAgghByAFKAIEIQggBiAHIAgQwgFBECEJIAUgCWohCiAKJAAPC0gBCX8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBBQIQVBBCEGIAUgBnYhB0EQIQggAyAIaiEJIAkkACAHDwtIAQl/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQUCEFQQMhBiAFIAZ2IQdBECEIIAMgCGohCSAJJAAgBw8LPQEHfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEFEhBUEQIQYgAyAGaiEHIAckACAFDwtdAQt/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQZBASEHIAYgB2ohCCAFEGMhCSAIIAlwIQpBECELIAQgC2ohDCAMJAAgCg8LSQEJfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEFAhBUGIBCEGIAUgBm4hB0EQIQggAyAIaiEJIAkkACAHDws9AQd/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQUSEFQRAhBiADIAZqIQcgByQAIAUPC10BC38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBkEBIQcgBiAHaiEIIAUQZiEJIAggCXAhCkEQIQsgBCALaiEMIAwkACAKDwtnAQp/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSgCACEHIAcoAnwhCCAFIAYgCBEEACAEKAIIIQkgBSAJEGpBECEKIAQgCmohCyALJAAPCyIBA38jACECQRAhAyACIANrIQQgBCAANgIMIAQgATYCCA8LaAEKfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUoAgAhByAHKAKAASEIIAUgBiAIEQQAIAQoAgghCSAFIAkQbEEQIQogBCAKaiELIAskAA8LIgEDfyMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIDwuzAQEQfyMAIQVBICEGIAUgBmshByAHJAAgByAANgIcIAcgATYCGCAHIAI2AhQgByADNgIQIAcgBDYCDCAHKAIcIQggBygCGCEJIAcoAhQhCiAHKAIQIQsgBygCDCEMIAgoAgAhDSANKAI0IQ4gCCAJIAogCyAMIA4RDAAaIAcoAhghDyAHKAIUIRAgBygCECERIAcoAgwhEiAIIA8gECARIBIQbkEgIRMgByATaiEUIBQkAA8LNwEDfyMAIQVBICEGIAUgBmshByAHIAA2AhwgByABNgIYIAcgAjYCFCAHIAM2AhAgByAENgIMDwtXAQl/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAFKAIAIQYgBigCFCEHIAUgBxEDAEEAIQhBECEJIAQgCWohCiAKJAAgCA8LSgEIfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEKAIAIQUgBSgCGCEGIAQgBhEDAEEQIQcgAyAHaiEIIAgkAA8LKQEDfyMAIQNBECEEIAMgBGshBSAFIAA2AgwgBSABNgIIIAUgAjYCBA8LOQEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEHNBECEFIAMgBWohBiAGJAAPC9YBAhl/AXwjACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBACEFIAMgBTYCCAJAA0AgAygCCCEGIAQQOiEHIAYhCCAHIQkgCCAJSCEKQQEhCyAKIAtxIQwgDEUNASADKAIIIQ0gAygCCCEOIAQgDhBTIQ8gDxBYIRogBCgCACEQIBAoAlghEUEBIRJBASETIBIgE3EhFCAEIA0gGiAUIBEREAAgAygCCCEVQQEhFiAVIBZqIRcgAyAXNgIIDAALAAtBECEYIAMgGGohGSAZJAAPCxsBA38jACEBQRAhAiABIAJrIQMgAyAANgIMDwu7AQETfyMAIQRBICEFIAQgBWshBiAGJAAgBiAANgIcIAYgATYCGCAGIAI2AhQgBiADNgIQIAYoAhwhByAGKAIYIQggBigCFCEJQeA5IQpBAiELIAkgC3QhDCAKIAxqIQ0gDSgCACEOIAYgDjYCBCAGIAg2AgBBhQshD0H3CiEQQe8AIREgECARIA8gBhAdIAYoAhghEiAHKAIAIRMgEygCICEUIAcgEiAUEQQAQSAhFSAGIBVqIRYgFiQADwsiAQN/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AggPCykBA38jACEDQRAhBCADIARrIQUgBSAANgIMIAUgATYCCCAFIAI2AgQPC+kBARp/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBUEAIQYgBCAGNgIEAkADQCAEKAIEIQcgBRA6IQggByEJIAghCiAJIApIIQtBASEMIAsgDHEhDSANRQ0BIAQoAgQhDiAEKAIIIQ8gBSgCACEQIBAoAhwhEUF/IRIgBSAOIA8gEiAREQcAIAQoAgQhEyAEKAIIIRQgBSgCACEVIBUoAiQhFiAFIBMgFCAWEQYAIAQoAgQhF0EBIRggFyAYaiEZIAQgGTYCBAwACwALQRAhGiAEIBpqIRsgGyQADwsiAQN/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AggPCyIBA38jACECQRAhAyACIANrIQQgBCAANgIMIAQgATYCCA8LSAEGfyMAIQVBICEGIAUgBmshByAHIAA2AhwgByABNgIYIAcgAjYCFCAHIAM2AhAgByAENgIMQQAhCEEBIQkgCCAJcSEKIAoPCzkBBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBBzQRAhBSADIAVqIQYgBiQADwszAQZ/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AghBACEFQQEhBiAFIAZxIQcgBw8LMwEGfyMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIQQAhBUEBIQYgBSAGcSEHIAcPCykBA38jACEDQRAhBCADIARrIQUgBSAANgIMIAUgATYCCCAFIAI5AwAPC4sBAQx/IwAhBUEgIQYgBSAGayEHIAckACAHIAA2AhwgByABNgIYIAcgAjYCFCAHIAM2AhAgByAENgIMIAcoAhwhCCAHKAIUIQkgBygCGCEKIAcoAhAhCyAHKAIMIQwgCCgCACENIA0oAjQhDiAIIAkgCiALIAwgDhEMABpBICEPIAcgD2ohECAQJAAPC4EBAQx/IwAhBEEQIQUgBCAFayEGIAYkACAGIAA2AgwgBiABNgIIIAYgAjYCBCAGIAM2AgAgBigCDCEHIAYoAgghCCAGKAIEIQkgBigCACEKIAcoAgAhCyALKAI0IQxBfyENIAcgCCANIAkgCiAMEQwAGkEQIQ4gBiAOaiEPIA8kAA8LWgEJfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUoAgAhByAHKAIsIQggBSAGIAgRBABBECEJIAQgCWohCiAKJAAPC1oBCX8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFKAIAIQcgBygCMCEIIAUgBiAIEQQAQRAhCSAEIAlqIQogCiQADwtyAQt/IwAhBEEgIQUgBCAFayEGIAYkACAGIAA2AhwgBiABNgIYIAYgAjkDECADIQcgBiAHOgAPIAYoAhwhCCAGKAIYIQkgCCgCACEKIAooAiQhC0EEIQwgCCAJIAwgCxEGAEEgIQ0gBiANaiEOIA4kAA8LWwEJfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUoAgAhByAHKAL0ASEIIAUgBiAIEQQAQRAhCSAEIAlqIQogCiQADwtyAgh/AnwjACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACOQMAIAUoAgwhBiAFKAIIIQcgBSsDACELIAYgByALEFIgBSgCCCEIIAUrAwAhDCAGIAggDBCHAUEQIQkgBSAJaiEKIAokAA8LhQECDH8BfCMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCAFIAI5AwAgBSgCDCEGIAUoAgghByAGIAcQUyEIIAUrAwAhDyAIIA8QVCAFKAIIIQkgBigCACEKIAooAiQhC0EDIQwgBiAJIAwgCxEGAEEQIQ0gBSANaiEOIA4kAA8LWwEJfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUoAgAhByAHKAL4ASEIIAUgBiAIEQQAQRAhCSAEIAlqIQogCiQADwtXAQl/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBUHcASEGIAUgBmohByAEKAIIIQggByAIEIoBGkEQIQkgBCAJaiEKIAokAA8L5wIBLn8jACECQSAhAyACIANrIQQgBCQAIAQgADYCGCAEIAE2AhQgBCgCGCEFQRAhBiAFIAZqIQdBACEIIAcgCBBeIQkgBCAJNgIQIAQoAhAhCiAFIAoQZSELIAQgCzYCDCAEKAIMIQxBFCENIAUgDWohDkECIQ8gDiAPEF4hECAMIREgECESIBEgEkchE0EBIRQgEyAUcSEVAkACQCAVRQ0AIAQoAhQhFiAFEGQhFyAEKAIQIRhBAyEZIBggGXQhGiAXIBpqIRsgFigCACEcIBsgHDYCAEEDIR0gGyAdaiEeIBYgHWohHyAfKAAAISAgHiAgNgAAQRAhISAFICFqISIgBCgCDCEjQQMhJCAiICMgJBBhQQEhJUEBISYgJSAmcSEnIAQgJzoAHwwBC0EAIShBASEpICggKXEhKiAEICo6AB8LIAQtAB8hK0EBISwgKyAscSEtQSAhLiAEIC5qIS8gLyQAIC0PC5UBARB/IwAhAkGQBCEDIAIgA2shBCAEJAAgBCAANgKMBCAEIAE2AogEIAQoAowEIQUgBCgCiAQhBiAGKAIAIQcgBCgCiAQhCCAIKAIEIQkgBCgCiAQhCiAKKAIIIQsgBCEMIAwgByAJIAsQGBpBjAIhDSAFIA1qIQ4gBCEPIA4gDxCMARpBkAQhECAEIBBqIREgESQADwvJAgEqfyMAIQJBICEDIAIgA2shBCAEJAAgBCAANgIYIAQgATYCFCAEKAIYIQVBECEGIAUgBmohB0EAIQggByAIEF4hCSAEIAk2AhAgBCgCECEKIAUgChBoIQsgBCALNgIMIAQoAgwhDEEUIQ0gBSANaiEOQQIhDyAOIA8QXiEQIAwhESAQIRIgESASRyETQQEhFCATIBRxIRUCQAJAIBVFDQAgBCgCFCEWIAUQZyEXIAQoAhAhGEGIBCEZIBggGWwhGiAXIBpqIRtBiAQhHCAbIBYgHBCKBhpBECEdIAUgHWohHiAEKAIMIR9BAyEgIB4gHyAgEGFBASEhQQEhIiAhICJxISMgBCAjOgAfDAELQQAhJEEBISUgJCAlcSEmIAQgJjoAHwsgBC0AHyEnQQEhKCAnIChxISlBICEqIAQgKmohKyArJAAgKQ8LMwEGfyMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIQQEhBUEBIQYgBSAGcSEHIAcPCzIBBH8jACEDQRAhBCADIARrIQUgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCBCEGIAYPCyIBA38jACECQRAhAyACIANrIQQgBCAANgIMIAQgATgCCA8LGwEDfyMAIQFBECECIAEgAmshAyADIAA2AgwPC1kBCn8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFIAYQrgIhB0EBIQggByAIcSEJQRAhCiAEIApqIQsgCyQAIAkPC14BCX8jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACNgIEIAUoAgwhBiAFKAIIIQcgBSgCBCEIIAYgByAIELICIQlBECEKIAUgCmohCyALJAAgCQ8LMwEGfyMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIQQEhBUEBIQYgBSAGcSEHIAcPCzIBBH8jACEDQRAhBCADIARrIQUgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCBCEGIAYPCxsBA38jACEBQRAhAiABIAJrIQMgAyAANgIMDwsbAQN/IwAhAUEQIQIgASACayEDIAMgADYCDA8LLAEGfyMAIQFBECECIAEgAmshAyADIAA2AgxBACEEQQEhBSAEIAVxIQYgBg8LLAEGfyMAIQFBECECIAEgAmshAyADIAA2AgxBACEEQQEhBSAEIAVxIQYgBg8LGwEDfyMAIQFBECECIAEgAmshAyADIAA2AgwPC14BDH8jACEDQRAhBCADIARrIQUgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCCCEGIAUoAgQhByAGIAdqIQhBACEJIAghCiAJIQsgCiALRiEMQQEhDSAMIA1xIQ4gDg8LKQEDfyMAIQNBECEEIAMgBGshBSAFIAA2AgwgBSABNgIIIAUgAjYCBA8LTAEIfyMAIQNBECEEIAMgBGshBSAFIAA2AgwgBSABNgIIIAUgAjYCBCAFKAIEIQZBACEHIAYgBzoAAEEAIQhBASEJIAggCXEhCiAKDwshAQR/IwAhAUEQIQIgASACayEDIAMgADYCDEEAIQQgBA8LGwEDfyMAIQFBECECIAEgAmshAyADIAA2AgwPC2YBCX8jACEEQRAhBSAEIAVrIQYgBiAANgIMIAYgATYCCCAGIAI2AgQgBiADNgIAIAYoAgghB0EAIQggByAINgIAIAYoAgQhCUEAIQogCSAKNgIAIAYoAgAhC0EAIQwgCyAMNgIADwsiAQN/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AggPCyEBBH8jACEBQRAhAiABIAJrIQMgAyAANgIMQQAhBCAEDwsiAQN/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AggPCyEBBH8jACEBQRAhAiABIAJrIQMgAyAANgIMQQAhBCAEDwsbAQN/IwAhAUEQIQIgASACayEDIAMgADYCDA8LOgEGfyMAIQNBECEEIAMgBGshBSAFIAA2AgwgBSABNgIIIAUgAjYCBEEAIQZBASEHIAYgB3EhCCAIDwsiAQN/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AggPCyIBA38jACECQRAhAyACIANrIQQgBCAANgIMIAQgATYCCA8LKQEDfyMAIQNBECEEIAMgBGshBSAFIAA2AgwgBSABNgIIIAUgAjkDAA8LIgEDfyMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIDwsiAQN/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AggPCyQBBH8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEDwtaAQl/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBhCrASEHIAcoAgAhCCAFIAg2AgBBECEJIAQgCWohCiAKJAAgBQ8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQPCyQBBH8jACEBQRAhAiABIAJrIQMgAyAANgIEIAMoAgQhBCAEDwv1DgHdAX8jACEDQTAhBCADIARrIQUgBSQAIAUgADYCKCAFIAE2AiQgAiEGIAUgBjoAIyAFKAIoIQcgBSgCJCEIQQAhCSAIIQogCSELIAogC0ghDEEBIQ0gDCANcSEOAkAgDkUNAEEAIQ8gBSAPNgIkCyAFKAIkIRAgBygCCCERIBAhEiARIRMgEiATRyEUQQEhFSAUIBVxIRYCQAJAAkAgFg0AIAUtACMhF0EBIRggFyAYcSEZIBlFDQEgBSgCJCEaIAcoAgQhG0ECIRwgGyAcbSEdIBohHiAdIR8gHiAfSCEgQQEhISAgICFxISIgIkUNAQtBACEjIAUgIzYCHCAFLQAjISRBASElICQgJXEhJgJAICZFDQAgBSgCJCEnIAcoAgghKCAnISkgKCEqICkgKkghK0EBISwgKyAscSEtIC1FDQAgBygCBCEuIAcoAgwhL0ECITAgLyAwdCExIC4gMWshMiAFIDI2AhwgBSgCHCEzIAcoAgQhNEECITUgNCA1bSE2IDMhNyA2ITggNyA4SiE5QQEhOiA5IDpxITsCQCA7RQ0AIAcoAgQhPEECIT0gPCA9bSE+IAUgPjYCHAsgBSgCHCE/QQEhQCA/IUEgQCFCIEEgQkghQ0EBIUQgQyBEcSFFAkAgRUUNAEEBIUYgBSBGNgIcCwsgBSgCJCFHIAcoAgQhSCBHIUkgSCFKIEkgSkohS0EBIUwgSyBMcSFNAkACQCBNDQAgBSgCJCFOIAUoAhwhTyBOIVAgTyFRIFAgUUghUkEBIVMgUiBTcSFUIFRFDQELIAUoAiQhVUECIVYgVSBWbSFXIAUgVzYCGCAFKAIYIVggBygCDCFZIFghWiBZIVsgWiBbSCFcQQEhXSBcIF1xIV4CQCBeRQ0AIAcoAgwhXyAFIF82AhgLIAUoAiQhYEEBIWEgYCFiIGEhYyBiIGNIIWRBASFlIGQgZXEhZgJAAkAgZkUNAEEAIWcgBSBnNgIUDAELIAcoAgwhaEGAICFpIGghaiBpIWsgaiBrSCFsQQEhbSBsIG1xIW4CQAJAIG5FDQAgBSgCJCFvIAUoAhghcCBvIHBqIXEgBSBxNgIUDAELIAUoAhghckGAYCFzIHIgc3EhdCAFIHQ2AhggBSgCGCF1QYAgIXYgdSF3IHYheCB3IHhIIXlBASF6IHkgenEhewJAAkAge0UNAEGAICF8IAUgfDYCGAwBCyAFKAIYIX1BgICAAiF+IH0hfyB+IYABIH8ggAFKIYEBQQEhggEggQEgggFxIYMBAkAggwFFDQBBgICAAiGEASAFIIQBNgIYCwsgBSgCJCGFASAFKAIYIYYBIIUBIIYBaiGHAUHgACGIASCHASCIAWohiQFBgGAhigEgiQEgigFxIYsBQeAAIYwBIIsBIIwBayGNASAFII0BNgIUCwsgBSgCFCGOASAHKAIEIY8BII4BIZABII8BIZEBIJABIJEBRyGSAUEBIZMBIJIBIJMBcSGUAQJAIJQBRQ0AIAUoAhQhlQFBACGWASCVASGXASCWASGYASCXASCYAUwhmQFBASGaASCZASCaAXEhmwECQCCbAUUNACAHKAIAIZwBIJwBEIIGQQAhnQEgByCdATYCAEEAIZ4BIAcgngE2AgRBACGfASAHIJ8BNgIIQQAhoAEgBSCgATYCLAwECyAHKAIAIaEBIAUoAhQhogEgoQEgogEQgwYhowEgBSCjATYCECAFKAIQIaQBQQAhpQEgpAEhpgEgpQEhpwEgpgEgpwFHIagBQQEhqQEgqAEgqQFxIaoBAkAgqgENACAFKAIUIasBIKsBEIEGIawBIAUgrAE2AhBBACGtASCsASGuASCtASGvASCuASCvAUchsAFBASGxASCwASCxAXEhsgECQCCyAQ0AIAcoAgghswECQAJAILMBRQ0AIAcoAgAhtAEgtAEhtQEMAQtBACG2ASC2ASG1AQsgtQEhtwEgBSC3ATYCLAwFCyAHKAIAIbgBQQAhuQEguAEhugEguQEhuwEgugEguwFHIbwBQQEhvQEgvAEgvQFxIb4BAkAgvgFFDQAgBSgCJCG/ASAHKAIIIcABIL8BIcEBIMABIcIBIMEBIMIBSCHDAUEBIcQBIMMBIMQBcSHFAQJAAkAgxQFFDQAgBSgCJCHGASDGASHHAQwBCyAHKAIIIcgBIMgBIccBCyDHASHJASAFIMkBNgIMIAUoAgwhygFBACHLASDKASHMASDLASHNASDMASDNAUohzgFBASHPASDOASDPAXEh0AECQCDQAUUNACAFKAIQIdEBIAcoAgAh0gEgBSgCDCHTASDRASDSASDTARCKBhoLIAcoAgAh1AEg1AEQggYLCyAFKAIQIdUBIAcg1QE2AgAgBSgCFCHWASAHINYBNgIECwsgBSgCJCHXASAHINcBNgIICyAHKAIIIdgBAkACQCDYAUUNACAHKAIAIdkBINkBIdoBDAELQQAh2wEg2wEh2gELINoBIdwBIAUg3AE2AiwLIAUoAiwh3QFBMCHeASAFIN4BaiHfASDfASQAIN0BDwuRAQERfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIEIAQgATYCACAEKAIAIQUgBCgCBCEGQQghByAEIAdqIQggCCEJIAkgBSAGELIBIQpBASELIAogC3EhDAJAAkAgDEUNACAEKAIAIQ0gDSEODAELIAQoAgQhDyAPIQ4LIA4hEEEQIREgBCARaiESIBIkACAQDwuRAQERfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIEIAQgATYCACAEKAIEIQUgBCgCACEGQQghByAEIAdqIQggCCEJIAkgBSAGELIBIQpBASELIAogC3EhDAJAAkAgDEUNACAEKAIAIQ0gDSEODAELIAQoAgQhDyAPIQ4LIA4hEEEQIREgBCARaiESIBIkACAQDwthAQx/IwAhA0EQIQQgAyAEayEFIAUgADYCDCAFIAE2AgggBSACNgIEIAUoAgghBiAGKAIAIQcgBSgCBCEIIAgoAgAhCSAHIQogCSELIAogC0ghDEEBIQ0gDCANcSEOIA4PC5oBAwl/A34BfCMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBCEHQX8hCCAGIAhqIQlBBCEKIAkgCksaAkACQAJAAkAgCQ4FAQEAAAIACyAFKQMAIQsgByALNwMADAILIAUpAwAhDCAHIAw3AwAMAQsgBSkDACENIAcgDTcDAAsgBysDACEOIA4PC9IDATh/IwAhBUEgIQYgBSAGayEHIAckACAHIAA2AhwgASEIIAcgCDoAGyAHIAI2AhQgByADNgIQIAcgBDYCDCAHKAIcIQkgBy0AGyEKQQEhCyAKIAtxIQwCQAJAIAxFDQAgCRC1ASENIA0hDgwBC0EAIQ8gDyEOCyAOIRAgByAQNgIIIAcoAgghESAHKAIUIRIgESASaiETQQEhFCATIBRqIRVBACEWQQEhFyAWIBdxIRggCSAVIBgQtgEhGSAHIBk2AgQgBygCBCEaQQAhGyAaIRwgGyEdIBwgHUchHkEBIR8gHiAfcSEgAkACQCAgDQAMAQsgBygCCCEhIAcoAgQhIiAiICFqISMgByAjNgIEIAcoAgQhJCAHKAIUISVBASEmICUgJmohJyAHKAIQISggBygCDCEpICQgJyAoICkQiAUhKiAHICo2AgAgBygCACErIAcoAhQhLCArIS0gLCEuIC0gLkohL0EBITAgLyAwcSExAkAgMUUNACAHKAIUITIgByAyNgIACyAHKAIIITMgBygCACE0IDMgNGohNUEBITYgNSA2aiE3QQAhOEEBITkgOCA5cSE6IAkgNyA6EK8BGgtBICE7IAcgO2ohPCA8JAAPC2cBDH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBBQIQUCQAJAIAVFDQAgBBBRIQYgBhCRBiEHIAchCAwBC0EAIQkgCSEICyAIIQpBECELIAMgC2ohDCAMJAAgCg8LvwEBF38jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggAiEGIAUgBjoAByAFKAIMIQcgBSgCCCEIIAUtAAchCUEBIQogCSAKcSELIAcgCCALEK8BIQwgBSAMNgIAIAcQUCENIAUoAgghDiANIQ8gDiEQIA8gEEYhEUEBIRIgESAScSETAkACQCATRQ0AIAUoAgAhFCAUIRUMAQtBACEWIBYhFQsgFSEXQRAhGCAFIBhqIRkgGSQAIBcPC1wCB38BfCMAIQNBICEEIAMgBGshBSAFJAAgBSAANgIcIAUgATkDECAFIAI2AgwgBSgCHCEGIAUrAxAhCiAFKAIMIQcgBiAKIAcQuAFBICEIIAUgCGohCSAJJAAPC6QBAwl/AXwDfiMAIQNBICEEIAMgBGshBSAFIAA2AhwgBSABOQMQIAUgAjYCDCAFKAIcIQYgBSgCDCEHIAUrAxAhDCAFIAw5AwAgBSEIQX0hCSAHIAlqIQpBAiELIAogC0saAkACQAJAAkAgCg4DAQACAAsgCCkDACENIAYgDTcDAAwCCyAIKQMAIQ4gBiAONwMADAELIAgpAwAhDyAGIA83AwALDwuGAQIQfwF8IwAhA0EgIQQgAyAEayEFIAUkACAFIAA5AxggBSABOQMQIAUgAjkDCEEYIQYgBSAGaiEHIAchCEEQIQkgBSAJaiEKIAohCyAIIAsQugEhDEEIIQ0gBSANaiEOIA4hDyAMIA8QuwEhECAQKwMAIRNBICERIAUgEWohEiASJAAgEw8LTgEIfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUgBhC9ASEHQRAhCCAEIAhqIQkgCSQAIAcPC04BCH8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFIAYQvAEhB0EQIQggBCAIaiEJIAkkACAHDwuRAQERfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIEIAQgATYCACAEKAIAIQUgBCgCBCEGQQghByAEIAdqIQggCCEJIAkgBSAGEL4BIQpBASELIAogC3EhDAJAAkAgDEUNACAEKAIAIQ0gDSEODAELIAQoAgQhDyAPIQ4LIA4hEEEQIREgBCARaiESIBIkACAQDwuRAQERfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIEIAQgATYCACAEKAIEIQUgBCgCACEGQQghByAEIAdqIQggCCEJIAkgBSAGEL4BIQpBASELIAogC3EhDAJAAkAgDEUNACAEKAIAIQ0gDSEODAELIAQoAgQhDyAPIQ4LIA4hEEEQIREgBCARaiESIBIkACAQDwtbAgh/AnwjACEDQRAhBCADIARrIQUgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCCCEGIAYrAwAhCyAFKAIEIQcgBysDACEMIAsgDGMhCEEBIQkgCCAJcSEKIAoPCz4BB38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBDAASEFQRAhBiADIAZqIQcgByQAIAUPCyQBBH8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEDwuSAQEMfyMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQZBfyEHIAYgB2ohCEEEIQkgCCAJSxoCQAJAAkACQCAIDgUBAQAAAgALIAUoAgAhCiAEIAo2AgQMAgsgBSgCACELIAQgCzYCBAwBCyAFKAIAIQwgBCAMNgIECyAEKAIEIQ0gDQ8LnAEBDH8jACEDQRAhBCADIARrIQUgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCDCEGIAUoAgQhByAFKAIIIQggBSAINgIAQX0hCSAHIAlqIQpBAiELIAogC0saAkACQAJAAkAgCg4DAQACAAsgBSgCACEMIAYgDDYCAAwCCyAFKAIAIQ0gBiANNgIADAELIAUoAgAhDiAGIA42AgALDwtNAQd/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGEMUBGkEQIQcgBCAHaiEIIAgkACAFDwt4AQ5/IwAhA0EQIQQgAyAEayEFIAUkACAFIAA2AgwgBSABNgIIIAIhBiAFIAY6AAcgBSgCDCEHIAUoAgghCEEEIQkgCCAJdCEKIAUtAAchC0EBIQwgCyAMcSENIAcgCiANEK8BIQ5BECEPIAUgD2ohECAQJAAgDg8LTQEHfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUgBhDGARpBECEHIAQgB2ohCCAIJAAgBQ8LTQEHfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUgBhDHARpBECEHIAQgB2ohCCAIJAAgBQ8LOQEFfyMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGNgIAIAUPC3gBDn8jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggAiEGIAUgBjoAByAFKAIMIQcgBSgCCCEIQQMhCSAIIAl0IQogBS0AByELQQEhDCALIAxxIQ0gByAKIA0QrwEhDkEQIQ8gBSAPaiEQIBAkACAODwt5AQ5/IwAhA0EQIQQgAyAEayEFIAUkACAFIAA2AgwgBSABNgIIIAIhBiAFIAY6AAcgBSgCDCEHIAUoAgghCEGIBCEJIAggCWwhCiAFLQAHIQtBASEMIAsgDHEhDSAHIAogDRCvASEOQRAhDyAFIA9qIRAgECQAIA4PCz4BB38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBDMASEFQRAhBiADIAZqIQcgByQAIAUPC3YBDn8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCCCEFQQAhBiAFIQcgBiEIIAcgCEYhCUEBIQogCSAKcSELAkAgCw0AIAUoAgAhDCAMKAIEIQ0gBSANEQMAC0EQIQ4gBCAOaiEPIA8kAA8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQPCyQBBH8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEDwskAQR/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQQgBA8LcwIGfwd8IwAhA0EgIQQgAyAEayEFIAUgADYCHCAFIAE5AxAgBSACNgIMIAUoAgwhBiAGKwMQIQkgBSsDECEKIAUoAgwhByAHKwMYIQsgBSgCDCEIIAgrAxAhDCALIAyhIQ0gCiANoiEOIAkgDqAhDyAPDwtzAgZ/B3wjACEDQSAhBCADIARrIQUgBSAANgIcIAUgATkDECAFIAI2AgwgBSsDECEJIAUoAgwhBiAGKwMQIQogCSAKoSELIAUoAgwhByAHKwMYIQwgBSgCDCEIIAgrAxAhDSAMIA2hIQ4gCyAOoyEPIA8PCz8BCH8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBEGsDSEFQQghBiAFIAZqIQcgByEIIAQgCDYCACAEDwstAgR/AXwjACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEKwMQIQUgBQ8LLQIEfwF8IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQQgBCsDGCEFIAUPC7wEAzp/BXwDfiMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBEEAIQUgBCAFNgIAQRUhBiAEIAY2AgRBCCEHIAQgB2ohCEEAIQkgCbchOyAIIDsQ1QEaQQAhCiAKtyE8IAQgPDkDEEQAAAAAAADwPyE9IAQgPTkDGEQAAAAAAADwPyE+IAQgPjkDIEEAIQsgC7chPyAEID85AyhBACEMIAQgDDYCMEEAIQ0gBCANNgI0QZgBIQ4gBCAOaiEPIA8Q1gEaQaABIRAgBCAQaiERQQAhEiARIBIQ1wEaQbgBIRMgBCATaiEUQYAgIRUgFCAVENgBGkEIIRYgAyAWaiEXIBchGCAYENkBQZgBIRkgBCAZaiEaQQghGyADIBtqIRwgHCEdIBogHRDaARpBCCEeIAMgHmohHyAfISAgIBDbARpBOCEhIAQgIWohIkIAIUAgIiBANwMAQRghIyAiICNqISQgJCBANwMAQRAhJSAiICVqISYgJiBANwMAQQghJyAiICdqISggKCBANwMAQdgAISkgBCApaiEqQgAhQSAqIEE3AwBBGCErICogK2ohLCAsIEE3AwBBECEtICogLWohLiAuIEE3AwBBCCEvICogL2ohMCAwIEE3AwBB+AAhMSAEIDFqITJCACFCIDIgQjcDAEEYITMgMiAzaiE0IDQgQjcDAEEQITUgMiA1aiE2IDYgQjcDAEEIITcgMiA3aiE4IDggQjcDAEEQITkgAyA5aiE6IDokACAEDwtPAgZ/AXwjACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE5AwAgBCgCDCEFIAQrAwAhCCAFIAgQ3AEaQRAhBiAEIAZqIQcgByQAIAUPC18BC38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBACEFIAMgBTYCCEEIIQYgAyAGaiEHIAchCCADIQkgBCAIIAkQ3QEaQRAhCiADIApqIQsgCyQAIAQPC0QBBn8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAUQ3gEaQRAhBiAEIAZqIQcgByQAIAUPC0wBB38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFIAYQHhpBECEHIAQgB2ohCCAIJAAgBQ8LZgIJfwF+IwAhAUEQIQIgASACayEDIAMkACADIAA2AgxBECEEIAQQ0gUhBUIAIQogBSAKNwMAQQghBiAFIAZqIQcgByAKNwMAIAUQ3wEaIAAgBRDgARpBECEIIAMgCGohCSAJJAAPC4ABAQ1/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBhDhASEHIAUgBxDiASAEKAIIIQggCBDjASEJIAkQ5AEhCiAEIQtBACEMIAsgCiAMEOUBGiAFEOYBGkEQIQ0gBCANaiEOIA4kACAFDwtCAQd/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQQAhBSAEIAUQ5wFBECEGIAMgBmohByAHJAAgBA8LTwIGfwF8IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABOQMAIAQoAgwhBSAEKwMAIQggBSAIEIMCGkEQIQYgBCAGaiEHIAckACAFDwtuAQl/IwAhA0EQIQQgAyAEayEFIAUkACAFIAA2AgwgBSABNgIIIAUgAjYCBCAFKAIMIQYgBSgCCCEHIAcQhQIhCCAGIAgQhgIaIAUoAgQhCSAJEK0BGiAGEIcCGkEQIQogBSAKaiELIAskACAGDwsvAQV/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQRBACEFIAQgBTYCECAEDwtYAQp/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQ0QEaQcAMIQVBCCEGIAUgBmohByAHIQggBCAINgIAQRAhCSADIAlqIQogCiQAIAQPC1sBCn8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFQQghBiAEIAZqIQcgByEIIAQhCSAFIAggCRCRAhpBECEKIAQgCmohCyALJAAgBQ8LZQELfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEJUCIQUgBSgCACEGIAMgBjYCCCAEEJUCIQdBACEIIAcgCDYCACADKAIIIQlBECEKIAMgCmohCyALJAAgCQ8LqAEBE38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAUQjQIhBiAGKAIAIQcgBCAHNgIEIAQoAgghCCAFEI0CIQkgCSAINgIAIAQoAgQhCkEAIQsgCiEMIAshDSAMIA1HIQ5BASEPIA4gD3EhEAJAIBBFDQAgBRDmASERIAQoAgQhEiARIBIQjgILQRAhEyAEIBNqIRQgFCQADws+AQd/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQlgIhBUEQIQYgAyAGaiEHIAckACAFDwskAQR/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQQgBA8LMgEEfyMAIQNBECEEIAMgBGshBSAFIAA2AgwgBSABNgIIIAUgAjYCBCAFKAIMIQYgBg8LPgEHfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEJACIQVBECEGIAMgBmohByAHJAAgBQ8LqAEBE38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAUQlQIhBiAGKAIAIQcgBCAHNgIEIAQoAgghCCAFEJUCIQkgCSAINgIAIAQoAgQhCkEAIQsgCiEMIAshDSAMIA1HIQ5BASEPIA4gD3EhEAJAIBBFDQAgBRCWAiERIAQoAgQhEiARIBIQlwILQRAhEyAEIBNqIRQgFCQADwvIBQI7fw58IwAhDEHQACENIAwgDWshDiAOJAAgDiAANgJMIA4gATYCSCAOIAI5A0AgDiADOQM4IA4gBDkDMCAOIAU5AyggDiAGNgIkIA4gBzYCICAOIAg2AhwgDiAJNgIYIA4gCjYCFCAOKAJMIQ8gDygCACEQAkAgEA0AQQQhESAPIBE2AgALQTghEiAPIBJqIRMgDigCSCEUIBMgFBCBBRpB2AAhFSAPIBVqIRYgDigCJCEXIBYgFxCBBRpB+AAhGCAPIBhqIRkgDigCHCEaIBkgGhCBBRogDisDOCFHIA8gRzkDECAOKwM4IUggDisDKCFJIEggSaAhSiAOIEo5AwhBMCEbIA4gG2ohHCAcIR1BCCEeIA4gHmohHyAfISAgHSAgELoBISEgISsDACFLIA8gSzkDGCAOKwMoIUwgDyBMOQMgIA4rA0AhTSAPIE05AyggDigCFCEiIA8gIjYCBCAOKAIgISMgDyAjNgI0QaABISQgDyAkaiElICUgCxDrARogDisDQCFOIA8gThBWQQAhJiAPICY2AjADQCAPKAIwISdBBiEoICchKSAoISogKSAqSCErQQAhLEEBIS0gKyAtcSEuICwhLwJAIC5FDQAgDisDKCFPIA4rAyghUCBQnCFRIE8gUWIhMCAwIS8LIC8hMUEBITIgMSAycSEzAkAgM0UNACAPKAIwITRBASE1IDQgNWohNiAPIDY2AjAgDisDKCFSRAAAAAAAACRAIVMgUiBToiFUIA4gVDkDKAwBCwsgDigCGCE3IDcoAgAhOCA4KAIIITkgNyA5EQAAITogDiE7IDsgOhDsARpBmAEhPCAPIDxqIT0gDiE+ID0gPhDtARogDiE/ID8Q7gEaQZgBIUAgDyBAaiFBIEEQXCFCIEIoAgAhQyBDKAIMIUQgQiAPIEQRBABB0AAhRSAOIEVqIUYgRiQADws9AQZ/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQ7wEaQRAhBSADIAVqIQYgBiQAIAQPCz0BBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBDwARpBECEFIAMgBWohBiAGJAAgBA8LZgEKfyMAIQJBICEDIAIgA2shBCAEJAAgBCAANgIcIAQgATYCGCAEKAIcIQUgBCgCGCEGIAQhByAHIAYQ8QEaIAQhCCAIIAUQ8gEgBCEJIAkQ6QEaQSAhCiAEIApqIQsgCyQAIAUPC1sBCn8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFQQghBiAEIAZqIQcgByEIIAQhCSAFIAggCRDzARpBECEKIAQgCmohCyALJAAgBQ8LbQEKfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAYQ9AEhByAFIAcQ4gEgBCgCCCEIIAgQ9QEhCSAJEPYBGiAFEOYBGkEQIQogBCAKaiELIAskACAFDwtCAQd/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQQAhBSAEIAUQ4gFBECEGIAMgBmohByAHJAAgBA8L2AEBGn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCCCADKAIIIQQgAyAENgIMIAQoAhAhBSAFIQYgBCEHIAYgB0YhCEEBIQkgCCAJcSEKAkACQCAKRQ0AIAQoAhAhCyALKAIAIQwgDCgCECENIAsgDREDAAwBCyAEKAIQIQ5BACEPIA4hECAPIREgECARRyESQQEhEyASIBNxIRQCQCAURQ0AIAQoAhAhFSAVKAIAIRYgFigCFCEXIBUgFxEDAAsLIAMoAgwhGEEQIRkgAyAZaiEaIBokACAYDwskAQR/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQQgBA8LTQEHfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUgBhD4ARpBECEHIAQgB2ohCCAIJAAgBQ8LSgEHfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUgBhCJAkEQIQcgBCAHaiEIIAgkAA8LbgEJfyMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCDCEGIAUoAgghByAHEJoCIQggBiAIEJsCGiAFKAIEIQkgCRCtARogBhCHAhpBECEKIAUgCmohCyALJAAgBg8LZQELfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEI0CIQUgBSgCACEGIAMgBjYCCCAEEI0CIQdBACEIIAcgCDYCACADKAIIIQlBECEKIAMgCmohCyALJAAgCQ8LPgEHfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEOYBIQVBECEGIAMgBmohByAHJAAgBQ8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQPCysBBX8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEKAIAIQUgBQ8LsgIBI38jACECQRAhAyACIANrIQQgBCQAIAQgADYCCCAEIAE2AgQgBCgCCCEFIAQgBTYCDCAEKAIEIQYgBigCECEHQQAhCCAHIQkgCCEKIAkgCkYhC0EBIQwgCyAMcSENAkACQCANRQ0AQQAhDiAFIA42AhAMAQsgBCgCBCEPIA8oAhAhECAEKAIEIREgECESIBEhEyASIBNGIRRBASEVIBQgFXEhFgJAAkAgFkUNACAFEIoCIRcgBSAXNgIQIAQoAgQhGCAYKAIQIRkgBSgCECEaIBkoAgAhGyAbKAIMIRwgGSAaIBwRBAAMAQsgBCgCBCEdIB0oAhAhHiAeKAIAIR8gHygCCCEgIB4gIBEAACEhIAUgITYCEAsLIAQoAgwhIkEQISMgBCAjaiEkICQkACAiDwsvAQZ/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQRBOCEFIAQgBWohBiAGDwvTBQJGfwN8IwAhA0GQASEEIAMgBGshBSAFJAAgBSAANgKMASAFIAE2AogBIAUgAjYChAEgBSgCjAEhBiAFKAKIASEHQcsLIQhBACEJQYDAACEKIAcgCiAIIAkQ+wEgBSgCiAEhCyAFKAKEASEMIAUgDDYCgAFBzQshDUGAASEOIAUgDmohDyALIAogDSAPEPsBIAUoAogBIRAgBhD5ASERIAUgETYCcEHXCyESQfAAIRMgBSATaiEUIBAgCiASIBQQ+wEgBhD3ASEVQQQhFiAVIBZLGgJAAkACQAJAAkACQAJAIBUOBQABAgMEBQsMBQsgBSgCiAEhF0HzCyEYIAUgGDYCMEHlCyEZQYDAACEaQTAhGyAFIBtqIRwgFyAaIBkgHBD7AQwECyAFKAKIASEdQfgLIR4gBSAeNgJAQeULIR9BgMAAISBBwAAhISAFICFqISIgHSAgIB8gIhD7AQwDCyAFKAKIASEjQfwLISQgBSAkNgJQQeULISVBgMAAISZB0AAhJyAFICdqISggIyAmICUgKBD7AQwCCyAFKAKIASEpQYEMISogBSAqNgJgQeULIStBgMAAISxB4AAhLSAFIC1qIS4gKSAsICsgLhD7AQwBCwsgBSgCiAEhLyAGENIBIUkgBSBJOQMAQYcMITBBgMAAITEgLyAxIDAgBRD7ASAFKAKIASEyIAYQ0wEhSiAFIEo5AxBBkgwhM0GAwAAhNEEQITUgBSA1aiE2IDIgNCAzIDYQ+wEgBSgCiAEhN0EAIThBASE5IDggOXEhOiAGIDoQ/AEhSyAFIEs5AyBBnQwhO0GAwAAhPEEgIT0gBSA9aiE+IDcgPCA7ID4Q+wEgBSgCiAEhP0GsDCFAQQAhQUGAwAAhQiA/IEIgQCBBEPsBIAUoAogBIUNBvQwhREEAIUVBgMAAIUYgQyBGIEQgRRD7AUGQASFHIAUgR2ohSCBIJAAPC4IBAQ1/IwAhBEEQIQUgBCAFayEGIAYkACAGIAA2AgwgBiABNgIIIAYgAjYCBCAGKAIMIQcgBiEIIAggAzYCACAGKAIIIQkgBigCBCEKIAYoAgAhC0EBIQxBASENIAwgDXEhDiAHIA4gCSAKIAsQtAEgBhpBECEPIAYgD2ohECAQJAAPC5YBAg1/BXwjACECQRAhAyACIANrIQQgBCQAIAQgADYCDCABIQUgBCAFOgALIAQoAgwhBiAELQALIQdBASEIIAcgCHEhCQJAAkAgCUUNAEEAIQpBASELIAogC3EhDCAGIAwQ/AEhDyAGIA8QWSEQIBAhEQwBCyAGKwMoIRIgEiERCyARIRNBECENIAQgDWohDiAOJAAgEw8LQAEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEOoBGiAEENMFQRAhBSADIAVqIQYgBiQADwtKAQh/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQRAhBSAFENIFIQYgBiAEEP8BGkEQIQcgAyAHaiEIIAgkACAGDwt/Agx/AXwjACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFIAYQiAIaQcAMIQdBCCEIIAcgCGohCSAJIQogBSAKNgIAIAQoAgghCyALKwMIIQ4gBSAOOQMIQRAhDCAEIAxqIQ0gDSQAIAUPCyIBA38jACECQRAhAyACIANrIQQgBCAANgIMIAQgATYCCA8LIQEEfyMAIQFBECECIAEgAmshAyADIAA2AgxBACEEIAQPCxsBA38jACEBQRAhAiABIAJrIQMgAyAANgIMAAtPAgZ/AXwjACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE5AwAgBCgCDCEFIAQrAwAhCCAFIAgQhAIaQRAhBiAEIAZqIQcgByQAIAUPCzsCBH8BfCMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABOQMAIAQoAgwhBSAEKwMAIQYgBSAGOQMAIAUPCyQBBH8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEDwtaAQl/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBhCFAiEHIAcoAgAhCCAFIAg2AgBBECEJIAQgCWohCiAKJAAgBQ8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgQgAygCBCEEIAQPC0YBCH8jACECQRAhAyACIANrIQQgBCAANgIMIAQgATYCCCAEKAIMIQVBrA0hBkEIIQcgBiAHaiEIIAghCSAFIAk2AgAgBQ8L/gYBaX8jACECQTAhAyACIANrIQQgBCQAIAQgADYCLCAEIAE2AiggBCgCLCEFIAQoAighBiAGIQcgBSEIIAcgCEYhCUEBIQogCSAKcSELAkACQCALRQ0ADAELIAUoAhAhDCAMIQ0gBSEOIA0gDkYhD0EBIRAgDyAQcSERAkAgEUUNACAEKAIoIRIgEigCECETIAQoAighFCATIRUgFCEWIBUgFkYhF0EBIRggFyAYcSEZIBlFDQBBECEaIAQgGmohGyAbIRwgHBCKAiEdIAQgHTYCDCAFKAIQIR4gBCgCDCEfIB4oAgAhICAgKAIMISEgHiAfICERBAAgBSgCECEiICIoAgAhIyAjKAIQISQgIiAkEQMAQQAhJSAFICU2AhAgBCgCKCEmICYoAhAhJyAFEIoCISggJygCACEpICkoAgwhKiAnICggKhEEACAEKAIoISsgKygCECEsICwoAgAhLSAtKAIQIS4gLCAuEQMAIAQoAighL0EAITAgLyAwNgIQIAUQigIhMSAFIDE2AhAgBCgCDCEyIAQoAighMyAzEIoCITQgMigCACE1IDUoAgwhNiAyIDQgNhEEACAEKAIMITcgNygCACE4IDgoAhAhOSA3IDkRAwAgBCgCKCE6IDoQigIhOyAEKAIoITwgPCA7NgIQDAELIAUoAhAhPSA9IT4gBSE/ID4gP0YhQEEBIUEgQCBBcSFCAkACQCBCRQ0AIAUoAhAhQyAEKAIoIUQgRBCKAiFFIEMoAgAhRiBGKAIMIUcgQyBFIEcRBAAgBSgCECFIIEgoAgAhSSBJKAIQIUogSCBKEQMAIAQoAighSyBLKAIQIUwgBSBMNgIQIAQoAighTSBNEIoCIU4gBCgCKCFPIE8gTjYCEAwBCyAEKAIoIVAgUCgCECFRIAQoAighUiBRIVMgUiFUIFMgVEYhVUEBIVYgVSBWcSFXAkACQCBXRQ0AIAQoAighWCBYKAIQIVkgBRCKAiFaIFkoAgAhWyBbKAIMIVwgWSBaIFwRBAAgBCgCKCFdIF0oAhAhXiBeKAIAIV8gXygCECFgIF4gYBEDACAFKAIQIWEgBCgCKCFiIGIgYTYCECAFEIoCIWMgBSBjNgIQDAELQRAhZCAFIGRqIWUgBCgCKCFmQRAhZyBmIGdqIWggZSBoEIsCCwsLQTAhaSAEIGlqIWogaiQADwskAQR/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQQgBA8LnwEBEn8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAUQjAIhBiAGKAIAIQcgBCAHNgIEIAQoAgghCCAIEIwCIQkgCSgCACEKIAQoAgwhCyALIAo2AgBBBCEMIAQgDGohDSANIQ4gDhCMAiEPIA8oAgAhECAEKAIIIREgESAQNgIAQRAhEiAEIBJqIRMgEyQADwskAQR/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQQgBA8LPgEHfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEI8CIQVBECEGIAMgBmohByAHJAAgBQ8LdgEOfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIIIQVBACEGIAUhByAGIQggByAIRiEJQQEhCiAJIApxIQsCQCALDQAgBSgCACEMIAwoAgQhDSAFIA0RAwALQRAhDiAEIA5qIQ8gDyQADwskAQR/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQQgBA8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQPC24BCX8jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACNgIEIAUoAgwhBiAFKAIIIQcgBxCSAiEIIAYgCBCTAhogBSgCBCEJIAkQrQEaIAYQlAIaQRAhCiAFIApqIQsgCyQAIAYPCyQBBH8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEDwtaAQl/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBhCSAiEHIAcoAgAhCCAFIAg2AgBBECEJIAQgCWohCiAKJAAgBQ8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgQgAygCBCEEIAQPCz4BB38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBCYAiEFQRAhBiADIAZqIQcgByQAIAUPCz4BB38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBCZAiEFQRAhBiADIAZqIQcgByQAIAUPC3YBDn8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCCCEFQQAhBiAFIQcgBiEIIAcgCEYhCUEBIQogCSAKcSELAkAgCw0AIAUoAgAhDCAMKAIEIQ0gBSANEQMAC0EQIQ4gBCAOaiEPIA8kAA8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQPCyQBBH8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEDwskAQR/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQQgBA8LWgEJfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAYQmgIhByAHKAIAIQggBSAINgIAQRAhCSAEIAlqIQogCiQAIAUPC9YDATN/IwAhA0EgIQQgAyAEayEFIAUkACAFIAA2AhggBSABNgIUIAUgAjYCECAFKAIYIQYgBSAGNgIcIAUoAhQhByAGIAcQnQIaQdANIQhBCCEJIAggCWohCiAKIQsgBiALNgIAQQAhDCAGIAw2AixBACENIAYgDToAMEE0IQ4gBiAOaiEPQQAhECAPIBAgEBATGkHEACERIAYgEWohEkEAIRMgEiATIBMQExpB1AAhFCAGIBRqIRVBACEWIBUgFiAWEBMaQQAhFyAGIBc2AnBBfyEYIAYgGDYCdEH8ACEZIAYgGWohGkEAIRsgGiAbIBsQExpBACEcIAYgHDoAjAFBACEdIAYgHToAjQFBkAEhHiAGIB5qIR9BgCAhICAfICAQngIaQaABISEgBiAhaiEiQYAgISMgIiAjEJ8CGkEAISQgBSAkNgIMAkADQCAFKAIMISUgBSgCECEmICUhJyAmISggJyAoSCEpQQEhKiApICpxISsgK0UNAUGgASEsIAYgLGohLUGUAiEuIC4Q0gUhLyAvEKACGiAtIC8QoQIaIAUoAgwhMEEBITEgMCAxaiEyIAUgMjYCDAwACwALIAUoAhwhM0EgITQgBSA0aiE1IDUkACAzDwulAgEffyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIIIAQgATYCBCAEKAIIIQUgBCAFNgIMQfgPIQZBCCEHIAYgB2ohCCAIIQkgBSAJNgIAQQQhCiAFIApqIQtBgCAhDCALIAwQogIaQQAhDSAFIA02AhRBACEOIAUgDjYCGEEKIQ8gBSAPNgIcQaCNBiEQIAUgEDYCIEEKIREgBSARNgIkQaCNBiESIAUgEjYCKEEAIRMgBCATNgIAAkADQCAEKAIAIRQgBCgCBCEVIBQhFiAVIRcgFiAXSCEYQQEhGSAYIBlxIRogGkUNASAFEKMCGiAEKAIAIRtBASEcIBsgHGohHSAEIB02AgAMAAsACyAEKAIMIR5BECEfIAQgH2ohICAgJAAgHg8LTAEHfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUgBhAeGkEQIQcgBCAHaiEIIAgkACAFDwtMAQd/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGEB4aQRAhByAEIAdqIQggCCQAIAUPC3oBDX8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBACEFIAQgBToAAEGEAiEGIAQgBmohByAHEKUCGkEBIQggBCAIaiEJQZARIQogAyAKNgIAQa8PIQsgCSALIAMQiwUaQRAhDCADIAxqIQ0gDSQAIAQPC4oCASB/IwAhAkEgIQMgAiADayEEIAQkACAEIAA2AhggBCABNgIUIAQoAhghBSAFEKQCIQYgBCAGNgIQIAQoAhAhB0EBIQggByAIaiEJQQIhCiAJIAp0IQtBACEMQQEhDSAMIA1xIQ4gBSALIA4QtgEhDyAEIA82AgwgBCgCDCEQQQAhESAQIRIgESETIBIgE0chFEEBIRUgFCAVcSEWAkACQCAWRQ0AIAQoAhQhFyAEKAIMIRggBCgCECEZQQIhGiAZIBp0IRsgGCAbaiEcIBwgFzYCACAEKAIUIR0gBCAdNgIcDAELQQAhHiAEIB42AhwLIAQoAhwhH0EgISAgBCAgaiEhICEkACAfDwtMAQd/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGEB4aQRAhByAEIAdqIQggCCQAIAUPC10BC38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBBCEFIAQgBWohBkHIASEHIAcQ0gUhCCAIENQBGiAGIAgQtQIhCUEQIQogAyAKaiELIAskACAJDwtIAQl/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQUCEFQQIhBiAFIAZ2IQdBECEIIAMgCGohCSAJJAAgBw8LRAEHfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBEGAICEFIAQgBRC5AhpBECEGIAMgBmohByAHJAAgBA8L5wEBHH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRB0A0hBUEIIQYgBSAGaiEHIAchCCAEIAg2AgBBoAEhCSAEIAlqIQpBASELQQAhDEEBIQ0gCyANcSEOIAogDiAMEKcCQaABIQ8gBCAPaiEQIBAQqAIaQZABIREgBCARaiESIBIQqQIaQfwAIRMgBCATaiEUIBQQMRpB1AAhFSAEIBVqIRYgFhAxGkHEACEXIAQgF2ohGCAYEDEaQTQhGSAEIBlqIRogGhAxGiAEEKoCGkEQIRsgAyAbaiEcIBwkACAEDwvQAwE6fyMAIQNBICEEIAMgBGshBSAFJAAgBSAANgIcIAEhBiAFIAY6ABsgBSACNgIUIAUoAhwhByAFLQAbIQhBASEJIAggCXEhCgJAIApFDQAgBxCkAiELQQEhDCALIAxrIQ0gBSANNgIQAkADQCAFKAIQIQ5BACEPIA4hECAPIREgECARTiESQQEhEyASIBNxIRQgFEUNASAFKAIQIRUgByAVEKsCIRYgBSAWNgIMIAUoAgwhF0EAIRggFyEZIBghGiAZIBpHIRtBASEcIBsgHHEhHQJAIB1FDQAgBSgCFCEeQQAhHyAeISAgHyEhICAgIUchIkEBISMgIiAjcSEkAkACQCAkRQ0AIAUoAhQhJSAFKAIMISYgJiAlEQMADAELIAUoAgwhJ0EAISggJyEpICghKiApICpGIStBASEsICsgLHEhLQJAIC0NACAnEKwCGiAnENMFCwsLIAUoAhAhLkECIS8gLiAvdCEwQQAhMUEBITIgMSAycSEzIAcgMCAzEK8BGiAFKAIQITRBfyE1IDQgNWohNiAFIDY2AhAMAAsACwtBACE3QQAhOEEBITkgOCA5cSE6IAcgNyA6EK8BGkEgITsgBSA7aiE8IDwkAA8LPAEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEDcaQRAhBSADIAVqIQYgBiQAIAQPCzwBBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBA3GkEQIQUgAyAFaiEGIAYkACAEDwuKAQESfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBEH4DyEFQQghBiAFIAZqIQcgByEIIAQgCDYCAEEEIQkgBCAJaiEKQQEhC0EAIQxBASENIAsgDXEhDiAKIA4gDBDDAkEEIQ8gBCAPaiEQIBAQtgIaQRAhESADIBFqIRIgEiQAIAQPC/QBAR9/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgggBCABNgIEIAQoAgghBSAFEFEhBiAEIAY2AgAgBCgCACEHQQAhCCAHIQkgCCEKIAkgCkchC0EBIQwgCyAMcSENAkACQCANRQ0AIAQoAgQhDiAFEFAhD0ECIRAgDyAQdiERIA4hEiARIRMgEiATSSEUQQEhFSAUIBVxIRYgFkUNACAEKAIAIRcgBCgCBCEYQQIhGSAYIBl0IRogFyAaaiEbIBsoAgAhHCAEIBw2AgwMAQtBACEdIAQgHTYCDAsgBCgCDCEeQRAhHyAEIB9qISAgICQAIB4PC0kBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBhAIhBSAEIAVqIQYgBhC4AhpBECEHIAMgB2ohCCAIJAAgBA8LGwEDfyMAIQFBECECIAEgAmshAyADIAA2AgwAC/kDAj9/AnwjACECQTAhAyACIANrIQQgBCQAIAQgADYCLCAEIAE2AiggBCgCLCEFQQEhBiAEIAY6ACdBBCEHIAUgB2ohCCAIEDwhCSAEIAk2AhxBACEKIAQgCjYCIANAIAQoAiAhCyAEKAIcIQwgCyENIAwhDiANIA5IIQ9BACEQQQEhESAPIBFxIRIgECETAkAgEkUNACAELQAnIRQgFCETCyATIRVBASEWIBUgFnEhFwJAIBdFDQBBBCEYIAUgGGohGSAEKAIgIRogGSAaEEshGyAEIBs2AhggBCgCICEcIAQoAhghHSAdEPkBIR4gBCgCGCEfIB8QSSFBIAQgQTkDCCAEIB42AgQgBCAcNgIAQZQPISBBhA8hIUHwACEiICEgIiAgIAQQrwIgBCgCGCEjICMQSSFCIAQgQjkDECAEKAIoISRBECElIAQgJWohJiAmIScgJCAnELACIShBACEpICghKiApISsgKiArSiEsQQEhLSAsIC1xIS4gBC0AJyEvQQEhMCAvIDBxITEgMSAucSEyQQAhMyAyITQgMyE1IDQgNUchNkEBITcgNiA3cSE4IAQgODoAJyAEKAIgITlBASE6IDkgOmohOyAEIDs2AiAMAQsLIAQtACchPEEBIT0gPCA9cSE+QTAhPyAEID9qIUAgQCQAID4PCykBA38jACEEQRAhBSAEIAVrIQYgBiAANgIMIAYgATYCCCAGIAI2AgQPC1QBCX8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBkEIIQcgBSAGIAcQsQIhCEEQIQkgBCAJaiEKIAokACAIDwu1AQETfyMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCDCEGIAYQugIhByAFIAc2AgAgBSgCACEIIAUoAgQhCSAIIAlqIQpBASELQQEhDCALIAxxIQ0gBiAKIA0QuwIaIAYQvAIhDiAFKAIAIQ8gDiAPaiEQIAUoAgghESAFKAIEIRIgECARIBIQigYaIAYQugIhE0EQIRQgBSAUaiEVIBUkACATDwvsAwI2fwN8IwAhA0HAACEEIAMgBGshBSAFJAAgBSAANgI8IAUgATYCOCAFIAI2AjQgBSgCPCEGQQQhByAGIAdqIQggCBA8IQkgBSAJNgIsIAUoAjQhCiAFIAo2AihBACELIAUgCzYCMANAIAUoAjAhDCAFKAIsIQ0gDCEOIA0hDyAOIA9IIRBBACERQQEhEiAQIBJxIRMgESEUAkAgE0UNACAFKAIoIRVBACEWIBUhFyAWIRggFyAYTiEZIBkhFAsgFCEaQQEhGyAaIBtxIRwCQCAcRQ0AQQQhHSAGIB1qIR4gBSgCMCEfIB4gHxBLISAgBSAgNgIkQQAhISAhtyE5IAUgOTkDGCAFKAI4ISIgBSgCKCEjQRghJCAFICRqISUgJSEmICIgJiAjELMCIScgBSAnNgIoIAUoAiQhKCAFKwMYITogKCA6EFYgBSgCMCEpIAUoAiQhKiAqEPkBISsgBSgCJCEsICwQSSE7IAUgOzkDCCAFICs2AgQgBSApNgIAQZQPIS1BnQ8hLkGCASEvIC4gLyAtIAUQrwIgBSgCMCEwQQEhMSAwIDFqITIgBSAyNgIwDAELCyAGKAIAITMgMygCKCE0QQIhNSAGIDUgNBEEACAFKAIoITZBwAAhNyAFIDdqITggOCQAIDYPC2QBCn8jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACNgIEIAUoAgwhBiAFKAIIIQcgBSgCBCEIQQghCSAGIAcgCSAIELQCIQpBECELIAUgC2ohDCAMJAAgCg8LfgEMfyMAIQRBECEFIAQgBWshBiAGJAAgBiAANgIMIAYgATYCCCAGIAI2AgQgBiADNgIAIAYoAgwhByAHELwCIQggBxC3AiEJIAYoAgghCiAGKAIEIQsgBigCACEMIAggCSAKIAsgDBC+AiENQRAhDiAGIA5qIQ8gDyQAIA0PC4kCASB/IwAhAkEgIQMgAiADayEEIAQkACAEIAA2AhggBCABNgIUIAQoAhghBSAFEDwhBiAEIAY2AhAgBCgCECEHQQEhCCAHIAhqIQlBAiEKIAkgCnQhC0EAIQxBASENIAwgDXEhDiAFIAsgDhC2ASEPIAQgDzYCDCAEKAIMIRBBACERIBAhEiARIRMgEiATRyEUQQEhFSAUIBVxIRYCQAJAIBZFDQAgBCgCFCEXIAQoAgwhGCAEKAIQIRlBAiEaIBkgGnQhGyAYIBtqIRwgHCAXNgIAIAQoAhQhHSAEIB02AhwMAQtBACEeIAQgHjYCHAsgBCgCHCEfQSAhICAEICBqISEgISQAIB8PCzwBBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBA3GkEQIQUgAyAFaiEGIAYkACAEDws+AQd/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQugIhBUEQIQYgAyAGaiEHIAckACAFDws9AQZ/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQvQIaQRAhBSADIAVqIQYgBiQAIAQPC0wBB38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFIAYQHhpBECEHIAQgB2ohCCAIJAAgBQ8LSAEJfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEFAhBUEAIQYgBSAGdiEHQRAhCCADIAhqIQkgCSQAIAcPC3gBDn8jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggAiEGIAUgBjoAByAFKAIMIQcgBSgCCCEIQQAhCSAIIAl0IQogBS0AByELQQEhDCALIAxxIQ0gByAKIA0QrwEhDkEQIQ8gBSAPaiEQIBAkACAODws9AQd/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQUSEFQRAhBiADIAZqIQcgByQAIAUPCzwBBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBA3GkEQIQUgAyAFaiEGIAYkACAEDwuUAgEefyMAIQVBICEGIAUgBmshByAHJAAgByAANgIYIAcgATYCFCAHIAI2AhAgByADNgIMIAcgBDYCCCAHKAIIIQggBygCDCEJIAggCWohCiAHIAo2AgQgBygCCCELQQAhDCALIQ0gDCEOIA0gDk4hD0EBIRAgDyAQcSERAkACQCARRQ0AIAcoAgQhEiAHKAIUIRMgEiEUIBMhFSAUIBVMIRZBASEXIBYgF3EhGCAYRQ0AIAcoAhAhGSAHKAIYIRogBygCCCEbIBogG2ohHCAHKAIMIR0gGSAcIB0QigYaIAcoAgQhHiAHIB42AhwMAQtBfyEfIAcgHzYCHAsgBygCHCEgQSAhISAHICFqISIgIiQAICAPCxsBA38jACEBQRAhAiABIAJrIQMgAyAANgIMDwtFAQd/IwAhBEEQIQUgBCAFayEGIAYgADYCDCAGIAE2AgggBiACNgIEIAMhByAGIAc6AANBACEIQQEhCSAIIAlxIQogCg8LIgEDfyMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIDwsiAQN/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AggPC84DATp/IwAhA0EgIQQgAyAEayEFIAUkACAFIAA2AhwgASEGIAUgBjoAGyAFIAI2AhQgBSgCHCEHIAUtABshCEEBIQkgCCAJcSEKAkAgCkUNACAHEDwhC0EBIQwgCyAMayENIAUgDTYCEAJAA0AgBSgCECEOQQAhDyAOIRAgDyERIBAgEU4hEkEBIRMgEiATcSEUIBRFDQEgBSgCECEVIAcgFRBLIRYgBSAWNgIMIAUoAgwhF0EAIRggFyEZIBghGiAZIBpHIRtBASEcIBsgHHEhHQJAIB1FDQAgBSgCFCEeQQAhHyAeISAgHyEhICAgIUchIkEBISMgIiAjcSEkAkACQCAkRQ0AIAUoAhQhJSAFKAIMISYgJiAlEQMADAELIAUoAgwhJ0EAISggJyEpICghKiApICpGIStBASEsICsgLHEhLQJAIC0NACAnEMUCGiAnENMFCwsLIAUoAhAhLkECIS8gLiAvdCEwQQAhMUEBITIgMSAycSEzIAcgMCAzEK8BGiAFKAIQITRBfyE1IDQgNWohNiAFIDY2AhAMAAsACwtBACE3QQAhOEEBITkgOCA5cSE6IAcgNyA6EK8BGkEgITsgBSA7aiE8IDwkAA8LGwEDfyMAIQFBECECIAEgAmshAyADIAA2AgwAC20BDH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBuAEhBSAEIAVqIQYgBhDGAhpBoAEhByAEIAdqIQggCBDpARpBmAEhCSAEIAlqIQogChDuARpBECELIAMgC2ohDCAMJAAgBA8LPAEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEDcaQRAhBSADIAVqIQYgBiQAIAQPC44BARV/IwAhAEEQIQEgACABayECIAIkAEEIIQMgAiADaiEEIAQhBSAFEMgCIQZBACEHIAYhCCAHIQkgCCAJRiEKQQAhC0EBIQwgCiAMcSENIAshDgJAIA0NAEGACCEPIAYgD2ohECAQIQ4LIA4hESACIBE2AgwgAigCDCESQRAhEyACIBNqIRQgFCQAIBIPC/cBAR9/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgxBACEEIAQtANg/IQVBASEGIAUgBnEhB0EAIQhB/wEhCSAHIAlxIQpB/wEhCyAIIAtxIQwgCiAMRiENQQEhDiANIA5xIQ8CQCAPRQ0AQdg/IRAgEBDVBSERIBFFDQBBuD8hEiASEMkCGkHZACETQQAhFEGACCEVIBMgFCAVEAIaQdg/IRYgFhDdBQsgAyEXQbg/IRggFyAYEMsCGkGYCCEZIBkQ0gUhGiADKAIMIRtB2gAhHCAaIBsgHBECABogAyEdIB0QzAIaQRAhHiADIB5qIR8gHyQAIBoPC5MBARN/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQQghBSADIAVqIQYgBiEHIAcQvgUaQQghCCADIAhqIQkgCSEKQQEhCyAKIAsQvwUaQQghDCADIAxqIQ0gDSEOIAQgDhC6BRpBCCEPIAMgD2ohECAQIREgERDABRpBECESIAMgEmohEyATJAAgBA8LOQEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMQbg/IQQgBBDNAhpBECEFIAMgBWohBiAGJAAPC5MBARB/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgggBCABNgIEIAQoAgghBSAEIAU2AgwgBCgCBCEGIAUgBjYCACAEKAIEIQdBACEIIAchCSAIIQogCSAKRyELQQEhDCALIAxxIQ0CQCANRQ0AIAQoAgQhDiAOEM4CCyAEKAIMIQ9BECEQIAQgEGohESARJAAgDw8LfgEPfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIIIAMoAgghBCADIAQ2AgwgBCgCACEFQQAhBiAFIQcgBiEIIAcgCEchCUEBIQogCSAKcSELAkAgC0UNACAEKAIAIQwgDBDPAgsgAygCDCENQRAhDiADIA5qIQ8gDyQAIA0PCz0BBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBC9BRpBECEFIAMgBWohBiAGJAAgBA8LOwEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEELsFGkEQIQUgAyAFaiEGIAYkAA8LOwEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEELwFGkEQIQUgAyAFaiEGIAYkAA8L1gMDOX8BfgN8IwAhAkGQASEDIAIgA2shBCAEJAAgBCAANgKMASAEIAE2AogBIAQoAowBIQUgBCgCiAEhBkEwIQcgBCAHaiEIIAghCUEBIQogCSAKIAoQ0QJBMCELIAQgC2ohDCAMIQ0gBSAGIA0Q7AIaQZwSIQ5BCCEPIA4gD2ohECAQIREgBSARNgIAQZwSIRJB0AIhEyASIBNqIRQgFCEVIAUgFTYCyAZBnBIhFkGIAyEXIBYgF2ohGCAYIRkgBSAZNgKACEEAIRogBSAaEFMhG0EgIRwgBCAcaiEdIB0hHkIAITsgHiA7NwMAQQghHyAeIB9qISAgICA7NwMAQSAhISAEICFqISIgIiEjICMQ3wEaQSAhJCAEICRqISUgJSEmQQghJyAEICdqISggKCEpQQAhKiApICoQ1wEaQdgVIStBACEsICy3ITxEAAAAAAAAWUAhPUR7FK5H4XqEPyE+Qd0VIS1B3xUhLkEVIS9BCCEwIAQgMGohMSAxITIgGyArIDwgPCA9ID4gLSAsIC4gJiAvIDIQ6AFBCCEzIAQgM2ohNCA0ITUgNRDpARpBICE2IAQgNmohNyA3ITggOBDqARpBkAEhOSAEIDlqITogOiQAIAUPC4UCASF/IwAhA0EQIQQgAyAEayEFIAUkACAFIAE2AgwgBSACNgIIIAUoAgwhBiAFKAIIIQdB/BUhCEGAFiEJQYsWIQpBgAwhC0HCxp2SAyEMQeXajYsEIQ1BACEOQQAhD0EBIRBB6gghEUHIBiESQYACIRNBgMAAIRRB3xUhFUEBIRYgDyAWcSEXQQEhGCAPIBhxIRlBASEaIA8gGnEhG0EBIRwgDyAccSEdQQEhHiAQIB5xIR9BASEgIBAgIHEhISAAIAYgByAIIAkgCSAKIAsgDCANIA4gFyAZIBsgHSAOIB8gESASICEgEyAUIBMgFCAVENICGkEQISIgBSAiaiEjICMkAA8L9wQBLn8jACEZQeAAIRogGSAaayEbIBsgADYCXCAbIAE2AlggGyACNgJUIBsgAzYCUCAbIAQ2AkwgGyAFNgJIIBsgBjYCRCAbIAc2AkAgGyAINgI8IBsgCTYCOCAbIAo2AjQgCyEcIBsgHDoAMyAMIR0gGyAdOgAyIA0hHiAbIB46ADEgDiEfIBsgHzoAMCAbIA82AiwgECEgIBsgIDoAKyAbIBE2AiQgGyASNgIgIBMhISAbICE6AB8gGyAUNgIYIBsgFTYCFCAbIBY2AhAgGyAXNgIMIBsgGDYCCCAbKAJcISIgGygCWCEjICIgIzYCACAbKAJUISQgIiAkNgIEIBsoAlAhJSAiICU2AgggGygCTCEmICIgJjYCDCAbKAJIIScgIiAnNgIQIBsoAkQhKCAiICg2AhQgGygCQCEpICIgKTYCGCAbKAI8ISogIiAqNgIcIBsoAjghKyAiICs2AiAgGygCNCEsICIgLDYCJCAbLQAzIS1BASEuIC0gLnEhLyAiIC86ACggGy0AMiEwQQEhMSAwIDFxITIgIiAyOgApIBstADEhM0EBITQgMyA0cSE1ICIgNToAKiAbLQAwITZBASE3IDYgN3EhOCAiIDg6ACsgGygCLCE5ICIgOTYCLCAbLQArITpBASE7IDogO3EhPCAiIDw6ADAgGygCJCE9ICIgPTYCNCAbKAIgIT4gIiA+NgI4IBsoAhghPyAiID82AjwgGygCFCFAICIgQDYCQCAbKAIQIUEgIiBBNgJEIBsoAgwhQiAiIEI2AkggGy0AHyFDQQEhRCBDIERxIUUgIiBFOgBMIBsoAgghRiAiIEY2AlAgIg8L6QMDNH8GfAJ9IwAhBEEwIQUgBCAFayEGIAYkACAGIAA2AiwgBiABNgIoIAYgAjYCJCAGIAM2AiAgBigCLCEHQcgGIQggByAIaiEJIAkQ1AIhCiAGIAo2AhxBACELIAcgCxBTIQwgDBBJIThEAAAAAAAAWUAhOSA4IDmjITogBiA6OQMQQQAhDSAGIA02AgwCQANAIAYoAgwhDiAGKAIgIQ8gDiEQIA8hESAQIBFIIRJBASETIBIgE3EhFCAURQ0BQQAhFSAGIBU2AggCQANAIAYoAgghFiAGKAIcIRcgFiEYIBchGSAYIBlIIRpBASEbIBogG3EhHCAcRQ0BIAYoAighHSAGKAIIIR5BAiEfIB4gH3QhICAdICBqISEgISgCACEiIAYoAgwhIyAjIB90ISQgIiAkaiElICUqAgAhPiA+uyE7IAYrAxAhPCA7IDyiIT0gPbYhPyAGKAIkISYgBigCCCEnQQIhKCAnICh0ISkgJiApaiEqICooAgAhKyAGKAIMISxBAiEtICwgLXQhLiArIC5qIS8gLyA/OAIAIAYoAgghMEEBITEgMCAxaiEyIAYgMjYCCAwACwALIAYoAgwhM0EBITQgMyA0aiE1IAYgNTYCDAwACwALQTAhNiAGIDZqITcgNyQADwtEAQh/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQQEhBSAEIAUQ1QMhBkEQIQcgAyAHaiEIIAgkACAGDwt2AQt/IwAhBEEQIQUgBCAFayEGIAYkACAGIAA2AgwgBiABNgIIIAYgAjYCBCAGIAM2AgAgBigCDCEHQbh5IQggByAIaiEJIAYoAgghCiAGKAIEIQsgBigCACEMIAkgCiALIAwQ0wJBECENIAYgDWohDiAOJAAPCz0BBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBDXAhpBECEFIAMgBWohBiAGJAAgBA8LYAEKfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBEGACCEFIAQgBWohBiAGEOsCGkHIBiEHIAQgB2ohCCAIEMEDGiAEECoaQRAhCSADIAlqIQogCiQAIAQPC0ABBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBDWAhogBBDTBUEQIQUgAyAFaiEGIAYkAA8LGwEDfyMAIQFBECECIAEgAmshAyADIAA2AgwPCyIBA38jACECQRAhAyACIANrIQQgBCAANgIMIAQgATYCCA8LIgEDfyMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIDwszAQZ/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AghBACEFQQEhBiAFIAZxIQcgBw8LMwEGfyMAIQJBECEDIAIgA2shBCAEIAA2AgwgBCABNgIIQQAhBUEBIQYgBSAGcSEHIAcPC1EBCX8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCCCADKAIIIQQgAyAENgIMQbh5IQUgBCAFaiEGIAYQ1gIhB0EQIQggAyAIaiEJIAkkACAHDwtGAQh/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQbh5IQUgBCAFaiEGIAYQ2AJBECEHIAMgB2ohCCAIJAAPCyIBA38jACECQRAhAyACIANrIQQgBCAANgIMIAQgATYCCA8LGwEDfyMAIQFBECECIAEgAmshAyADIAA2AgwPCyYBBH8jACECQRAhAyACIANrIQQgBCAANgIMIAEhBSAEIAU6AAsPC2UBDH8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFQbh5IQYgBSAGaiEHIAQoAgghCCAHIAgQ3AIhCUEBIQogCSAKcSELQRAhDCAEIAxqIQ0gDSQAIAsPC2UBDH8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFQbh5IQYgBSAGaiEHIAQoAgghCCAHIAgQ3QIhCUEBIQogCSAKcSELQRAhDCAEIAxqIQ0gDSQAIAsPC1YBCX8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFQbh5IQYgBSAGaiEHIAQoAgghCCAHIAgQ2wJBECEJIAQgCWohCiAKJAAPC0YBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBgHghBSAEIAVqIQYgBhDZAkEQIQcgAyAHaiEIIAgkAA8LVgEJfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQVBgHghBiAFIAZqIQcgBCgCCCEIIAcgCBDaAkEQIQkgBCAJaiEKIAokAA8LUQEJfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIIIAMoAgghBCADIAQ2AgxBgHghBSAEIAVqIQYgBhDWAiEHQRAhCCADIAhqIQkgCSQAIAcPC0YBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBgHghBSAEIAVqIQYgBhDYAkEQIQcgAyAHaiEIIAgkAA8LKQEDfyMAIQNBECEEIAMgBGshBSAFIAA2AgwgBSABNgIIIAUgAjYCBA8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQPC+MDATx/IwAhA0HAASEEIAMgBGshBSAFJAAgBSAANgK8ASAFIAE2ArgBIAUgAjYCtAEgBSgCvAEhBiAFKAK0ASEHQeAAIQggBSAIaiEJIAkhCkHUACELIAogByALEIoGGkHUACEMQQQhDSAFIA1qIQ5B4AAhDyAFIA9qIRAgDiAQIAwQigYaQQYhEUEEIRIgBSASaiETIAYgEyAREBIaQcgGIRQgBiAUaiEVIAUoArQBIRZBBiEXIBUgFiAXEKsDGkGACCEYIAYgGGohGSAZEO0CGkGUFiEaQQghGyAaIBtqIRwgHCEdIAYgHTYCAEGUFiEeQcwCIR8gHiAfaiEgICAhISAGICE2AsgGQZQWISJBhAMhIyAiICNqISQgJCElIAYgJTYCgAhByAYhJiAGICZqISdBACEoICcgKBDuAiEpIAUgKTYCXEHIBiEqIAYgKmohK0EBISwgKyAsEO4CIS0gBSAtNgJYQcgGIS4gBiAuaiEvIAUoAlwhMEEAITFBASEyQQEhMyAyIDNxITQgLyAxIDEgMCA0ENcDQcgGITUgBiA1aiE2IAUoAlghN0EBIThBACE5QQEhOkEBITsgOiA7cSE8IDYgOCA5IDcgPBDXA0HAASE9IAUgPWohPiA+JAAgBg8LPwEIfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEQfwbIQVBCCEGIAUgBmohByAHIQggBCAINgIAIAQPC2oBDX8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFQdQAIQYgBSAGaiEHIAQoAgghCEEEIQkgCCAJdCEKIAcgCmohCyALEO8CIQxBECENIAQgDWohDiAOJAAgDA8LSAEJfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEFAhBUECIQYgBSAGdiEHQRAhCCADIAhqIQkgCSQAIAcPC44GAmJ/AXwjACEEQTAhBSAEIAVrIQYgBiQAIAYgADYCLCAGIAE2AiggBiACNgIkIAYgAzYCICAGKAIsIQdByAYhCCAHIAhqIQkgBigCJCEKIAq4IWYgCSBmEPECQcgGIQsgByALaiEMIAYoAighDSAMIA0Q5ANBECEOIAYgDmohDyAPIRBBACERIBAgESAREBMaQRAhEiAGIBJqIRMgEyEUQcwZIRVBACEWIBQgFSAWEBlByAYhFyAHIBdqIRhBACEZIBggGRDuAiEaQcgGIRsgByAbaiEcQQEhHSAcIB0Q7gIhHiAGIB42AgQgBiAaNgIAQc8ZIR9BgMAAISBBECEhIAYgIWohIiAiICAgHyAGEPsBQawaISNBACEkQYDAACElQRAhJiAGICZqIScgJyAlICMgJBD7AUEAISggBiAoNgIMAkADQCAGKAIMISkgBxA6ISogKSErICohLCArICxIIS1BASEuIC0gLnEhLyAvRQ0BIAYoAgwhMCAHIDAQUyExIAYgMTYCCCAGKAIIITIgBigCDCEzQRAhNCAGIDRqITUgNSE2IDIgNiAzEPoBIAYoAgwhNyAHEDohOEEBITkgOCA5ayE6IDchOyA6ITwgOyA8SCE9QQEhPiA9ID5xIT8CQAJAID9FDQBBvRohQEEAIUFBgMAAIUJBECFDIAYgQ2ohRCBEIEIgQCBBEPsBDAELQcAaIUVBACFGQYDAACFHQRAhSCAGIEhqIUkgSSBHIEUgRhD7AQsgBigCDCFKQQEhSyBKIEtqIUwgBiBMNgIMDAALAAtBECFNIAYgTWohTiBOIU9BwhohUEEAIVEgTyBQIFEQ8gIgBygCACFSIFIoAighU0EAIVQgByBUIFMRBABByAYhVSAHIFVqIVYgBygCyAYhVyBXKAIUIVggViBYEQMAQYAIIVkgByBZaiFaQcYaIVtBACFcIFogWyBcIFwQoANBECFdIAYgXWohXiBeIV8gXxBOIWBBECFhIAYgYWohYiBiIWMgYxAxGkEwIWQgBiBkaiFlIGUkACBgDws5AgR/AXwjACECQRAhAyACIANrIQQgBCAANgIMIAQgATkDACAEKAIMIQUgBCsDACEGIAUgBjkDEA8LlwMBNH8jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACNgIEIAUoAgwhBkEAIQcgBSAHNgIAIAUoAgghCEEAIQkgCCEKIAkhCyAKIAtHIQxBASENIAwgDXEhDgJAIA5FDQAgBSgCBCEPQQAhECAPIREgECESIBEgEkohE0EBIRQgEyAUcSEVAkACQCAVRQ0AA0AgBSgCACEWIAUoAgQhFyAWIRggFyEZIBggGUghGkEAIRtBASEcIBogHHEhHSAbIR4CQCAdRQ0AIAUoAgghHyAFKAIAISAgHyAgaiEhICEtAAAhIkEAISNB/wEhJCAiICRxISVB/wEhJiAjICZxIScgJSAnRyEoICghHgsgHiEpQQEhKiApICpxISsCQCArRQ0AIAUoAgAhLEEBIS0gLCAtaiEuIAUgLjYCAAwBCwsMAQsgBSgCCCEvIC8QkQYhMCAFIDA2AgALCyAGELUBITEgBSgCCCEyIAUoAgAhM0EAITQgBiAxIDIgMyA0ECdBECE1IAUgNWohNiA2JAAPC3oBDH8jACEEQRAhBSAEIAVrIQYgBiQAIAYgADYCDCAGIAE2AgggBiACNgIEIAYgAzYCACAGKAIMIQdBgHghCCAHIAhqIQkgBigCCCEKIAYoAgQhCyAGKAIAIQwgCSAKIAsgDBDwAiENQRAhDiAGIA5qIQ8gDyQAIA0PC8oDAjt/AX0jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACNgIEIAUoAgwhBkHIBiEHIAYgB2ohCCAIEPUCIQkgBSAJNgIAQcgGIQogBiAKaiELQcgGIQwgBiAMaiENQQAhDiANIA4Q7gIhD0HIBiEQIAYgEGohESAREPYCIRJBfyETIBIgE3MhFEEAIRVBASEWIBQgFnEhFyALIBUgFSAPIBcQ1wNByAYhGCAGIBhqIRlByAYhGiAGIBpqIRtBASEcIBsgHBDuAiEdQQEhHkEAIR9BASEgQQEhISAgICFxISIgGSAeIB8gHSAiENcDQcgGISMgBiAjaiEkQcgGISUgBiAlaiEmQQAhJyAmICcQ1QMhKCAFKAIIISkgKSgCACEqIAUoAgAhK0EAISwgJCAsICwgKCAqICsQ4gNByAYhLSAGIC1qIS5ByAYhLyAGIC9qITBBASExIDAgMRDVAyEyIAUoAgghMyAzKAIEITQgBSgCACE1QQEhNkEAITcgLiA2IDcgMiA0IDUQ4gNByAYhOCAGIDhqITkgBSgCACE6QQAhOyA7siE+IDkgPiA6EOMDQRAhPCAFIDxqIT0gPSQADwsrAQV/IwAhAUEQIQIgASACayEDIAMgADYCDCADKAIMIQQgBCgCGCEFIAUPC0kBC38jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEKAIEIQVBASEGIAUhByAGIQggByAIRiEJQQEhCiAJIApxIQsgCw8LZgEKfyMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCDCEGQYB4IQcgBiAHaiEIIAUoAgghCSAFKAIEIQogCCAJIAoQ9AJBECELIAUgC2ohDCAMJAAPC/sCAi1/AnwjACEBQSAhAiABIAJrIQMgAyQAIAMgADYCHCADKAIcIQQCQANAQcQBIQUgBCAFaiEGIAYQPyEHIAdFDQFBCCEIIAMgCGohCSAJIQpBfyELQQAhDCAMtyEuIAogCyAuEEAaQcQBIQ0gBCANaiEOQQghDyADIA9qIRAgECERIA4gERBBGiADKAIIIRIgAysDECEvIAQoAgAhEyATKAJYIRRBACEVQQEhFiAVIBZxIRcgBCASIC8gFyAUERAADAALAAsCQANAQfQBIRggBCAYaiEZIBkQQiEaIBpFDQEgAyEbQQAhHEEAIR1B/wEhHiAdIB5xIR9B/wEhICAdICBxISFB/wEhIiAdICJxISMgGyAcIB8gISAjEEMaQfQBISQgBCAkaiElIAMhJiAlICYQRBogBCgCACEnICcoAlAhKCADISkgBCApICgRBAAMAAsACyAEKAIAISogKigC0AEhKyAEICsRAwBBICEsIAMgLGohLSAtJAAPC5cGAl9/AX4jACEEQcAAIQUgBCAFayEGIAYkACAGIAA2AjwgBiABNgI4IAYgAjYCNCAGIAM5AyggBigCPCEHIAYoAjghCEHVGiEJIAggCRCCBSEKAkACQCAKDQAgBxD4AgwBCyAGKAI4IQtB2hohDCALIAwQggUhDQJAAkAgDQ0AIAYoAjQhDkHhGiEPIA4gDxD8BCEQIAYgEDYCIEEAIREgBiARNgIcAkADQCAGKAIgIRJBACETIBIhFCATIRUgFCAVRyEWQQEhFyAWIBdxIRggGEUNASAGKAIgIRkgGRCzBSEaIAYoAhwhG0EBIRwgGyAcaiEdIAYgHTYCHEElIR4gBiAeaiEfIB8hICAgIBtqISEgISAaOgAAQQAhIkHhGiEjICIgIxD8BCEkIAYgJDYCIAwACwALIAYtACUhJSAGLQAmISYgBi0AJyEnQRAhKCAGIChqISkgKSEqQQAhK0H/ASEsICUgLHEhLUH/ASEuICYgLnEhL0H/ASEwICcgMHEhMSAqICsgLSAvIDEQQxpByAYhMiAHIDJqITMgBygCyAYhNCA0KAIMITVBECE2IAYgNmohNyA3ITggMyA4IDURBAAMAQsgBigCOCE5QeMaITogOSA6EIIFITsCQCA7DQBBCCE8IAYgPGohPSA9IT5BACE/ID8pAuwaIWMgPiBjNwIAIAYoAjQhQEHhGiFBIEAgQRD8BCFCIAYgQjYCBEEAIUMgBiBDNgIAAkADQCAGKAIEIURBACFFIEQhRiBFIUcgRiBHRyFIQQEhSSBIIElxIUogSkUNASAGKAIEIUsgSxCzBSFMIAYoAgAhTUEBIU4gTSBOaiFPIAYgTzYCAEEIIVAgBiBQaiFRIFEhUkECIVMgTSBTdCFUIFIgVGohVSBVIEw2AgBBACFWQeEaIVcgViBXEPwEIVggBiBYNgIEDAALAAsgBigCCCFZIAYoAgwhWkEIIVsgBiBbaiFcIFwhXSAHKAIAIV4gXigCNCFfQQghYCAHIFkgWiBgIF0gXxEMABoLCwtBwAAhYSAGIGFqIWIgYiQADwt4Agp/AXwjACEEQSAhBSAEIAVrIQYgBiQAIAYgADYCHCAGIAE2AhggBiACNgIUIAYgAzkDCCAGKAIcIQdBgHghCCAHIAhqIQkgBigCGCEKIAYoAhQhCyAGKwMIIQ4gCSAKIAsgDhD5AkEgIQwgBiAMaiENIA0kAA8LMAEDfyMAIQRBECEFIAQgBWshBiAGIAA2AgwgBiABNgIIIAYgAjYCBCAGIAM2AgAPC3YBC38jACEEQRAhBSAEIAVrIQYgBiQAIAYgADYCDCAGIAE2AgggBiACNgIEIAYgAzYCACAGKAIMIQdBgHghCCAHIAhqIQkgBigCCCEKIAYoAgQhCyAGKAIAIQwgCSAKIAsgDBD7AkEQIQ0gBiANaiEOIA4kAA8L0wMBOH8jACEFQTAhBiAFIAZrIQcgByQAIAcgADYCLCAHIAE2AiggByACNgIkIAcgAzYCICAHIAQ2AhwgBygCLCEIIAcoAighCUHjGiEKIAkgChCCBSELAkACQCALDQBBACEMIAcgDDYCGCAHKAIgIQ0gBygCHCEOQRAhDyAHIA9qIRAgECERIBEgDSAOEP4CGiAHKAIYIRJBECETIAcgE2ohFCAUIRVBDCEWIAcgFmohFyAXIRggFSAYIBIQ/wIhGSAHIBk2AhggBygCGCEaQRAhGyAHIBtqIRwgHCEdQQghHiAHIB5qIR8gHyEgIB0gICAaEP8CISEgByAhNgIYIAcoAhghIkEQISMgByAjaiEkICQhJUEEISYgByAmaiEnICchKCAlICggIhD/AiEpIAcgKTYCGCAHKAIMISogBygCCCErIAcoAgQhLEEQIS0gByAtaiEuIC4hLyAvEIADITBBDCExIDAgMWohMiAIKAIAITMgMygCNCE0IAggKiArICwgMiA0EQwAGkEQITUgByA1aiE2IDYhNyA3EIEDGgwBCyAHKAIoIThB9BohOSA4IDkQggUhOgJAAkAgOg0ADAELCwtBMCE7IAcgO2ohPCA8JAAPC04BBn8jACEDQRAhBCADIARrIQUgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCDCEGIAUoAgghByAGIAc2AgAgBSgCBCEIIAYgCDYCBCAGDwtkAQp/IwAhA0EQIQQgAyAEayEFIAUkACAFIAA2AgwgBSABNgIIIAUgAjYCBCAFKAIMIQYgBSgCCCEHIAUoAgQhCEEEIQkgBiAHIAkgCBCCAyEKQRAhCyAFIAtqIQwgDCQAIAoPCysBBX8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEKAIAIQUgBQ8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQPC34BDH8jACEEQRAhBSAEIAVrIQYgBiQAIAYgADYCDCAGIAE2AgggBiACNgIEIAYgAzYCACAGKAIMIQcgBygCACEIIAcQkwMhCSAGKAIIIQogBigCBCELIAYoAgAhDCAIIAkgCiALIAwQvgIhDUEQIQ4gBiAOaiEPIA8kACANDwuGAQEMfyMAIQVBICEGIAUgBmshByAHJAAgByAANgIcIAcgATYCGCAHIAI2AhQgByADNgIQIAcgBDYCDCAHKAIcIQhBgHghCSAIIAlqIQogBygCGCELIAcoAhQhDCAHKAIQIQ0gBygCDCEOIAogCyAMIA0gDhD9AkEgIQ8gByAPaiEQIBAkAA8LqAMBNn8jACEEQTAhBSAEIAVrIQYgBiQAIAYgADYCLCAGIAE6ACsgBiACOgAqIAYgAzoAKSAGKAIsIQcgBi0AKyEIIAYtACohCSAGLQApIQpBICELIAYgC2ohDCAMIQ1BACEOQf8BIQ8gCCAPcSEQQf8BIREgCSARcSESQf8BIRMgCiATcSEUIA0gDiAQIBIgFBBDGkHIBiEVIAcgFWohFiAHKALIBiEXIBcoAgwhGEEgIRkgBiAZaiEaIBohGyAWIBsgGBEEAEEQIRwgBiAcaiEdIB0hHkEAIR8gHiAfIB8QExogBi0AJCEgQf8BISEgICAhcSEiIAYtACUhI0H/ASEkICMgJHEhJSAGLQAmISZB/wEhJyAmICdxISggBiAoNgIIIAYgJTYCBCAGICI2AgBB+xohKUEQISpBECErIAYgK2ohLCAsICogKSAGEE9BgAghLSAHIC1qIS5BECEvIAYgL2ohMCAwITEgMRBOITJBhBshM0GKGyE0IC4gMyAyIDQQoANBECE1IAYgNWohNiA2ITcgNxAxGkEwITggBiA4aiE5IDkkAA8LmgEBEX8jACEEQRAhBSAEIAVrIQYgBiQAIAYgADYCDCAGIAE6AAsgBiACOgAKIAYgAzoACSAGKAIMIQdBgHghCCAHIAhqIQkgBi0ACyEKIAYtAAohCyAGLQAJIQxB/wEhDSAKIA1xIQ5B/wEhDyALIA9xIRBB/wEhESAMIBFxIRIgCSAOIBAgEhCEA0EQIRMgBiATaiEUIBQkAA8LWwIHfwF8IwAhA0EQIQQgAyAEayEFIAUkACAFIAA2AgwgBSABNgIIIAUgAjkDACAFKAIMIQYgBSgCCCEHIAUrAwAhCiAGIAcgChBSQRAhCCAFIAhqIQkgCSQADwtoAgl/AXwjACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACOQMAIAUoAgwhBkGAeCEHIAYgB2ohCCAFKAIIIQkgBSsDACEMIAggCSAMEIYDQRAhCiAFIApqIQsgCyQADwu0AgEnfyMAIQNBMCEEIAMgBGshBSAFJAAgBSAANgIsIAUgATYCKCAFIAI2AiQgBSgCLCEGIAUoAighByAFKAIkIQhBGCEJIAUgCWohCiAKIQtBACEMIAsgDCAHIAgQRRpByAYhDSAGIA1qIQ4gBigCyAYhDyAPKAIQIRBBGCERIAUgEWohEiASIRMgDiATIBARBABBCCEUIAUgFGohFSAVIRZBACEXIBYgFyAXEBMaIAUoAiQhGCAFIBg2AgBBixshGUEQIRpBCCEbIAUgG2ohHCAcIBogGSAFEE9BgAghHSAGIB1qIR5BCCEfIAUgH2ohICAgISEgIRBOISJBjhshI0GKGyEkIB4gIyAiICQQoANBCCElIAUgJWohJiAmIScgJxAxGkEwISggBSAoaiEpICkkAA8LZgEKfyMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCDCEGQYB4IQcgBiAHaiEIIAUoAgghCSAFKAIEIQogCCAJIAoQiANBECELIAUgC2ohDCAMJAAPC9ACAip/AXwjACEDQdAAIQQgAyAEayEFIAUkACAFIAA2AkwgBSABNgJIIAUgAjkDQCAFKAJMIQZBMCEHIAUgB2ohCCAIIQlBACEKIAkgCiAKEBMaQSAhCyAFIAtqIQwgDCENQQAhDiANIA4gDhATGiAFKAJIIQ8gBSAPNgIAQYsbIRBBECERQTAhEiAFIBJqIRMgEyARIBAgBRBPIAUrA0AhLSAFIC05AxBBlBshFEEQIRVBICEWIAUgFmohF0EQIRggBSAYaiEZIBcgFSAUIBkQT0GACCEaIAYgGmohG0EwIRwgBSAcaiEdIB0hHiAeEE4hH0EgISAgBSAgaiEhICEhIiAiEE4hI0GXGyEkIBsgJCAfICMQoANBICElIAUgJWohJiAmIScgJxAxGkEwISggBSAoaiEpICkhKiAqEDEaQdAAISsgBSAraiEsICwkAA8L/AEBHH8jACEFQTAhBiAFIAZrIQcgByQAIAcgADYCLCAHIAE2AiggByACNgIkIAcgAzYCICAHIAQ2AhwgBygCLCEIQQghCSAHIAlqIQogCiELQQAhDCALIAwgDBATGiAHKAIoIQ0gBygCJCEOIAcgDjYCBCAHIA02AgBBnRshD0EQIRBBCCERIAcgEWohEiASIBAgDyAHEE9BgAghEyAIIBNqIRRBCCEVIAcgFWohFiAWIRcgFxBOIRggBygCHCEZIAcoAiAhGkGjGyEbIBQgGyAYIBkgGhChA0EIIRwgByAcaiEdIB0hHiAeEDEaQTAhHyAHIB9qISAgICQADwvbAgIrfwF8IwAhBEHQACEFIAQgBWshBiAGJAAgBiAANgJMIAYgATYCSCAGIAI5A0AgAyEHIAYgBzoAPyAGKAJMIQhBKCEJIAYgCWohCiAKIQtBACEMIAsgDCAMEBMaQRghDSAGIA1qIQ4gDiEPQQAhECAPIBAgEBATGiAGKAJIIREgBiARNgIAQYsbIRJBECETQSghFCAGIBRqIRUgFSATIBIgBhBPIAYrA0AhLyAGIC85AxBBlBshFkEQIRdBGCEYIAYgGGohGUEQIRogBiAaaiEbIBkgFyAWIBsQT0GACCEcIAggHGohHUEoIR4gBiAeaiEfIB8hICAgEE4hIUEYISIgBiAiaiEjICMhJCAkEE4hJUGpGyEmIB0gJiAhICUQoANBGCEnIAYgJ2ohKCAoISkgKRAxGkEoISogBiAqaiErICshLCAsEDEaQdAAIS0gBiAtaiEuIC4kAA8L5wEBG38jACEEQTAhBSAEIAVrIQYgBiQAIAYgADYCLCAGIAE2AiggBiACNgIkIAYgAzYCICAGKAIsIQdBECEIIAYgCGohCSAJIQpBACELIAogCyALEBMaIAYoAighDCAGIAw2AgBBixshDUEQIQ5BECEPIAYgD2ohECAQIA4gDSAGEE9BgAghESAHIBFqIRJBECETIAYgE2ohFCAUIRUgFRBOIRYgBigCICEXIAYoAiQhGEGvGyEZIBIgGSAWIBcgGBChA0EQIRogBiAaaiEbIBshHCAcEDEaQTAhHSAGIB1qIR4gHiQADwtAAQZ/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQ1wIaIAQQ0wVBECEFIAMgBWohBiAGJAAPC1EBCX8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCCCADKAIIIQQgAyAENgIMQbh5IQUgBCAFaiEGIAYQ1wIhB0EQIQggAyAIaiEJIAkkACAHDwtGAQh/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQbh5IQUgBCAFaiEGIAYQjgNBECEHIAMgB2ohCCAIJAAPC1EBCX8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCCCADKAIIIQQgAyAENgIMQYB4IQUgBCAFaiEGIAYQ1wIhB0EQIQggAyAIaiEJIAkkACAHDwtGAQh/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEQYB4IQUgBCAFaiEGIAYQjgNBECEHIAMgB2ohCCAIJAAPCysBBX8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEKAIEIQUgBQ8LWQEHfyMAIQRBECEFIAQgBWshBiAGIAA2AgwgBiABNgIIIAYgAjYCBCAGIAM2AgAgBigCDCEHIAYoAgghCCAHIAg2AgQgBigCBCEJIAcgCTYCCEEAIQogCg8LfgEMfyMAIQRBECEFIAQgBWshBiAGJAAgBiAANgIMIAYgATYCCCAGIAI2AgQgBiADNgIAIAYoAgwhByAGKAIIIQggBigCBCEJIAYoAgAhCiAHKAIAIQsgCygCACEMIAcgCCAJIAogDBEJACENQRAhDiAGIA5qIQ8gDyQAIA0PC0oBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBCgCACEFIAUoAgQhBiAEIAYRAwBBECEHIAMgB2ohCCAIJAAPC1oBCX8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFKAIAIQcgBygCCCEIIAUgBiAIEQQAQRAhCSAEIAlqIQogCiQADwtzAwl/AX0BfCMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCAFIAI4AgQgBSgCDCEGIAUoAgghByAFKgIEIQwgDLshDSAGKAIAIQggCCgCLCEJIAYgByANIAkRCgBBECEKIAUgCmohCyALJAAPC54BARF/IwAhBEEQIQUgBCAFayEGIAYkACAGIAA2AgwgBiABOgALIAYgAjoACiAGIAM6AAkgBigCDCEHIAYtAAshCCAGLQAKIQkgBi0ACSEKIAcoAgAhCyALKAIYIQxB/wEhDSAIIA1xIQ5B/wEhDyAJIA9xIRBB/wEhESAKIBFxIRIgByAOIBAgEiAMEQcAQRAhEyAGIBNqIRQgFCQADwtqAQp/IwAhA0EQIQQgAyAEayEFIAUkACAFIAA2AgwgBSABNgIIIAUgAjYCBCAFKAIMIQYgBSgCCCEHIAUoAgQhCCAGKAIAIQkgCSgCHCEKIAYgByAIIAoRBgBBECELIAUgC2ohDCAMJAAPC2oBCn8jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACNgIEIAUoAgwhBiAFKAIIIQcgBSgCBCEIIAYoAgAhCSAJKAIUIQogBiAHIAggChEGAEEQIQsgBSALaiEMIAwkAA8LagEKfyMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCAFIAI2AgQgBSgCDCEGIAUoAgghByAFKAIEIQggBigCACEJIAkoAjAhCiAGIAcgCCAKEQYAQRAhCyAFIAtqIQwgDCQADwt8Agp/AXwjACEEQSAhBSAEIAVrIQYgBiQAIAYgADYCHCAGIAE2AhggBiACNgIUIAYgAzkDCCAGKAIcIQcgBigCGCEIIAYoAhQhCSAGKwMIIQ4gBygCACEKIAooAiAhCyAHIAggCSAOIAsRDwBBICEMIAYgDGohDSANJAAPC3oBC38jACEEQRAhBSAEIAVrIQYgBiQAIAYgADYCDCAGIAE2AgggBiACNgIEIAYgAzYCACAGKAIMIQcgBigCCCEIIAYoAgQhCSAGKAIAIQogBygCACELIAsoAiQhDCAHIAggCSAKIAwRBwBBECENIAYgDWohDiAOJAAPC4oBAQx/IwAhBUEgIQYgBSAGayEHIAckACAHIAA2AhwgByABNgIYIAcgAjYCFCAHIAM2AhAgByAENgIMIAcoAhwhCCAHKAIYIQkgBygCFCEKIAcoAhAhCyAHKAIMIQwgCCgCACENIA0oAighDiAIIAkgCiALIAwgDhEIAEEgIQ8gByAPaiEQIBAkAA8LjgEBC38jACEEQSAhBSAEIAVrIQYgBiQAIAYgADYCHCAGIAE2AhggBiACNgIUIAYgAzYCEEHkOyEHIAYgBzYCDCAGKAIMIQggBigCGCEJIAYoAhQhCiAGKAIQIQsgBiALNgIIIAYgCjYCBCAGIAk2AgBB8BshDCAIIAwgBhADGkEgIQ0gBiANaiEOIA4kAA8LowEBDH8jACEFQTAhBiAFIAZrIQcgByQAIAcgADYCLCAHIAE2AiggByACNgIkIAcgAzYCICAHIAQ2AhxBgD0hCCAHIAg2AhggBygCGCEJIAcoAighCiAHKAIkIQsgBygCICEMIAcoAhwhDSAHIA02AgwgByAMNgIIIAcgCzYCBCAHIAo2AgBB9BshDiAJIA4gBxADGkEwIQ8gByAPaiEQIBAkAA8LGwEDfyMAIQFBECECIAEgAmshAyADIAA2AgwPCyIBA38jACECQRAhAyACIANrIQQgBCAANgIMIAQgATYCCA8LGwEDfyMAIQFBECECIAEgAmshAyADIAA2AgwACzABA38jACEEQRAhBSAEIAVrIQYgBiAANgIMIAYgAToACyAGIAI6AAogBiADOgAJDwspAQN/IwAhA0EQIQQgAyAEayEFIAUgADYCDCAFIAE2AgggBSACNgIEDwswAQN/IwAhBEEgIQUgBCAFayEGIAYgADYCHCAGIAE2AhggBiACNgIUIAYgAzkDCA8LMAEDfyMAIQRBECEFIAQgBWshBiAGIAA2AgwgBiABNgIIIAYgAjYCBCAGIAM2AgAPCzcBA38jACEFQSAhBiAFIAZrIQcgByAANgIcIAcgATYCGCAHIAI2AhQgByADNgIQIAcgBDYCDA8LKQEDfyMAIQNBECEEIAMgBGshBSAFIAA2AgwgBSABNgIIIAUgAjkDAA8LrwoCmwF/AXwjACEDQcAAIQQgAyAEayEFIAUkACAFIAA2AjggBSABNgI0IAUgAjYCMCAFKAI4IQYgBSAGNgI8QdQcIQdBCCEIIAcgCGohCSAJIQogBiAKNgIAIAUoAjQhCyALKAIsIQwgBiAMNgIEIAUoAjQhDSANLQAoIQ5BASEPIA4gD3EhECAGIBA6AAggBSgCNCERIBEtACkhEkEBIRMgEiATcSEUIAYgFDoACSAFKAI0IRUgFS0AKiEWQQEhFyAWIBdxIRggBiAYOgAKIAUoAjQhGSAZKAIkIRogBiAaNgIMRAAAAAAAcOdAIZ4BIAYgngE5AxBBACEbIAYgGzYCGEEAIRwgBiAcNgIcQQAhHSAGIB06ACBBACEeIAYgHjoAIUEkIR8gBiAfaiEgQYAgISEgICAhEKwDGkE0ISIgBiAiaiEjQSAhJCAjICRqISUgIyEmA0AgJiEnQYAgISggJyAoEK0DGkEQISkgJyApaiEqICohKyAlISwgKyAsRiEtQQEhLiAtIC5xIS8gKiEmIC9FDQALQdQAITAgBiAwaiExQSAhMiAxIDJqITMgMSE0A0AgNCE1QYAgITYgNSA2EK4DGkEQITcgNSA3aiE4IDghOSAzITogOSA6RiE7QQEhPCA7IDxxIT0gOCE0ID1FDQALQfQAIT4gBiA+aiE/QQAhQCA/IEAQrwMaQfgAIUEgBiBBaiFCIEIQsAMaIAUoAjQhQyBDKAIIIURBJCFFIAYgRWohRkEkIUcgBSBHaiFIIEghSUEgIUogBSBKaiFLIEshTEEsIU0gBSBNaiFOIE4hT0EoIVAgBSBQaiFRIFEhUiBEIEYgSSBMIE8gUhCxAxpBNCFTIAYgU2ohVCAFKAIkIVVBASFWQQEhVyBWIFdxIVggVCBVIFgQsgMaQTQhWSAGIFlqIVpBECFbIFogW2ohXCAFKAIgIV1BASFeQQEhXyBeIF9xIWAgXCBdIGAQsgMaQTQhYSAGIGFqIWIgYhCzAyFjIAUgYzYCHEEAIWQgBSBkNgIYAkADQCAFKAIYIWUgBSgCJCFmIGUhZyBmIWggZyBoSCFpQQEhaiBpIGpxIWsga0UNAUEsIWwgbBDSBSFtIG0QtAMaIAUgbTYCFCAFKAIUIW5BACFvIG4gbzoAACAFKAIcIXAgBSgCFCFxIHEgcDYCBEHUACFyIAYgcmohcyAFKAIUIXQgcyB0ELUDGiAFKAIYIXVBASF2IHUgdmohdyAFIHc2AhggBSgCHCF4QQQheSB4IHlqIXogBSB6NgIcDAALAAtBNCF7IAYge2ohfEEQIX0gfCB9aiF+IH4QswMhfyAFIH82AhBBACGAASAFIIABNgIMAkADQCAFKAIMIYEBIAUoAiAhggEggQEhgwEgggEhhAEggwEghAFIIYUBQQEhhgEghQEghgFxIYcBIIcBRQ0BQSwhiAEgiAEQ0gUhiQEgiQEQtAMaIAUgiQE2AgggBSgCCCGKAUEAIYsBIIoBIIsBOgAAIAUoAhAhjAEgBSgCCCGNASCNASCMATYCBCAFKAIIIY4BQQAhjwEgjgEgjwE2AghB1AAhkAEgBiCQAWohkQFBECGSASCRASCSAWohkwEgBSgCCCGUASCTASCUARC1AxogBSgCDCGVAUEBIZYBIJUBIJYBaiGXASAFIJcBNgIMIAUoAhAhmAFBBCGZASCYASCZAWohmgEgBSCaATYCEAwACwALIAUoAjwhmwFBwAAhnAEgBSCcAWohnQEgnQEkACCbAQ8LTAEHfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUgBhAeGkEQIQcgBCAHaiEIIAgkACAFDwtMAQd/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGEB4aQRAhByAEIAdqIQggCCQAIAUPC0wBB38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFIAYQHhpBECEHIAQgB2ohCCAIJAAgBQ8LZgELfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQVBACEGIAQgBjYCBEEEIQcgBCAHaiEIIAghCSAEIQogBSAJIAoQtgMaQRAhCyAEIAtqIQwgDCQAIAUPC74BAgh/BnwjACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBEQAAAAAAABeQCEJIAQgCTkDAEQAAAAAAADwvyEKIAQgCjkDCEQAAAAAAADwvyELIAQgCzkDEEQAAAAAAADwvyEMIAQgDDkDGEQAAAAAAADwvyENIAQgDTkDIEQAAAAAAADwvyEOIAQgDjkDKEEEIQUgBCAFNgIwQQQhBiAEIAY2AjRBACEHIAQgBzoAOEEAIQggBCAIOgA5IAQPC8UPAtwBfwF+IwAhBkGQASEHIAYgB2shCCAIJAAgCCAANgKMASAIIAE2AogBIAggAjYChAEgCCADNgKAASAIIAQ2AnwgCCAFNgJ4QQAhCSAIIAk6AHdBACEKIAggCjYCcEH3ACELIAggC2ohDCAMIQ0gCCANNgJoQfAAIQ4gCCAOaiEPIA8hECAIIBA2AmwgCCgChAEhEUEAIRIgESASNgIAIAgoAoABIRNBACEUIBMgFDYCACAIKAJ8IRVBACEWIBUgFjYCACAIKAJ4IRdBACEYIBcgGDYCACAIKAKMASEZIBkQhQUhGiAIIBo2AmQgCCgCZCEbQbUdIRxB4AAhHSAIIB1qIR4gHiEfIBsgHCAfEP4EISAgCCAgNgJcQcgAISEgCCAhaiEiICIhI0GAICEkICMgJBC3AxoCQANAIAgoAlwhJUEAISYgJSEnICYhKCAnIChHISlBASEqICkgKnEhKyArRQ0BQSAhLCAsENIFIS1CACHiASAtIOIBNwMAQRghLiAtIC5qIS8gLyDiATcDAEEQITAgLSAwaiExIDEg4gE3AwBBCCEyIC0gMmohMyAzIOIBNwMAIC0QuAMaIAggLTYCREEAITQgCCA0NgJAQQAhNSAIIDU2AjxBACE2IAggNjYCOEEAITcgCCA3NgI0IAgoAlwhOEG3HSE5IDggORD8BCE6IAggOjYCMEEAITtBtx0hPCA7IDwQ/AQhPSAIID02AixBECE+ID4Q0gUhP0EAIUAgPyBAIEAQExogCCA/NgIoIAgoAighQSAIKAIwIUIgCCgCLCFDIAggQzYCBCAIIEI2AgBBuR0hREGAAiFFIEEgRSBEIAgQT0EAIUYgCCBGNgIkAkADQCAIKAIkIUdByAAhSCAIIEhqIUkgSSFKIEoQuQMhSyBHIUwgSyFNIEwgTUghTkEBIU8gTiBPcSFQIFBFDQEgCCgCJCFRQcgAIVIgCCBSaiFTIFMhVCBUIFEQugMhVSBVEE4hViAIKAIoIVcgVxBOIVggViBYEIIFIVkCQCBZDQALIAgoAiQhWkEBIVsgWiBbaiFcIAggXDYCJAwACwALIAgoAighXUHIACFeIAggXmohXyBfIWAgYCBdELsDGiAIKAIwIWFBvx0hYkEgIWMgCCBjaiFkIGQhZSBhIGIgZRD+BCFmIAggZjYCHCAIKAIcIWcgCCgCICFoIAgoAkQhaUHoACFqIAggamohayBrIWxBACFtQTghbiAIIG5qIW8gbyFwQcAAIXEgCCBxaiFyIHIhcyBsIG0gZyBoIHAgcyBpELwDIAgoAiwhdEG/HSF1QRghdiAIIHZqIXcgdyF4IHQgdSB4EP4EIXkgCCB5NgIUIAgoAhQheiAIKAIYIXsgCCgCRCF8QegAIX0gCCB9aiF+IH4hf0EBIYABQTQhgQEgCCCBAWohggEgggEhgwFBPCGEASAIIIQBaiGFASCFASGGASB/IIABIHogeyCDASCGASB8ELwDIAgtAHchhwFBASGIASCHASCIAXEhiQFBASGKASCJASGLASCKASGMASCLASCMAUYhjQFBASGOASCNASCOAXEhjwECQCCPAUUNACAIKAJwIZABQQAhkQEgkAEhkgEgkQEhkwEgkgEgkwFKIZQBQQEhlQEglAEglQFxIZYBIJYBRQ0AC0EAIZcBIAgglwE2AhACQANAIAgoAhAhmAEgCCgCOCGZASCYASGaASCZASGbASCaASCbAUghnAFBASGdASCcASCdAXEhngEgngFFDQEgCCgCECGfAUEBIaABIJ8BIKABaiGhASAIIKEBNgIQDAALAAtBACGiASAIIKIBNgIMAkADQCAIKAIMIaMBIAgoAjQhpAEgowEhpQEgpAEhpgEgpQEgpgFIIacBQQEhqAEgpwEgqAFxIakBIKkBRQ0BIAgoAgwhqgFBASGrASCqASCrAWohrAEgCCCsATYCDAwACwALIAgoAoQBIa0BQcAAIa4BIAggrgFqIa8BIK8BIbABIK0BILABECkhsQEgsQEoAgAhsgEgCCgChAEhswEgswEgsgE2AgAgCCgCgAEhtAFBPCG1ASAIILUBaiG2ASC2ASG3ASC0ASC3ARApIbgBILgBKAIAIbkBIAgoAoABIboBILoBILkBNgIAIAgoAnwhuwFBOCG8ASAIILwBaiG9ASC9ASG+ASC7ASC+ARApIb8BIL8BKAIAIcABIAgoAnwhwQEgwQEgwAE2AgAgCCgCeCHCAUE0IcMBIAggwwFqIcQBIMQBIcUBIMIBIMUBECkhxgEgxgEoAgAhxwEgCCgCeCHIASDIASDHATYCACAIKAKIASHJASAIKAJEIcoBIMkBIMoBEL0DGiAIKAJwIcsBQQEhzAEgywEgzAFqIc0BIAggzQE2AnBBACHOAUG1HSHPAUHgACHQASAIINABaiHRASDRASHSASDOASDPASDSARD+BCHTASAIINMBNgJcDAALAAsgCCgCZCHUASDUARCCBkHIACHVASAIINUBaiHWASDWASHXAUEBIdgBQQAh2QFBASHaASDYASDaAXEh2wEg1wEg2wEg2QEQvgMgCCgCcCHcAUHIACHdASAIIN0BaiHeASDeASHfASDfARC/AxpBkAEh4AEgCCDgAWoh4QEg4QEkACDcAQ8LeAEOfyMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATYCCCACIQYgBSAGOgAHIAUoAgwhByAFKAIIIQhBAiEJIAggCXQhCiAFLQAHIQtBASEMIAsgDHEhDSAHIAogDRCvASEOQRAhDyAFIA9qIRAgECQAIA4PCz0BB38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBBRIQVBECEGIAMgBmohByAHJAAgBQ8LiAEBD38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBACEFIAQgBToAAEEAIQYgBCAGNgIEQQAhByAEIAc2AghBDCEIIAQgCGohCUGAICEKIAkgChDAAxpBHCELIAQgC2ohDEEAIQ0gDCANIA0QExpBECEOIAMgDmohDyAPJAAgBA8LigIBIH8jACECQSAhAyACIANrIQQgBCQAIAQgADYCGCAEIAE2AhQgBCgCGCEFIAUQ7wIhBiAEIAY2AhAgBCgCECEHQQEhCCAHIAhqIQlBAiEKIAkgCnQhC0EAIQxBASENIAwgDXEhDiAFIAsgDhC2ASEPIAQgDzYCDCAEKAIMIRBBACERIBAhEiARIRMgEiATRyEUQQEhFSAUIBVxIRYCQAJAIBZFDQAgBCgCFCEXIAQoAgwhGCAEKAIQIRlBAiEaIBkgGnQhGyAYIBtqIRwgHCAXNgIAIAQoAhQhHSAEIB02AhwMAQtBACEeIAQgHjYCHAsgBCgCHCEfQSAhICAEICBqISEgISQAIB8PC24BCX8jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACNgIEIAUoAgwhBiAFKAIIIQcgBxDmAyEIIAYgCBDnAxogBSgCBCEJIAkQrQEaIAYQ6AMaQRAhCiAFIApqIQsgCyQAIAYPC0wBB38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFIAYQHhpBECEHIAQgB2ohCCAIJAAgBQ8LlgEBE38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCCCADKAIIIQQgAyAENgIMQSAhBSAEIAVqIQYgBCEHA0AgByEIQYAgIQkgCCAJEOADGkEQIQogCCAKaiELIAshDCAGIQ0gDCANRiEOQQEhDyAOIA9xIRAgCyEHIBBFDQALIAMoAgwhEUEQIRIgAyASaiETIBMkACARDwtIAQl/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQUCEFQQIhBiAFIAZ2IQdBECEIIAMgCGohCSAJJAAgBw8L9AEBH38jACECQRAhAyACIANrIQQgBCQAIAQgADYCCCAEIAE2AgQgBCgCCCEFIAUQUSEGIAQgBjYCACAEKAIAIQdBACEIIAchCSAIIQogCSAKRyELQQEhDCALIAxxIQ0CQAJAIA1FDQAgBCgCBCEOIAUQUCEPQQIhECAPIBB2IREgDiESIBEhEyASIBNJIRRBASEVIBQgFXEhFiAWRQ0AIAQoAgAhFyAEKAIEIRhBAiEZIBggGXQhGiAXIBpqIRsgGygCACEcIAQgHDYCDAwBC0EAIR0gBCAdNgIMCyAEKAIMIR5BECEfIAQgH2ohICAgJAAgHg8LigIBIH8jACECQSAhAyACIANrIQQgBCQAIAQgADYCGCAEIAE2AhQgBCgCGCEFIAUQuQMhBiAEIAY2AhAgBCgCECEHQQEhCCAHIAhqIQlBAiEKIAkgCnQhC0EAIQxBASENIAwgDXEhDiAFIAsgDhC2ASEPIAQgDzYCDCAEKAIMIRBBACERIBAhEiARIRMgEiATRyEUQQEhFSAUIBVxIRYCQAJAIBZFDQAgBCgCFCEXIAQoAgwhGCAEKAIQIRlBAiEaIBkgGnQhGyAYIBtqIRwgHCAXNgIAIAQoAhQhHSAEIB02AhwMAQtBACEeIAQgHjYCHAsgBCgCHCEfQSAhICAEICBqISEgISQAIB8PC4IEATl/IwAhB0EwIQggByAIayEJIAkkACAJIAA2AiwgCSABNgIoIAkgAjYCJCAJIAM2AiAgCSAENgIcIAkgBTYCGCAJIAY2AhQgCSgCLCEKAkADQCAJKAIkIQtBACEMIAshDSAMIQ4gDSAORyEPQQEhECAPIBBxIREgEUUNAUEAIRIgCSASNgIQIAkoAiQhE0HkHSEUIBMgFBCCBSEVAkACQCAVDQAgCigCACEWQQEhFyAWIBc6AABBQCEYIAkgGDYCEAwBCyAJKAIkIRlBECEaIAkgGmohGyAJIBs2AgBB5h0hHCAZIBwgCRCyBSEdQQEhHiAdIR8gHiEgIB8gIEYhIUEBISIgISAicSEjAkACQCAjRQ0ADAELCwsgCSgCECEkIAkoAhghJSAlKAIAISYgJiAkaiEnICUgJzYCAEEAIShBvx0hKUEgISogCSAqaiErICshLCAoICkgLBD+BCEtIAkgLTYCJCAJKAIQIS4CQAJAIC5FDQAgCSgCFCEvIAkoAighMCAJKAIQITEgLyAwIDEQ4QMgCSgCHCEyIDIoAgAhM0EBITQgMyA0aiE1IDIgNTYCAAwBCyAJKAIcITYgNigCACE3QQAhOCA3ITkgOCE6IDkgOkohO0EBITwgOyA8cSE9AkAgPUUNAAsLDAALAAtBMCE+IAkgPmohPyA/JAAPC4oCASB/IwAhAkEgIQMgAiADayEEIAQkACAEIAA2AhggBCABNgIUIAQoAhghBSAFEMoDIQYgBCAGNgIQIAQoAhAhB0EBIQggByAIaiEJQQIhCiAJIAp0IQtBACEMQQEhDSAMIA1xIQ4gBSALIA4QtgEhDyAEIA82AgwgBCgCDCEQQQAhESAQIRIgESETIBIgE0chFEEBIRUgFCAVcSEWAkACQCAWRQ0AIAQoAhQhFyAEKAIMIRggBCgCECEZQQIhGiAZIBp0IRsgGCAbaiEcIBwgFzYCACAEKAIUIR0gBCAdNgIcDAELQQAhHiAEIB42AhwLIAQoAhwhH0EgISAgBCAgaiEhICEkACAfDwvPAwE6fyMAIQNBICEEIAMgBGshBSAFJAAgBSAANgIcIAEhBiAFIAY6ABsgBSACNgIUIAUoAhwhByAFLQAbIQhBASEJIAggCXEhCgJAIApFDQAgBxC5AyELQQEhDCALIAxrIQ0gBSANNgIQAkADQCAFKAIQIQ5BACEPIA4hECAPIREgECARTiESQQEhEyASIBNxIRQgFEUNASAFKAIQIRUgByAVELoDIRYgBSAWNgIMIAUoAgwhF0EAIRggFyEZIBghGiAZIBpHIRtBASEcIBsgHHEhHQJAIB1FDQAgBSgCFCEeQQAhHyAeISAgHyEhICAgIUchIkEBISMgIiAjcSEkAkACQCAkRQ0AIAUoAhQhJSAFKAIMISYgJiAlEQMADAELIAUoAgwhJ0EAISggJyEpICghKiApICpGIStBASEsICsgLHEhLQJAIC0NACAnEDEaICcQ0wULCwsgBSgCECEuQQIhLyAuIC90ITBBACExQQEhMiAxIDJxITMgByAwIDMQrwEaIAUoAhAhNEF/ITUgNCA1aiE2IAUgNjYCEAwACwALC0EAITdBACE4QQEhOSA4IDlxITogByA3IDoQrwEaQSAhOyAFIDtqITwgPCQADws8AQZ/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQNxpBECEFIAMgBWohBiAGJAAgBA8LTAEHfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUgBhAeGkEQIQcgBCAHaiEIIAgkACAFDwuwAwE9fyMAIQFBECECIAEgAmshAyADJAAgAyAANgIIIAMoAgghBCADIAQ2AgxB1BwhBUEIIQYgBSAGaiEHIAchCCAEIAg2AgBB1AAhCSAEIAlqIQpBASELQQAhDEEBIQ0gCyANcSEOIAogDiAMEMIDQdQAIQ8gBCAPaiEQQRAhESAQIBFqIRJBASETQQAhFEEBIRUgEyAVcSEWIBIgFiAUEMIDQSQhFyAEIBdqIRhBASEZQQAhGkEBIRsgGSAbcSEcIBggHCAaEMMDQfQAIR0gBCAdaiEeIB4QxAMaQdQAIR8gBCAfaiEgQSAhISAgICFqISIgIiEjA0AgIyEkQXAhJSAkICVqISYgJhDFAxogJiEnICAhKCAnIChGISlBASEqICkgKnEhKyAmISMgK0UNAAtBNCEsIAQgLGohLUEgIS4gLSAuaiEvIC8hMANAIDAhMUFwITIgMSAyaiEzIDMQxgMaIDMhNCAtITUgNCA1RiE2QQEhNyA2IDdxITggMyEwIDhFDQALQSQhOSAEIDlqITogOhDHAxogAygCDCE7QRAhPCADIDxqIT0gPSQAIDsPC9ADATp/IwAhA0EgIQQgAyAEayEFIAUkACAFIAA2AhwgASEGIAUgBjoAGyAFIAI2AhQgBSgCHCEHIAUtABshCEEBIQkgCCAJcSEKAkAgCkUNACAHEO8CIQtBASEMIAsgDGshDSAFIA02AhACQANAIAUoAhAhDkEAIQ8gDiEQIA8hESAQIBFOIRJBASETIBIgE3EhFCAURQ0BIAUoAhAhFSAHIBUQyAMhFiAFIBY2AgwgBSgCDCEXQQAhGCAXIRkgGCEaIBkgGkchG0EBIRwgGyAccSEdAkAgHUUNACAFKAIUIR5BACEfIB4hICAfISEgICAhRyEiQQEhIyAiICNxISQCQAJAICRFDQAgBSgCFCElIAUoAgwhJiAmICURAwAMAQsgBSgCDCEnQQAhKCAnISkgKCEqICkgKkYhK0EBISwgKyAscSEtAkAgLQ0AICcQyQMaICcQ0wULCwsgBSgCECEuQQIhLyAuIC90ITBBACExQQEhMiAxIDJxITMgByAwIDMQrwEaIAUoAhAhNEF/ITUgNCA1aiE2IAUgNjYCEAwACwALC0EAITdBACE4QQEhOSA4IDlxITogByA3IDoQrwEaQSAhOyAFIDtqITwgPCQADwvQAwE6fyMAIQNBICEEIAMgBGshBSAFJAAgBSAANgIcIAEhBiAFIAY6ABsgBSACNgIUIAUoAhwhByAFLQAbIQhBASEJIAggCXEhCgJAIApFDQAgBxDKAyELQQEhDCALIAxrIQ0gBSANNgIQAkADQCAFKAIQIQ5BACEPIA4hECAPIREgECARTiESQQEhEyASIBNxIRQgFEUNASAFKAIQIRUgByAVEMsDIRYgBSAWNgIMIAUoAgwhF0EAIRggFyEZIBghGiAZIBpHIRtBASEcIBsgHHEhHQJAIB1FDQAgBSgCFCEeQQAhHyAeISAgHyEhICAgIUchIkEBISMgIiAjcSEkAkACQCAkRQ0AIAUoAhQhJSAFKAIMISYgJiAlEQMADAELIAUoAgwhJ0EAISggJyEpICghKiApICpGIStBASEsICsgLHEhLQJAIC0NACAnEMwDGiAnENMFCwsLIAUoAhAhLkECIS8gLiAvdCEwQQAhMUEBITIgMSAycSEzIAcgMCAzEK8BGiAFKAIQITRBfyE1IDQgNWohNiAFIDY2AhAMAAsACwtBACE3QQAhOEEBITkgOCA5cSE6IAcgNyA6EK8BGkEgITsgBSA7aiE8IDwkAA8LQgEHfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBEEAIQUgBCAFEM0DQRAhBiADIAZqIQcgByQAIAQPCzwBBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBA3GkEQIQUgAyAFaiEGIAYkACAEDws8AQZ/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQNxpBECEFIAMgBWohBiAGJAAgBA8LPAEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEDcaQRAhBSADIAVqIQYgBiQAIAQPC/QBAR9/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgggBCABNgIEIAQoAgghBSAFEFEhBiAEIAY2AgAgBCgCACEHQQAhCCAHIQkgCCEKIAkgCkchC0EBIQwgCyAMcSENAkACQCANRQ0AIAQoAgQhDiAFEFAhD0ECIRAgDyAQdiERIA4hEiARIRMgEiATSSEUQQEhFSAUIBVxIRYgFkUNACAEKAIAIRcgBCgCBCEYQQIhGSAYIBl0IRogFyAaaiEbIBsoAgAhHCAEIBw2AgwMAQtBACEdIAQgHTYCDAsgBCgCDCEeQRAhHyAEIB9qISAgICQAIB4PC1gBCn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQRBHCEFIAQgBWohBiAGEDEaQQwhByAEIAdqIQggCBDxAxpBECEJIAMgCWohCiAKJAAgBA8LSAEJfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEFAhBUECIQYgBSAGdiEHQRAhCCADIAhqIQkgCSQAIAcPC/QBAR9/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgggBCABNgIEIAQoAgghBSAFEFEhBiAEIAY2AgAgBCgCACEHQQAhCCAHIQkgCCEKIAkgCkchC0EBIQwgCyAMcSENAkACQCANRQ0AIAQoAgQhDiAFEFAhD0ECIRAgDyAQdiERIA4hEiARIRMgEiATSSEUQQEhFSAUIBVxIRYgFkUNACAEKAIAIRcgBCgCBCEYQQIhGSAYIBl0IRogFyAaaiEbIBsoAgAhHCAEIBw2AgwMAQtBACEdIAQgHTYCDAsgBCgCDCEeQRAhHyAEIB9qISAgICQAIB4PC9IBARx/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgggAygCCCEEIAMgBDYCDEEBIQVBACEGQQEhByAFIAdxIQggBCAIIAYQ8gNBECEJIAQgCWohCkEBIQtBACEMQQEhDSALIA1xIQ4gCiAOIAwQ8gNBICEPIAQgD2ohECAQIREDQCARIRJBcCETIBIgE2ohFCAUEPMDGiAUIRUgBCEWIBUgFkYhF0EBIRggFyAYcSEZIBQhESAZRQ0ACyADKAIMIRpBECEbIAMgG2ohHCAcJAAgGg8LqAEBE38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAUQ6wMhBiAGKAIAIQcgBCAHNgIEIAQoAgghCCAFEOsDIQkgCSAINgIAIAQoAgQhCkEAIQsgCiEMIAshDSAMIA1HIQ5BASEPIA4gD3EhEAJAIBBFDQAgBRDsAyERIAQoAgQhEiARIBIQ7QMLQRAhEyAEIBNqIRQgFCQADwsbAQN/IwAhAUEQIQIgASACayEDIAMgADYCDAALtwQBR38jACEEQSAhBSAEIAVrIQYgBiQAIAYgADYCHCAGIAE2AhggBiACNgIUIAYgAzYCECAGKAIcIQdB1AAhCCAHIAhqIQkgCRDvAiEKIAYgCjYCDEHUACELIAcgC2ohDEEQIQ0gDCANaiEOIA4Q7wIhDyAGIA82AghBACEQIAYgEDYCBEEAIREgBiARNgIAAkADQCAGKAIAIRIgBigCCCETIBIhFCATIRUgFCAVSCEWQQEhFyAWIBdxIRggGEUNASAGKAIAIRkgBigCDCEaIBkhGyAaIRwgGyAcSCEdQQEhHiAdIB5xIR8CQCAfRQ0AIAYoAhQhICAGKAIAISFBAiEiICEgInQhIyAgICNqISQgJCgCACElIAYoAhghJiAGKAIAISdBAiEoICcgKHQhKSAmIClqISogKigCACErIAYoAhAhLEECIS0gLCAtdCEuICUgKyAuEIoGGiAGKAIEIS9BASEwIC8gMGohMSAGIDE2AgQLIAYoAgAhMkEBITMgMiAzaiE0IAYgNDYCAAwACwALAkADQCAGKAIEITUgBigCCCE2IDUhNyA2ITggNyA4SCE5QQEhOiA5IDpxITsgO0UNASAGKAIUITwgBigCBCE9QQIhPiA9ID50IT8gPCA/aiFAIEAoAgAhQSAGKAIQIUJBAiFDIEIgQ3QhREEAIUUgQSBFIEQQiwYaIAYoAgQhRkEBIUcgRiBHaiFIIAYgSDYCBAwACwALQSAhSSAGIElqIUogSiQADwtbAQl/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSgCACEHIAcoAhwhCCAFIAYgCBECABpBECEJIAQgCWohCiAKJAAPC9ECASx/IwAhAkEgIQMgAiADayEEIAQkACAEIAA2AhwgBCABNgIYIAQoAhwhBUEBIQYgBCAGOgAXIAQoAhghByAHEGMhCCAEIAg2AhBBACEJIAQgCTYCDAJAA0AgBCgCDCEKIAQoAhAhCyAKIQwgCyENIAwgDUghDkEBIQ8gDiAPcSEQIBBFDQEgBCgCGCERIBEQZCESIAQoAgwhE0EDIRQgEyAUdCEVIBIgFWohFiAFKAIAIRcgFygCHCEYIAUgFiAYEQIAIRlBASEaIBkgGnEhGyAELQAXIRxBASEdIBwgHXEhHiAeIBtxIR9BACEgIB8hISAgISIgISAiRyEjQQEhJCAjICRxISUgBCAlOgAXIAQoAgwhJkEBIScgJiAnaiEoIAQgKDYCDAwACwALIAQtABchKUEBISogKSAqcSErQSAhLCAEICxqIS0gLSQAICsPC8EDATJ/IwAhBUEwIQYgBSAGayEHIAckACAHIAA2AiwgByABNgIoIAcgAjYCJCAHIAM2AiAgByAENgIcIAcoAighCAJAAkAgCA0AIAcoAiAhCUEBIQogCSELIAohDCALIAxGIQ1BASEOIA0gDnEhDwJAAkAgD0UNACAHKAIcIRBBjB0hEUEAIRIgECARIBIQGQwBCyAHKAIgIRNBAiEUIBMhFSAUIRYgFSAWRiEXQQEhGCAXIBhxIRkCQAJAIBlFDQAgBygCJCEaAkACQCAaDQAgBygCHCEbQZIdIRxBACEdIBsgHCAdEBkMAQsgBygCHCEeQZcdIR9BACEgIB4gHyAgEBkLDAELIAcoAhwhISAHKAIkISIgByAiNgIAQZsdISNBICEkICEgJCAjIAcQTwsLDAELIAcoAiAhJUEBISYgJSEnICYhKCAnIChGISlBASEqICkgKnEhKwJAAkAgK0UNACAHKAIcISxBpB0hLUEAIS4gLCAtIC4QGQwBCyAHKAIcIS8gBygCJCEwIAcgMDYCEEGrHSExQSAhMkEQITMgByAzaiE0IC8gMiAxIDQQTwsLQTAhNSAHIDVqITYgNiQADwtIAQl/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQUCEFQQIhBiAFIAZ2IQdBECEIIAMgCGohCSAJJAAgBw8L9AEBH38jACECQRAhAyACIANrIQQgBCQAIAQgADYCCCAEIAE2AgQgBCgCCCEFIAUQUSEGIAQgBjYCACAEKAIAIQdBACEIIAchCSAIIQogCSAKRyELQQEhDCALIAxxIQ0CQAJAIA1FDQAgBCgCBCEOIAUQUCEPQQIhECAPIBB2IREgDiESIBEhEyASIBNJIRRBASEVIBQgFXEhFiAWRQ0AIAQoAgAhFyAEKAIEIRhBAiEZIBggGXQhGiAXIBpqIRsgGygCACEcIAQgHDYCDAwBC0EAIR0gBCAdNgIMCyAEKAIMIR5BECEfIAQgH2ohICAgJAAgHg8LlgIBIX8jACECQSAhAyACIANrIQQgBCQAIAQgADYCHCAEIAE2AhggBCgCHCEFQdQAIQYgBSAGaiEHIAQoAhghCEEEIQkgCCAJdCEKIAcgCmohCyAEIAs2AhRBACEMIAQgDDYCEEEAIQ0gBCANNgIMAkADQCAEKAIMIQ4gBCgCFCEPIA8Q7wIhECAOIREgECESIBEgEkghE0EBIRQgEyAUcSEVIBVFDQEgBCgCGCEWIAQoAgwhFyAFIBYgFxDWAyEYQQEhGSAYIBlxIRogBCgCECEbIBsgGmohHCAEIBw2AhAgBCgCDCEdQQEhHiAdIB5qIR8gBCAfNgIMDAALAAsgBCgCECEgQSAhISAEICFqISIgIiQAICAPC/EBASF/IwAhA0EQIQQgAyAEayEFIAUkACAFIAA2AgwgBSABNgIIIAUgAjYCBCAFKAIMIQYgBSgCBCEHQdQAIQggBiAIaiEJIAUoAgghCkEEIQsgCiALdCEMIAkgDGohDSANEO8CIQ4gByEPIA4hECAPIBBIIRFBACESQQEhEyARIBNxIRQgEiEVAkAgFEUNAEHUACEWIAYgFmohFyAFKAIIIRhBBCEZIBggGXQhGiAXIBpqIRsgBSgCBCEcIBsgHBDIAyEdIB0tAAAhHiAeIRULIBUhH0EBISAgHyAgcSEhQRAhIiAFICJqISMgIyQAICEPC8gDATV/IwAhBUEwIQYgBSAGayEHIAckACAHIAA2AiwgByABNgIoIAcgAjYCJCAHIAM2AiAgBCEIIAcgCDoAHyAHKAIsIQlB1AAhCiAJIApqIQsgBygCKCEMQQQhDSAMIA10IQ4gCyAOaiEPIAcgDzYCGCAHKAIkIRAgBygCICERIBAgEWohEiAHIBI2AhAgBygCGCETIBMQ7wIhFCAHIBQ2AgxBECEVIAcgFWohFiAWIRdBDCEYIAcgGGohGSAZIRogFyAaECghGyAbKAIAIRwgByAcNgIUIAcoAiQhHSAHIB02AggCQANAIAcoAgghHiAHKAIUIR8gHiEgIB8hISAgICFIISJBASEjICIgI3EhJCAkRQ0BIAcoAhghJSAHKAIIISYgJSAmEMgDIScgByAnNgIEIActAB8hKCAHKAIEISlBASEqICggKnEhKyApICs6AAAgBy0AHyEsQQEhLSAsIC1xIS4CQCAuDQAgBygCBCEvQQwhMCAvIDBqITEgMRDYAyEyIAcoAgQhMyAzKAIEITQgNCAyNgIACyAHKAIIITVBASE2IDUgNmohNyAHIDc2AggMAAsAC0EwITggByA4aiE5IDkkAA8LPQEHfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEFEhBUEQIQYgAyAGaiEHIAckACAFDwuRAQEQfyMAIQJBECEDIAIgA2shBCAEJAAgBCAANgIMIAQgATYCCCAEKAIMIQUgBCgCCCEGIAUgBjYCDEH0ACEHIAUgB2ohCCAIENoDIQlBASEKIAkgCnEhCwJAIAtFDQBB9AAhDCAFIAxqIQ0gDRDbAyEOIAUoAgwhDyAOIA8Q3AMLQRAhECAEIBBqIREgESQADwtjAQ5/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQ3QMhBSAFKAIAIQZBACEHIAYhCCAHIQkgCCAJRyEKQQEhCyAKIAtxIQxBECENIAMgDWohDiAOJAAgDA8LRQEIfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEN0DIQUgBSgCACEGQRAhByADIAdqIQggCCQAIAYPC4gBAQ5/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgwhBSAEKAIIIQYgBSAGNgIcIAUoAhAhByAEKAIIIQggByAIbCEJQQEhCkEBIQsgCiALcSEMIAUgCSAMEN4DGkEAIQ0gBSANNgIYIAUQ3wNBECEOIAQgDmohDyAPJAAPCz4BB38jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBD2AyEFQRAhBiADIAZqIQcgByQAIAUPC3gBDn8jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggAiEGIAUgBjoAByAFKAIMIQcgBSgCCCEIQQIhCSAIIAl0IQogBS0AByELQQEhDCALIAxxIQ0gByAKIA0QrwEhDkEQIQ8gBSAPaiEQIBAkACAODwtqAQ1/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQ2AMhBSAEKAIQIQYgBCgCHCEHIAYgB2whCEECIQkgCCAJdCEKQQAhCyAFIAsgChCLBhpBECEMIAMgDGohDSANJAAPC0wBB38jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAFIAYQHhpBECEHIAQgB2ohCCAIJAAgBQ8LhwEBDn8jACEDQRAhBCADIARrIQUgBSQAIAUgADYCDCAFIAE2AgggBSACNgIEIAUoAgwhBiAFKAIIIQdBBCEIIAcgCHQhCSAGIAlqIQpBCCELIAsQ0gUhDCAFKAIIIQ0gBSgCBCEOIAwgDSAOEOkDGiAKIAwQ6gMaQRAhDyAFIA9qIRAgECQADwu6AwExfyMAIQZBMCEHIAYgB2shCCAIJAAgCCAANgIsIAggATYCKCAIIAI2AiQgCCADNgIgIAggBDYCHCAIIAU2AhggCCgCLCEJQdQAIQogCSAKaiELIAgoAighDEEEIQ0gDCANdCEOIAsgDmohDyAIIA82AhQgCCgCJCEQIAgoAiAhESAQIBFqIRIgCCASNgIMIAgoAhQhEyATEO8CIRQgCCAUNgIIQQwhFSAIIBVqIRYgFiEXQQghGCAIIBhqIRkgGSEaIBcgGhAoIRsgGygCACEcIAggHDYCECAIKAIkIR0gCCAdNgIEAkADQCAIKAIEIR4gCCgCECEfIB4hICAfISEgICAhSCEiQQEhIyAiICNxISQgJEUNASAIKAIUISUgCCgCBCEmICUgJhDIAyEnIAggJzYCACAIKAIAISggKC0AACEpQQEhKiApICpxISsCQCArRQ0AIAgoAhwhLEEEIS0gLCAtaiEuIAggLjYCHCAsKAIAIS8gCCgCACEwIDAoAgQhMSAxIC82AgALIAgoAgQhMkEBITMgMiAzaiE0IAggNDYCBAwACwALQTAhNSAIIDVqITYgNiQADwuUAQERfyMAIQNBECEEIAMgBGshBSAFJAAgBSAANgIMIAUgATgCCCAFIAI2AgQgBSgCDCEGQTQhByAGIAdqIQggCBCzAyEJQTQhCiAGIApqIQtBECEMIAsgDGohDSANELMDIQ4gBSgCBCEPIAYoAgAhECAQKAIIIREgBiAJIA4gDyAREQcAQRAhEiAFIBJqIRMgEyQADwv9BAFQfyMAIQJBICEDIAIgA2shBCAEJAAgBCAANgIcIAQgATYCGCAEKAIcIQUgBCgCGCEGIAUoAhghByAGIQggByEJIAggCUchCkEBIQsgCiALcSEMAkAgDEUNAEEAIQ0gBSANEO4CIQ4gBCAONgIQQQEhDyAFIA8Q7gIhECAEIBA2AgxBACERIAQgETYCFAJAA0AgBCgCFCESIAQoAhAhEyASIRQgEyEVIBQgFUghFkEBIRcgFiAXcSEYIBhFDQFB1AAhGSAFIBlqIRogBCgCFCEbIBogGxDIAyEcIAQgHDYCCCAEKAIIIR1BDCEeIB0gHmohHyAEKAIYISBBASEhQQEhIiAhICJxISMgHyAgICMQ3gMaIAQoAgghJEEMISUgJCAlaiEmICYQ2AMhJyAEKAIYIShBAiEpICggKXQhKkEAISsgJyArICoQiwYaIAQoAhQhLEEBIS0gLCAtaiEuIAQgLjYCFAwACwALQQAhLyAEIC82AhQCQANAIAQoAhQhMCAEKAIMITEgMCEyIDEhMyAyIDNIITRBASE1IDQgNXEhNiA2RQ0BQdQAITcgBSA3aiE4QRAhOSA4IDlqITogBCgCFCE7IDogOxDIAyE8IAQgPDYCBCAEKAIEIT1BDCE+ID0gPmohPyAEKAIYIUBBASFBQQEhQiBBIEJxIUMgPyBAIEMQ3gMaIAQoAgQhREEMIUUgRCBFaiFGIEYQ2AMhRyAEKAIYIUhBAiFJIEggSXQhSkEAIUsgRyBLIEoQiwYaIAQoAhQhTEEBIU0gTCBNaiFOIAQgTjYCFAwACwALIAQoAhghTyAFIE82AhgLQSAhUCAEIFBqIVEgUSQADwszAQZ/IwAhAkEQIQMgAiADayEEIAQgADYCDCAEIAE2AghBACEFQQEhBiAFIAZxIQcgBw8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQPC1oBCX8jACECQRAhAyACIANrIQQgBCQAIAQgADYCDCAEIAE2AgggBCgCDCEFIAQoAgghBiAGEOYDIQcgBygCACEIIAUgCDYCAEEQIQkgBCAJaiEKIAokACAFDwskAQR/IwAhAUEQIQIgASACayEDIAMgADYCBCADKAIEIQQgBA8LTgEGfyMAIQNBECEEIAMgBGshBSAFIAA2AgwgBSABNgIIIAUgAjYCBCAFKAIMIQYgBSgCCCEHIAYgBzYCACAFKAIEIQggBiAINgIEIAYPC4oCASB/IwAhAkEgIQMgAiADayEEIAQkACAEIAA2AhggBCABNgIUIAQoAhghBSAFENMDIQYgBCAGNgIQIAQoAhAhB0EBIQggByAIaiEJQQIhCiAJIAp0IQtBACEMQQEhDSAMIA1xIQ4gBSALIA4QtgEhDyAEIA82AgwgBCgCDCEQQQAhESAQIRIgESETIBIgE0chFEEBIRUgFCAVcSEWAkACQCAWRQ0AIAQoAhQhFyAEKAIMIRggBCgCECEZQQIhGiAZIBp0IRsgGCAbaiEcIBwgFzYCACAEKAIUIR0gBCAdNgIcDAELQQAhHiAEIB42AhwLIAQoAhwhH0EgISAgBCAgaiEhICEkACAfDws+AQd/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQ7gMhBUEQIQYgAyAGaiEHIAckACAFDws+AQd/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQ7wMhBUEQIQYgAyAGaiEHIAckACAFDwtsAQx/IwAhAkEQIQMgAiADayEEIAQkACAEIAA2AgwgBCABNgIIIAQoAgghBUEAIQYgBSEHIAYhCCAHIAhGIQlBASEKIAkgCnEhCwJAIAsNACAFEPADGiAFENMFC0EQIQwgBCAMaiENIA0kAA8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQPCyQBBH8jACEBQRAhAiABIAJrIQMgAyAANgIMIAMoAgwhBCAEDws9AQZ/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwgAygCDCEEIAQQ8QMaQRAhBSADIAVqIQYgBiQAIAQPCzwBBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBA3GkEQIQUgAyAFaiEGIAYkACAEDwvKAwE6fyMAIQNBICEEIAMgBGshBSAFJAAgBSAANgIcIAEhBiAFIAY6ABsgBSACNgIUIAUoAhwhByAFLQAbIQhBASEJIAggCXEhCgJAIApFDQAgBxDTAyELQQEhDCALIAxrIQ0gBSANNgIQAkADQCAFKAIQIQ5BACEPIA4hECAPIREgECARTiESQQEhEyASIBNxIRQgFEUNASAFKAIQIRUgByAVENQDIRYgBSAWNgIMIAUoAgwhF0EAIRggFyEZIBghGiAZIBpHIRtBASEcIBsgHHEhHQJAIB1FDQAgBSgCFCEeQQAhHyAeISAgHyEhICAgIUchIkEBISMgIiAjcSEkAkACQCAkRQ0AIAUoAhQhJSAFKAIMISYgJiAlEQMADAELIAUoAgwhJ0EAISggJyEpICghKiApICpGIStBASEsICsgLHEhLQJAIC0NACAnENMFCwsLIAUoAhAhLkECIS8gLiAvdCEwQQAhMUEBITIgMSAycSEzIAcgMCAzEK8BGiAFKAIQITRBfyE1IDQgNWohNiAFIDY2AhAMAAsACwtBACE3QQAhOEEBITkgOCA5cSE6IAcgNyA6EK8BGkEgITsgBSA7aiE8IDwkAA8LPAEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMIAMoAgwhBCAEEDcaQRAhBSADIAVqIQYgBiQAIAQPCwwBAX8Q9QMhACAADwsPAQF/Qf////8HIQAgAA8LJAEEfyMAIQFBECECIAEgAmshAyADIAA2AgwgAygCDCEEIAQPC0UBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQgBBD4AyEFIAUQhQUhBkEQIQcgAyAHaiEIIAgkACAGDws5AQZ/IwAhAUEQIQIgASACayEDIAMgADYCCCADKAIIIQQgBCgCBCEFIAMgBTYCDCADKAIMIQYgBg8L1wMBNn8Q+gMhAEHpHSEBIAAgARAEEPsDIQJB7h0hA0EBIQRBASEFQQAhBkEBIQcgBSAHcSEIQQEhCSAGIAlxIQogAiADIAQgCCAKEAVB8x0hCyALEPwDQfgdIQwgDBD9A0GEHiENIA0Q/gNBkh4hDiAOEP8DQZgeIQ8gDxCABEGnHiEQIBAQgQRBqx4hESAREIIEQbgeIRIgEhCDBEG9HiETIBMQhARByx4hFCAUEIUEQdEeIRUgFRCGBBCHBCEWQdgeIRcgFiAXEAYQiAQhGEHkHiEZIBggGRAGEIkEIRpBBCEbQYUfIRwgGiAbIBwQBxCKBCEdQQIhHkGSHyEfIB0gHiAfEAcQiwQhIEEEISFBoR8hIiAgICEgIhAHEIwEISNBsB8hJCAjICQQCEHAHyElICUQjQRB3h8hJiAmEI4EQYMgIScgJxCPBEGqICEoICgQkARBySAhKSApEJEEQfEgISogKhCSBEGOISErICsQkwRBtCEhLCAsEJQEQdIhIS0gLRCVBEH5ISEuIC4QjgRBmSIhLyAvEI8EQboiITAgMBCQBEHbIiExIDEQkQRB/SIhMiAyEJIEQZ4jITMgMxCTBEHAIyE0IDQQlgRB3yMhNSA1EJcEDwsMAQF/EJgEIQAgAA8LDAEBfxCZBCEAIAAPC3gBEH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBCaBCEEIAMoAgwhBRCbBCEGQRghByAGIAd0IQggCCAHdSEJEJwEIQpBGCELIAogC3QhDCAMIAt1IQ1BASEOIAQgBSAOIAkgDRAJQRAhDyADIA9qIRAgECQADwt4ARB/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwQnQQhBCADKAIMIQUQngQhBkEYIQcgBiAHdCEIIAggB3UhCRCfBCEKQRghCyAKIAt0IQwgDCALdSENQQEhDiAEIAUgDiAJIA0QCUEQIQ8gAyAPaiEQIBAkAA8LbAEOfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMEKAEIQQgAygCDCEFEKEEIQZB/wEhByAGIAdxIQgQogQhCUH/ASEKIAkgCnEhC0EBIQwgBCAFIAwgCCALEAlBECENIAMgDWohDiAOJAAPC3gBEH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBCjBCEEIAMoAgwhBRCkBCEGQRAhByAGIAd0IQggCCAHdSEJEKUEIQpBECELIAogC3QhDCAMIAt1IQ1BAiEOIAQgBSAOIAkgDRAJQRAhDyADIA9qIRAgECQADwtuAQ5/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwQpgQhBCADKAIMIQUQpwQhBkH//wMhByAGIAdxIQgQqAQhCUH//wMhCiAJIApxIQtBAiEMIAQgBSAMIAggCxAJQRAhDSADIA1qIQ4gDiQADwtUAQp/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwQqQQhBCADKAIMIQUQqgQhBhCrBCEHQQQhCCAEIAUgCCAGIAcQCUEQIQkgAyAJaiEKIAokAA8LVAEKfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMEKwEIQQgAygCDCEFEK0EIQYQrgQhB0EEIQggBCAFIAggBiAHEAlBECEJIAMgCWohCiAKJAAPC1QBCn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBCvBCEEIAMoAgwhBRCwBCEGEPQDIQdBBCEIIAQgBSAIIAYgBxAJQRAhCSADIAlqIQogCiQADwtUAQp/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwQsQQhBCADKAIMIQUQsgQhBhCzBCEHQQQhCCAEIAUgCCAGIAcQCUEQIQkgAyAJaiEKIAokAA8LRgEIfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMELQEIQQgAygCDCEFQQQhBiAEIAUgBhAKQRAhByADIAdqIQggCCQADwtGAQh/IwAhAUEQIQIgASACayEDIAMkACADIAA2AgwQtQQhBCADKAIMIQVBCCEGIAQgBSAGEApBECEHIAMgB2ohCCAIJAAPCwwBAX8QtgQhACAADwsMAQF/ELcEIQAgAA8LDAEBfxC4BCEAIAAPCwwBAX8QuQQhACAADwsMAQF/ELoEIQAgAA8LDAEBfxC7BCEAIAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBC8BCEEEL0EIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBC+BCEEEL8EIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBDABCEEEMEEIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBDCBCEEEMMEIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBDEBCEEEMUEIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBDGBCEEEMcEIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBDIBCEEEMkEIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBDKBCEEEMsEIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBDMBCEEEM0EIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBDOBCEEEM8EIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPC0cBCH8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDBDQBCEEENEEIQUgAygCDCEGIAQgBSAGEAtBECEHIAMgB2ohCCAIJAAPCxABAn9B3DYhACAAIQEgAQ8LEAECf0HoNiEAIAAhASABDwsMAQF/ENQEIQAgAA8LHgEEfxDVBCEAQRghASAAIAF0IQIgAiABdSEDIAMPCx4BBH8Q1gQhAEEYIQEgACABdCECIAIgAXUhAyADDwsMAQF/ENcEIQAgAA8LHgEEfxDYBCEAQRghASAAIAF0IQIgAiABdSEDIAMPCx4BBH8Q2QQhAEEYIQEgACABdCECIAIgAXUhAyADDwsMAQF/ENoEIQAgAA8LGAEDfxDbBCEAQf8BIQEgACABcSECIAIPCxgBA38Q3AQhAEH/ASEBIAAgAXEhAiACDwsMAQF/EN0EIQAgAA8LHgEEfxDeBCEAQRAhASAAIAF0IQIgAiABdSEDIAMPCx4BBH8Q3wQhAEEQIQEgACABdCECIAIgAXUhAyADDwsMAQF/EOAEIQAgAA8LGQEDfxDhBCEAQf//AyEBIAAgAXEhAiACDwsZAQN/EOIEIQBB//8DIQEgACABcSECIAIPCwwBAX8Q4wQhACAADwsMAQF/EOQEIQAgAA8LDAEBfxDlBCEAIAAPCwwBAX8Q5gQhACAADwsMAQF/EOcEIQAgAA8LDAEBfxDoBCEAIAAPCwwBAX8Q6QQhACAADwsMAQF/EOoEIQAgAA8LDAEBfxDrBCEAIAAPCwwBAX8Q7AQhACAADwsMAQF/EO0EIQAgAA8LDAEBfxDuBCEAIAAPCwwBAX8Q7wQhACAADwsQAQJ/QYQSIQAgACEBIAEPCxABAn9BwCQhACAAIQEgAQ8LEAECf0GYJSEAIAAhASABDwsQAQJ/QfQlIQAgACEBIAEPCxABAn9B0CYhACAAIQEgAQ8LEAECf0H8JiEAIAAhASABDwsMAQF/EPAEIQAgAA8LCwEBf0EAIQAgAA8LDAEBfxDxBCEAIAAPCwsBAX9BACEAIAAPCwwBAX8Q8gQhACAADwsLAQF/QQEhACAADwsMAQF/EPMEIQAgAA8LCwEBf0ECIQAgAA8LDAEBfxD0BCEAIAAPCwsBAX9BAyEAIAAPCwwBAX8Q9QQhACAADwsLAQF/QQQhACAADwsMAQF/EPYEIQAgAA8LCwEBf0EFIQAgAA8LDAEBfxD3BCEAIAAPCwsBAX9BBCEAIAAPCwwBAX8Q+AQhACAADwsLAQF/QQUhACAADwsMAQF/EPkEIQAgAA8LCwEBf0EGIQAgAA8LDAEBfxD6BCEAIAAPCwsBAX9BByEAIAAPCxcBAn9B3D8hAEGeASEBIAAgAREAABoPCzoBBn8jACEBQRAhAiABIAJrIQMgAyQAIAMgADYCDCADKAIMIQQQ+QNBECEFIAMgBWohBiAGJAAgBA8LEAECf0H0NiEAIAAhASABDwseAQR/QYABIQBBGCEBIAAgAXQhAiACIAF1IQMgAw8LHgEEf0H/ACEAQRghASAAIAF0IQIgAiABdSEDIAMPCxABAn9BjDchACAAIQEgAQ8LHgEEf0GAASEAQRghASAAIAF0IQIgAiABdSEDIAMPCx4BBH9B/wAhAEEYIQEgACABdCECIAIgAXUhAyADDwsQAQJ/QYA3IQAgACEBIAEPCxcBA39BACEAQf8BIQEgACABcSECIAIPCxgBA39B/wEhAEH/ASEBIAAgAXEhAiACDwsQAQJ/QZg3IQAgACEBIAEPCx8BBH9BgIACIQBBECEBIAAgAXQhAiACIAF1IQMgAw8LHwEEf0H//wEhAEEQIQEgACABdCECIAIgAXUhAyADDwsQAQJ/QaQ3IQAgACEBIAEPCxgBA39BACEAQf//AyEBIAAgAXEhAiACDwsaAQN/Qf//AyEAQf//AyEBIAAgAXEhAiACDwsQAQJ/QbA3IQAgACEBIAEPCw8BAX9BgICAgHghACAADwsPAQF/Qf////8HIQAgAA8LEAECf0G8NyEAIAAhASABDwsLAQF/QQAhACAADwsLAQF/QX8hACAADwsQAQJ/Qcg3IQAgACEBIAEPCw8BAX9BgICAgHghACAADwsQAQJ/QdQ3IQAgACEBIAEPCwsBAX9BACEAIAAPCwsBAX9BfyEAIAAPCxABAn9B4DchACAAIQEgAQ8LEAECf0HsNyEAIAAhASABDwsQAQJ/QaQnIQAgACEBIAEPCxABAn9BzCchACAAIQEgAQ8LEAECf0H0JyEAIAAhASABDwsQAQJ/QZwoIQAgACEBIAEPCxABAn9BxCghACAAIQEgAQ8LEAECf0HsKCEAIAAhASABDwsQAQJ/QZQpIQAgACEBIAEPCxABAn9BvCkhACAAIQEgAQ8LEAECf0HkKSEAIAAhASABDwsQAQJ/QYwqIQAgACEBIAEPCxABAn9BtCohACAAIQEgAQ8LBgAQ0gQPC3ABAX8CQAJAIAANAEEAIQJBACgC4D8iAEUNAQsCQCAAIAAgARCEBWoiAi0AAA0AQQBBADYC4D9BAA8LAkAgAiACIAEQgwVqIgAtAABFDQBBACAAQQFqNgLgPyAAQQA6AAAgAg8LQQBBADYC4D8LIAIL5wEBAn8gAkEARyEDAkACQAJAIAJFDQAgAEEDcUUNACABQf8BcSEEA0AgAC0AACAERg0CIABBAWohACACQX9qIgJBAEchAyACRQ0BIABBA3ENAAsLIANFDQELAkAgAC0AACABQf8BcUYNACACQQRJDQAgAUH/AXFBgYKECGwhBANAIAAoAgAgBHMiA0F/cyADQf/9+3dqcUGAgYKEeHENASAAQQRqIQAgAkF8aiICQQNLDQALCyACRQ0AIAFB/wFxIQMDQAJAIAAtAAAgA0cNACAADwsgAEEBaiEAIAJBf2oiAg0ACwtBAAtlAAJAIAANACACKAIAIgANAEEADwsCQCAAIAAgARCEBWoiAC0AAA0AIAJBADYCAEEADwsCQCAAIAAgARCDBWoiAS0AAEUNACACIAFBAWo2AgAgAUEAOgAAIAAPCyACQQA2AgAgAAvkAQECfwJAAkAgAUH/AXEiAkUNAAJAIABBA3FFDQADQCAALQAAIgNFDQMgAyABQf8BcUYNAyAAQQFqIgBBA3ENAAsLAkAgACgCACIDQX9zIANB//37d2pxQYCBgoR4cQ0AIAJBgYKECGwhAgNAIAMgAnMiA0F/cyADQf/9+3dqcUGAgYKEeHENASAAKAIEIQMgAEEEaiEAIANBf3MgA0H//ft3anFBgIGChHhxRQ0ACwsCQANAIAAiAy0AACICRQ0BIANBAWohACACIAFB/wFxRw0ACwsgAw8LIAAgABCRBmoPCyAAC80BAQF/AkACQCABIABzQQNxDQACQCABQQNxRQ0AA0AgACABLQAAIgI6AAAgAkUNAyAAQQFqIQAgAUEBaiIBQQNxDQALCyABKAIAIgJBf3MgAkH//ft3anFBgIGChHhxDQADQCAAIAI2AgAgASgCBCECIABBBGohACABQQRqIQEgAkF/cyACQf/9+3dqcUGAgYKEeHFFDQALCyAAIAEtAAAiAjoAACACRQ0AA0AgACABLQABIgI6AAEgAEEBaiEAIAFBAWohASACDQALCyAACwwAIAAgARCABRogAAtZAQJ/IAEtAAAhAgJAIAAtAAAiA0UNACADIAJB/wFxRw0AA0AgAS0AASECIAAtAAEiA0UNASABQQFqIQEgAEEBaiEAIAMgAkH/AXFGDQALCyADIAJB/wFxawvUAQEDfyMAQSBrIgIkAAJAAkACQCABLAAAIgNFDQAgAS0AAQ0BCyAAIAMQ/wQhBAwBCyACQQBBIBCLBhoCQCABLQAAIgNFDQADQCACIANBA3ZBHHFqIgQgBCgCAEEBIANBH3F0cjYCACABLQABIQMgAUEBaiEBIAMNAAsLIAAhBCAALQAAIgNFDQAgACEBA0ACQCACIANBA3ZBHHFqKAIAIANBH3F2QQFxRQ0AIAEhBAwCCyABLQABIQMgAUEBaiIEIQEgAw0ACwsgAkEgaiQAIAQgAGsLkgIBBH8jAEEgayICQRhqQgA3AwAgAkEQakIANwMAIAJCADcDCCACQgA3AwACQCABLQAAIgMNAEEADwsCQCABLQABIgQNACAAIQQDQCAEIgFBAWohBCABLQAAIANGDQALIAEgAGsPCyACIANBA3ZBHHFqIgUgBSgCAEEBIANBH3F0cjYCAANAIARBH3EhAyAEQQN2IQUgAS0AAiEEIAIgBUEccWoiBSAFKAIAQQEgA3RyNgIAIAFBAWohASAEDQALIAAhAwJAIAAtAAAiBEUNACAAIQEDQAJAIAIgBEEDdkEccWooAgAgBEEfcXZBAXENACABIQMMAgsgAS0AASEEIAFBAWoiAyEBIAQNAAsLIAMgAGsLJAECfwJAIAAQkQZBAWoiARCBBiICDQBBAA8LIAIgACABEIoGC7sBAwF+AX8BfAJAIAC9IgFCNIinQf8PcSICQbIISw0AAkAgAkH9B0sNACAARAAAAAAAAAAAog8LAkACQCAAIACaIAFCf1UbIgBEAAAAAAAAMEOgRAAAAAAAADDDoCAAoSIDRAAAAAAAAOA/ZEEBcw0AIAAgA6BEAAAAAAAA8L+gIQAMAQsgACADoCEAIANEAAAAAAAA4L9lQQFzDQAgAEQAAAAAAADwP6AhAAsgACAAmiABQn9VGyEACyAACwUAQeQ/C7sBAQJ/IwBBoAFrIgQkACAEQQhqQcAqQZABEIoGGgJAAkACQCABQX9qQf////8HSQ0AIAENASAEQZ8BaiEAQQEhAQsgBCAANgI0IAQgADYCHCAEQX4gAGsiBSABIAEgBUsbIgE2AjggBCAAIAFqIgA2AiQgBCAANgIYIARBCGogAiADEJoFIQAgAUUNASAEKAIcIgEgASAEKAIYRmtBADoAAAwBCxCHBUE9NgIAQX8hAAsgBEGgAWokACAACzQBAX8gACgCFCIDIAEgAiAAKAIQIANrIgMgAyACSxsiAxCKBhogACAAKAIUIANqNgIUIAILEQAgAEH/////ByABIAIQiAULKAEBfyMAQRBrIgMkACADIAI2AgwgACABIAIQigUhAiADQRBqJAAgAguBAQECfyAAIAAtAEoiAUF/aiABcjoASgJAIAAoAhQgACgCHE0NACAAQQBBACAAKAIkEQUAGgsgAEEANgIcIABCADcDEAJAIAAoAgAiAUEEcUUNACAAIAFBIHI2AgBBfw8LIAAgACgCLCAAKAIwaiICNgIIIAAgAjYCBCABQRt0QR91CwoAIABBUGpBCkkLpAIBAX9BASEDAkACQCAARQ0AIAFB/wBNDQECQAJAELkFKAKsASgCAA0AIAFBgH9xQYC/A0YNAxCHBUEZNgIADAELAkAgAUH/D0sNACAAIAFBP3FBgAFyOgABIAAgAUEGdkHAAXI6AABBAg8LAkACQCABQYCwA0kNACABQYBAcUGAwANHDQELIAAgAUE/cUGAAXI6AAIgACABQQx2QeABcjoAACAAIAFBBnZBP3FBgAFyOgABQQMPCwJAIAFBgIB8akH//z9LDQAgACABQT9xQYABcjoAAyAAIAFBEnZB8AFyOgAAIAAgAUEGdkE/cUGAAXI6AAIgACABQQx2QT9xQYABcjoAAUEEDwsQhwVBGTYCAAtBfyEDCyADDwsgACABOgAAQQELFQACQCAADQBBAA8LIAAgAUEAEI4FC48BAgF+AX8CQCAAvSICQjSIp0H/D3EiA0H/D0YNAAJAIAMNAAJAAkAgAEQAAAAAAAAAAGINAEEAIQMMAQsgAEQAAAAAAADwQ6IgARCQBSEAIAEoAgBBQGohAwsgASADNgIAIAAPCyABIANBgnhqNgIAIAJC/////////4eAf4NCgICAgICAgPA/hL8hAAsgAAuOAwEDfyMAQdABayIFJAAgBSACNgLMAUEAIQIgBUGgAWpBAEEoEIsGGiAFIAUoAswBNgLIAQJAAkBBACABIAVByAFqIAVB0ABqIAVBoAFqIAMgBBCSBUEATg0AQX8hAQwBCwJAIAAoAkxBAEgNACAAEI8GIQILIAAoAgAhBgJAIAAsAEpBAEoNACAAIAZBX3E2AgALIAZBIHEhBgJAAkAgACgCMEUNACAAIAEgBUHIAWogBUHQAGogBUGgAWogAyAEEJIFIQEMAQsgAEHQADYCMCAAIAVB0ABqNgIQIAAgBTYCHCAAIAU2AhQgACgCLCEHIAAgBTYCLCAAIAEgBUHIAWogBUHQAGogBUGgAWogAyAEEJIFIQEgB0UNACAAQQBBACAAKAIkEQUAGiAAQQA2AjAgACAHNgIsIABBADYCHCAAQQA2AhAgACgCFCEDIABBADYCFCABQX8gAxshAQsgACAAKAIAIgMgBnI2AgBBfyABIANBIHEbIQEgAkUNACAAEJAGCyAFQdABaiQAIAELpBICD38BfiMAQdAAayIHJAAgByABNgJMIAdBN2ohCCAHQThqIQlBACEKQQAhC0EAIQECQANAAkAgC0EASA0AAkAgAUH/////ByALa0wNABCHBUE9NgIAQX8hCwwBCyABIAtqIQsLIAcoAkwiDCEBAkACQAJAAkACQCAMLQAAIg1FDQADQAJAAkACQCANQf8BcSINDQAgASENDAELIA1BJUcNASABIQ0DQCABLQABQSVHDQEgByABQQJqIg42AkwgDUEBaiENIAEtAAIhDyAOIQEgD0ElRg0ACwsgDSAMayEBAkAgAEUNACAAIAwgARCTBQsgAQ0HIAcoAkwsAAEQjQUhASAHKAJMIQ0CQAJAIAFFDQAgDS0AAkEkRw0AIA1BA2ohASANLAABQVBqIRBBASEKDAELIA1BAWohAUF/IRALIAcgATYCTEEAIRECQAJAIAEsAAAiD0FgaiIOQR9NDQAgASENDAELQQAhESABIQ1BASAOdCIOQYnRBHFFDQADQCAHIAFBAWoiDTYCTCAOIBFyIREgASwAASIPQWBqIg5BIE8NASANIQFBASAOdCIOQYnRBHENAAsLAkACQCAPQSpHDQACQAJAIA0sAAEQjQVFDQAgBygCTCINLQACQSRHDQAgDSwAAUECdCAEakHAfmpBCjYCACANQQNqIQEgDSwAAUEDdCADakGAfWooAgAhEkEBIQoMAQsgCg0GQQAhCkEAIRICQCAARQ0AIAIgAigCACIBQQRqNgIAIAEoAgAhEgsgBygCTEEBaiEBCyAHIAE2AkwgEkF/Sg0BQQAgEmshEiARQYDAAHIhEQwBCyAHQcwAahCUBSISQQBIDQQgBygCTCEBC0F/IRMCQCABLQAAQS5HDQACQCABLQABQSpHDQACQCABLAACEI0FRQ0AIAcoAkwiAS0AA0EkRw0AIAEsAAJBAnQgBGpBwH5qQQo2AgAgASwAAkEDdCADakGAfWooAgAhEyAHIAFBBGoiATYCTAwCCyAKDQUCQAJAIAANAEEAIRMMAQsgAiACKAIAIgFBBGo2AgAgASgCACETCyAHIAcoAkxBAmoiATYCTAwBCyAHIAFBAWo2AkwgB0HMAGoQlAUhEyAHKAJMIQELQQAhDQNAIA0hDkF/IRQgASwAAEG/f2pBOUsNCSAHIAFBAWoiDzYCTCABLAAAIQ0gDyEBIA0gDkE6bGpBrytqLQAAIg1Bf2pBCEkNAAsCQAJAAkAgDUETRg0AIA1FDQsCQCAQQQBIDQAgBCAQQQJ0aiANNgIAIAcgAyAQQQN0aikDADcDQAwCCyAARQ0JIAdBwABqIA0gAiAGEJUFIAcoAkwhDwwCC0F/IRQgEEF/Sg0KC0EAIQEgAEUNCAsgEUH//3txIhUgESARQYDAAHEbIQ1BACEUQdArIRAgCSERAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgD0F/aiwAACIBQV9xIAEgAUEPcUEDRhsgASAOGyIBQah/ag4hBBUVFRUVFRUVDhUPBg4ODhUGFRUVFQIFAxUVCRUBFRUEAAsgCSERAkAgAUG/f2oOBw4VCxUODg4ACyABQdMARg0JDBMLQQAhFEHQKyEQIAcpA0AhFgwFC0EAIQECQAJAAkACQAJAAkACQCAOQf8BcQ4IAAECAwQbBQYbCyAHKAJAIAs2AgAMGgsgBygCQCALNgIADBkLIAcoAkAgC6w3AwAMGAsgBygCQCALOwEADBcLIAcoAkAgCzoAAAwWCyAHKAJAIAs2AgAMFQsgBygCQCALrDcDAAwUCyATQQggE0EISxshEyANQQhyIQ1B+AAhAQtBACEUQdArIRAgBykDQCAJIAFBIHEQlgUhDCANQQhxRQ0DIAcpA0BQDQMgAUEEdkHQK2ohEEECIRQMAwtBACEUQdArIRAgBykDQCAJEJcFIQwgDUEIcUUNAiATIAkgDGsiAUEBaiATIAFKGyETDAILAkAgBykDQCIWQn9VDQAgB0IAIBZ9IhY3A0BBASEUQdArIRAMAQsCQCANQYAQcUUNAEEBIRRB0SshEAwBC0HSK0HQKyANQQFxIhQbIRALIBYgCRCYBSEMCyANQf//e3EgDSATQX9KGyENIAcpA0AhFgJAIBMNACAWUEUNAEEAIRMgCSEMDAwLIBMgCSAMayAWUGoiASATIAFKGyETDAsLQQAhFCAHKAJAIgFB2isgARsiDEEAIBMQ/QQiASAMIBNqIAEbIREgFSENIAEgDGsgEyABGyETDAsLAkAgE0UNACAHKAJAIQ4MAgtBACEBIABBICASQQAgDRCZBQwCCyAHQQA2AgwgByAHKQNAPgIIIAcgB0EIajYCQEF/IRMgB0EIaiEOC0EAIQECQANAIA4oAgAiD0UNAQJAIAdBBGogDxCPBSIPQQBIIgwNACAPIBMgAWtLDQAgDkEEaiEOIBMgDyABaiIBSw0BDAILC0F/IRQgDA0MCyAAQSAgEiABIA0QmQUCQCABDQBBACEBDAELQQAhDiAHKAJAIQ8DQCAPKAIAIgxFDQEgB0EEaiAMEI8FIgwgDmoiDiABSg0BIAAgB0EEaiAMEJMFIA9BBGohDyAOIAFJDQALCyAAQSAgEiABIA1BgMAAcxCZBSASIAEgEiABShshAQwJCyAAIAcrA0AgEiATIA0gASAFERsAIQEMCAsgByAHKQNAPAA3QQEhEyAIIQwgCSERIBUhDQwFCyAHIAFBAWoiDjYCTCABLQABIQ0gDiEBDAALAAsgCyEUIAANBSAKRQ0DQQEhAQJAA0AgBCABQQJ0aigCACINRQ0BIAMgAUEDdGogDSACIAYQlQVBASEUIAFBAWoiAUEKRw0ADAcLAAtBASEUIAFBCk8NBQNAIAQgAUECdGooAgANAUEBIRQgAUEBaiIBQQpGDQYMAAsAC0F/IRQMBAsgCSERCyAAQSAgFCARIAxrIg8gEyATIA9IGyIRaiIOIBIgEiAOSBsiASAOIA0QmQUgACAQIBQQkwUgAEEwIAEgDiANQYCABHMQmQUgAEEwIBEgD0EAEJkFIAAgDCAPEJMFIABBICABIA4gDUGAwABzEJkFDAELC0EAIRQLIAdB0ABqJAAgFAsZAAJAIAAtAABBIHENACABIAIgABCOBhoLC0sBA39BACEBAkAgACgCACwAABCNBUUNAANAIAAoAgAiAiwAACEDIAAgAkEBajYCACADIAFBCmxqQVBqIQEgAiwAARCNBQ0ACwsgAQu7AgACQCABQRRLDQACQAJAAkACQAJAAkACQAJAAkACQCABQXdqDgoAAQIDBAUGBwgJCgsgAiACKAIAIgFBBGo2AgAgACABKAIANgIADwsgAiACKAIAIgFBBGo2AgAgACABNAIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMADwsgAiACKAIAIgFBBGo2AgAgACABMgEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMwEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMAAANwMADwsgAiACKAIAIgFBBGo2AgAgACABMQAANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKwMAOQMADwsgACACIAMRBAALCzUAAkAgAFANAANAIAFBf2oiASAAp0EPcUHAL2otAAAgAnI6AAAgAEIEiCIAQgBSDQALCyABCy4AAkAgAFANAANAIAFBf2oiASAAp0EHcUEwcjoAACAAQgOIIgBCAFINAAsLIAELiAECAX4DfwJAAkAgAEKAgICAEFoNACAAIQIMAQsDQCABQX9qIgEgACAAQgqAIgJCCn59p0EwcjoAACAAQv////+fAVYhAyACIQAgAw0ACwsCQCACpyIDRQ0AA0AgAUF/aiIBIAMgA0EKbiIEQQpsa0EwcjoAACADQQlLIQUgBCEDIAUNAAsLIAELcwEBfyMAQYACayIFJAACQCACIANMDQAgBEGAwARxDQAgBSABQf8BcSACIANrIgJBgAIgAkGAAkkiAxsQiwYaAkAgAw0AA0AgACAFQYACEJMFIAJBgH5qIgJB/wFLDQALCyAAIAUgAhCTBQsgBUGAAmokAAsRACAAIAEgAkGgAUGhARCRBQuqGAMSfwJ+AXwjAEGwBGsiBiQAQQAhByAGQQA2AiwCQAJAIAEQnQUiGEJ/VQ0AQQEhCEHQLyEJIAGaIgEQnQUhGAwBC0EBIQgCQCAEQYAQcUUNAEHTLyEJDAELQdYvIQkgBEEBcQ0AQQAhCEEBIQdB0S8hCQsCQAJAIBhCgICAgICAgPj/AINCgICAgICAgPj/AFINACAAQSAgAiAIQQNqIgogBEH//3txEJkFIAAgCSAIEJMFIABB6y9B7y8gBUEgcSILG0HjL0HnLyALGyABIAFiG0EDEJMFIABBICACIAogBEGAwABzEJkFDAELIAZBEGohDAJAAkACQAJAIAEgBkEsahCQBSIBIAGgIgFEAAAAAAAAAABhDQAgBiAGKAIsIgtBf2o2AiwgBUEgciINQeEARw0BDAMLIAVBIHIiDUHhAEYNAkEGIAMgA0EASBshDiAGKAIsIQ8MAQsgBiALQWNqIg82AixBBiADIANBAEgbIQ4gAUQAAAAAAACwQaIhAQsgBkEwaiAGQdACaiAPQQBIGyIQIREDQAJAAkAgAUQAAAAAAADwQWMgAUQAAAAAAAAAAGZxRQ0AIAGrIQsMAQtBACELCyARIAs2AgAgEUEEaiERIAEgC7ihRAAAAABlzc1BoiIBRAAAAAAAAAAAYg0ACwJAAkAgD0EBTg0AIA8hAyARIQsgECESDAELIBAhEiAPIQMDQCADQR0gA0EdSBshAwJAIBFBfGoiCyASSQ0AIAOtIRlCACEYA0AgCyALNQIAIBmGIBhC/////w+DfCIYIBhCgJTr3AOAIhhCgJTr3AN+fT4CACALQXxqIgsgEk8NAAsgGKciC0UNACASQXxqIhIgCzYCAAsCQANAIBEiCyASTQ0BIAtBfGoiESgCAEUNAAsLIAYgBigCLCADayIDNgIsIAshESADQQBKDQALCwJAIANBf0oNACAOQRlqQQltQQFqIRMgDUHmAEYhFANAQQlBACADayADQXdIGyEKAkACQCASIAtJDQAgEiASQQRqIBIoAgAbIRIMAQtBgJTr3AMgCnYhFUF/IAp0QX9zIRZBACEDIBIhEQNAIBEgESgCACIXIAp2IANqNgIAIBcgFnEgFWwhAyARQQRqIhEgC0kNAAsgEiASQQRqIBIoAgAbIRIgA0UNACALIAM2AgAgC0EEaiELCyAGIAYoAiwgCmoiAzYCLCAQIBIgFBsiESATQQJ0aiALIAsgEWtBAnUgE0obIQsgA0EASA0ACwtBACERAkAgEiALTw0AIBAgEmtBAnVBCWwhEUEKIQMgEigCACIXQQpJDQADQCARQQFqIREgFyADQQpsIgNPDQALCwJAIA5BACARIA1B5gBGG2sgDkEARyANQecARnFrIgMgCyAQa0ECdUEJbEF3ak4NACADQYDIAGoiF0EJbSIVQQJ0IAZBMGpBBHIgBkHUAmogD0EASBtqQYBgaiEKQQohAwJAIBcgFUEJbGsiF0EHSg0AA0AgA0EKbCEDIBdBAWoiF0EIRw0ACwsgCigCACIVIBUgA24iFiADbGshFwJAAkAgCkEEaiITIAtHDQAgF0UNAQtEAAAAAAAA4D9EAAAAAAAA8D9EAAAAAAAA+D8gFyADQQF2IhRGG0QAAAAAAAD4PyATIAtGGyAXIBRJGyEaRAEAAAAAAEBDRAAAAAAAAEBDIBZBAXEbIQECQCAHDQAgCS0AAEEtRw0AIBqaIRogAZohAQsgCiAVIBdrIhc2AgAgASAaoCABYQ0AIAogFyADaiIRNgIAAkAgEUGAlOvcA0kNAANAIApBADYCAAJAIApBfGoiCiASTw0AIBJBfGoiEkEANgIACyAKIAooAgBBAWoiETYCACARQf+T69wDSw0ACwsgECASa0ECdUEJbCERQQohAyASKAIAIhdBCkkNAANAIBFBAWohESAXIANBCmwiA08NAAsLIApBBGoiAyALIAsgA0sbIQsLAkADQCALIgMgEk0iFw0BIANBfGoiCygCAEUNAAsLAkACQCANQecARg0AIARBCHEhFgwBCyARQX9zQX8gDkEBIA4bIgsgEUogEUF7SnEiChsgC2ohDkF/QX4gChsgBWohBSAEQQhxIhYNAEF3IQsCQCAXDQAgA0F8aigCACIKRQ0AQQohF0EAIQsgCkEKcA0AA0AgCyIVQQFqIQsgCiAXQQpsIhdwRQ0ACyAVQX9zIQsLIAMgEGtBAnVBCWwhFwJAIAVBX3FBxgBHDQBBACEWIA4gFyALakF3aiILQQAgC0EAShsiCyAOIAtIGyEODAELQQAhFiAOIBEgF2ogC2pBd2oiC0EAIAtBAEobIgsgDiALSBshDgsgDiAWciIUQQBHIRcCQAJAIAVBX3EiFUHGAEcNACARQQAgEUEAShshCwwBCwJAIAwgESARQR91IgtqIAtzrSAMEJgFIgtrQQFKDQADQCALQX9qIgtBMDoAACAMIAtrQQJIDQALCyALQX5qIhMgBToAACALQX9qQS1BKyARQQBIGzoAACAMIBNrIQsLIABBICACIAggDmogF2ogC2pBAWoiCiAEEJkFIAAgCSAIEJMFIABBMCACIAogBEGAgARzEJkFAkACQAJAAkAgFUHGAEcNACAGQRBqQQhyIRUgBkEQakEJciERIBAgEiASIBBLGyIXIRIDQCASNQIAIBEQmAUhCwJAAkAgEiAXRg0AIAsgBkEQak0NAQNAIAtBf2oiC0EwOgAAIAsgBkEQaksNAAwCCwALIAsgEUcNACAGQTA6ABggFSELCyAAIAsgESALaxCTBSASQQRqIhIgEE0NAAsCQCAURQ0AIABB8y9BARCTBQsgEiADTw0BIA5BAUgNAQNAAkAgEjUCACAREJgFIgsgBkEQak0NAANAIAtBf2oiC0EwOgAAIAsgBkEQaksNAAsLIAAgCyAOQQkgDkEJSBsQkwUgDkF3aiELIBJBBGoiEiADTw0DIA5BCUohFyALIQ4gFw0ADAMLAAsCQCAOQQBIDQAgAyASQQRqIAMgEksbIRUgBkEQakEIciEQIAZBEGpBCXIhAyASIREDQAJAIBE1AgAgAxCYBSILIANHDQAgBkEwOgAYIBAhCwsCQAJAIBEgEkYNACALIAZBEGpNDQEDQCALQX9qIgtBMDoAACALIAZBEGpLDQAMAgsACyAAIAtBARCTBSALQQFqIQsCQCAWDQAgDkEBSA0BCyAAQfMvQQEQkwULIAAgCyADIAtrIhcgDiAOIBdKGxCTBSAOIBdrIQ4gEUEEaiIRIBVPDQEgDkF/Sg0ACwsgAEEwIA5BEmpBEkEAEJkFIAAgEyAMIBNrEJMFDAILIA4hCwsgAEEwIAtBCWpBCUEAEJkFCyAAQSAgAiAKIARBgMAAcxCZBQwBCyAJQQlqIAkgBUEgcSIRGyEOAkAgA0ELSw0AQQwgA2siC0UNAEQAAAAAAAAgQCEaA0AgGkQAAAAAAAAwQKIhGiALQX9qIgsNAAsCQCAOLQAAQS1HDQAgGiABmiAaoaCaIQEMAQsgASAaoCAaoSEBCwJAIAYoAiwiCyALQR91IgtqIAtzrSAMEJgFIgsgDEcNACAGQTA6AA8gBkEPaiELCyAIQQJyIRYgBigCLCESIAtBfmoiFSAFQQ9qOgAAIAtBf2pBLUErIBJBAEgbOgAAIARBCHEhFyAGQRBqIRIDQCASIQsCQAJAIAGZRAAAAAAAAOBBY0UNACABqiESDAELQYCAgIB4IRILIAsgEkHAL2otAAAgEXI6AAAgASASt6FEAAAAAAAAMECiIQECQCALQQFqIhIgBkEQamtBAUcNAAJAIBcNACADQQBKDQAgAUQAAAAAAAAAAGENAQsgC0EuOgABIAtBAmohEgsgAUQAAAAAAAAAAGINAAsCQAJAIANFDQAgEiAGQRBqa0F+aiADTg0AIAMgDGogFWtBAmohCwwBCyAMIAZBEGprIBVrIBJqIQsLIABBICACIAsgFmoiCiAEEJkFIAAgDiAWEJMFIABBMCACIAogBEGAgARzEJkFIAAgBkEQaiASIAZBEGprIhIQkwUgAEEwIAsgEiAMIBVrIhFqa0EAQQAQmQUgACAVIBEQkwUgAEEgIAIgCiAEQYDAAHMQmQULIAZBsARqJAAgAiAKIAogAkgbCysBAX8gASABKAIAQQ9qQXBxIgJBEGo2AgAgACACKQMAIAIpAwgQ0AU5AwALBQAgAL0LEAAgAEEgRiAAQXdqQQVJcgtBAQJ/IwBBEGsiASQAQX8hAgJAIAAQjAUNACAAIAFBD2pBASAAKAIgEQUAQQFHDQAgAS0ADyECCyABQRBqJAAgAgs/AgJ/AX4gACABNwNwIAAgACgCCCICIAAoAgQiA2usIgQ3A3ggACADIAGnaiACIAQgAVUbIAIgAUIAUhs2AmgLuwECAX4EfwJAAkACQCAAKQNwIgFQDQAgACkDeCABWQ0BCyAAEJ8FIgJBf0oNAQsgAEEANgJoQX8PCyAAKAIIIgMhBAJAIAApA3AiAVANACADIQQgASAAKQN4Qn+FfCIBIAMgACgCBCIFa6xZDQAgBSABp2ohBAsgACAENgJoIAAoAgQhBAJAIANFDQAgACAAKQN4IAMgBGtBAWqsfDcDeAsCQCACIARBf2oiAC0AAEYNACAAIAI6AAALIAILNQAgACABNwMAIAAgBEIwiKdBgIACcSACQjCIp0H//wFxcq1CMIYgAkL///////8/g4Q3AwgL5wIBAX8jAEHQAGsiBCQAAkACQCADQYCAAUgNACAEQSBqIAEgAkIAQoCAgICAgID//wAQzAUgBEEgakEIaikDACECIAQpAyAhAQJAIANB//8BTg0AIANBgYB/aiEDDAILIARBEGogASACQgBCgICAgICAgP//ABDMBSADQf3/AiADQf3/AkgbQYKAfmohAyAEQRBqQQhqKQMAIQIgBCkDECEBDAELIANBgYB/Sg0AIARBwABqIAEgAkIAQoCAgICAgMAAEMwFIARBwABqQQhqKQMAIQIgBCkDQCEBAkAgA0GDgH5MDQAgA0H+/wBqIQMMAQsgBEEwaiABIAJCAEKAgICAgIDAABDMBSADQYaAfSADQYaAfUobQfz/AWohAyAEQTBqQQhqKQMAIQIgBCkDMCEBCyAEIAEgAkIAIANB//8Aaq1CMIYQzAUgACAEQQhqKQMANwMIIAAgBCkDADcDACAEQdAAaiQACxwAIAAgAkL///////////8AgzcDCCAAIAE3AwAL3ggCBn8CfiMAQTBrIgQkAEIAIQoCQAJAIAJBAksNACABQQRqIQUgAkECdCICQcwwaigCACEGIAJBwDBqKAIAIQcDQAJAAkAgASgCBCICIAEoAmhPDQAgBSACQQFqNgIAIAItAAAhAgwBCyABEKEFIQILIAIQngUNAAtBASEIAkACQCACQVVqDgMAAQABC0F/QQEgAkEtRhshCAJAIAEoAgQiAiABKAJoTw0AIAUgAkEBajYCACACLQAAIQIMAQsgARChBSECC0EAIQkCQAJAAkADQCACQSByIAlB9S9qLAAARw0BAkAgCUEGSw0AAkAgASgCBCICIAEoAmhPDQAgBSACQQFqNgIAIAItAAAhAgwBCyABEKEFIQILIAlBAWoiCUEIRw0ADAILAAsCQCAJQQNGDQAgCUEIRg0BIANFDQIgCUEESQ0CIAlBCEYNAQsCQCABKAJoIgFFDQAgBSAFKAIAQX9qNgIACyADRQ0AIAlBBEkNAANAAkAgAUUNACAFIAUoAgBBf2o2AgALIAlBf2oiCUEDSw0ACwsgBCAIskMAAIB/lBDIBSAEQQhqKQMAIQsgBCkDACEKDAILAkACQAJAIAkNAEEAIQkDQCACQSByIAlB/i9qLAAARw0BAkAgCUEBSw0AAkAgASgCBCICIAEoAmhPDQAgBSACQQFqNgIAIAItAAAhAgwBCyABEKEFIQILIAlBAWoiCUEDRw0ADAILAAsCQAJAIAkOBAABAQIBCwJAIAJBMEcNAAJAAkAgASgCBCIJIAEoAmhPDQAgBSAJQQFqNgIAIAktAAAhCQwBCyABEKEFIQkLAkAgCUFfcUHYAEcNACAEQRBqIAEgByAGIAggAxCmBSAEKQMYIQsgBCkDECEKDAYLIAEoAmhFDQAgBSAFKAIAQX9qNgIACyAEQSBqIAEgAiAHIAYgCCADEKcFIAQpAyghCyAEKQMgIQoMBAsCQCABKAJoRQ0AIAUgBSgCAEF/ajYCAAsQhwVBHDYCAAwBCwJAAkAgASgCBCICIAEoAmhPDQAgBSACQQFqNgIAIAItAAAhAgwBCyABEKEFIQILAkACQCACQShHDQBBASEJDAELQoCAgICAgOD//wAhCyABKAJoRQ0DIAUgBSgCAEF/ajYCAAwDCwNAAkACQCABKAIEIgIgASgCaE8NACAFIAJBAWo2AgAgAi0AACECDAELIAEQoQUhAgsgAkG/f2ohCAJAAkAgAkFQakEKSQ0AIAhBGkkNACACQZ9/aiEIIAJB3wBGDQAgCEEaTw0BCyAJQQFqIQkMAQsLQoCAgICAgOD//wAhCyACQSlGDQICQCABKAJoIgJFDQAgBSAFKAIAQX9qNgIACwJAIANFDQAgCUUNAwNAIAlBf2ohCQJAIAJFDQAgBSAFKAIAQX9qNgIACyAJDQAMBAsACxCHBUEcNgIAC0IAIQogAUIAEKAFC0IAIQsLIAAgCjcDACAAIAs3AwggBEEwaiQAC7sPAgh/B34jAEGwA2siBiQAAkACQCABKAIEIgcgASgCaE8NACABIAdBAWo2AgQgBy0AACEHDAELIAEQoQUhBwtBACEIQgAhDkEAIQkCQAJAAkADQAJAIAdBMEYNACAHQS5HDQQgASgCBCIHIAEoAmhPDQIgASAHQQFqNgIEIActAAAhBwwDCwJAIAEoAgQiByABKAJoTw0AQQEhCSABIAdBAWo2AgQgBy0AACEHDAELQQEhCSABEKEFIQcMAAsACyABEKEFIQcLQQEhCEIAIQ4gB0EwRw0AA0ACQAJAIAEoAgQiByABKAJoTw0AIAEgB0EBajYCBCAHLQAAIQcMAQsgARChBSEHCyAOQn98IQ4gB0EwRg0AC0EBIQhBASEJC0KAgICAgIDA/z8hD0EAIQpCACEQQgAhEUIAIRJBACELQgAhEwJAA0AgB0EgciEMAkACQCAHQVBqIg1BCkkNAAJAIAdBLkYNACAMQZ9/akEFSw0ECyAHQS5HDQAgCA0DQQEhCCATIQ4MAQsgDEGpf2ogDSAHQTlKGyEHAkACQCATQgdVDQAgByAKQQR0aiEKDAELAkAgE0IcVQ0AIAZBMGogBxDOBSAGQSBqIBIgD0IAQoCAgICAgMD9PxDMBSAGQRBqIAYpAyAiEiAGQSBqQQhqKQMAIg8gBikDMCAGQTBqQQhqKQMAEMwFIAYgECARIAYpAxAgBkEQakEIaikDABDHBSAGQQhqKQMAIREgBikDACEQDAELIAsNACAHRQ0AIAZB0ABqIBIgD0IAQoCAgICAgID/PxDMBSAGQcAAaiAQIBEgBikDUCAGQdAAakEIaikDABDHBSAGQcAAakEIaikDACERQQEhCyAGKQNAIRALIBNCAXwhE0EBIQkLAkAgASgCBCIHIAEoAmhPDQAgASAHQQFqNgIEIActAAAhBwwBCyABEKEFIQcMAAsACwJAAkACQAJAIAkNAAJAIAEoAmgNACAFDQMMAgsgASABKAIEIgdBf2o2AgQgBUUNASABIAdBfmo2AgQgCEUNAiABIAdBfWo2AgQMAgsCQCATQgdVDQAgEyEPA0AgCkEEdCEKIA9CAXwiD0IIUg0ACwsCQAJAIAdBX3FB0ABHDQAgASAFEKgFIg9CgICAgICAgICAf1INAQJAIAVFDQBCACEPIAEoAmhFDQIgASABKAIEQX9qNgIEDAILQgAhECABQgAQoAVCACETDAQLQgAhDyABKAJoRQ0AIAEgASgCBEF/ajYCBAsCQCAKDQAgBkHwAGogBLdEAAAAAAAAAACiEMsFIAZB+ABqKQMAIRMgBikDcCEQDAMLAkAgDiATIAgbQgKGIA98QmB8IhNBACADa61XDQAQhwVBxAA2AgAgBkGgAWogBBDOBSAGQZABaiAGKQOgASAGQaABakEIaikDAEJ/Qv///////7///wAQzAUgBkGAAWogBikDkAEgBkGQAWpBCGopAwBCf0L///////+///8AEMwFIAZBgAFqQQhqKQMAIRMgBikDgAEhEAwDCwJAIBMgA0GefmqsUw0AAkAgCkF/TA0AA0AgBkGgA2ogECARQgBCgICAgICAwP+/fxDHBSAQIBFCAEKAgICAgICA/z8QwgUhByAGQZADaiAQIBEgECAGKQOgAyAHQQBIIgEbIBEgBkGgA2pBCGopAwAgARsQxwUgE0J/fCETIAZBkANqQQhqKQMAIREgBikDkAMhECAKQQF0IAdBf0pyIgpBf0oNAAsLAkACQCATIAOsfUIgfCIOpyIHQQAgB0EAShsgAiAOIAKtUxsiB0HxAEgNACAGQYADaiAEEM4FIAZBiANqKQMAIQ5CACEPIAYpA4ADIRJCACEUDAELIAZB4AJqRAAAAAAAAPA/QZABIAdrEIgGEMsFIAZB0AJqIAQQzgUgBkHwAmogBikD4AIgBkHgAmpBCGopAwAgBikD0AIiEiAGQdACakEIaikDACIOEKIFIAYpA/gCIRQgBikD8AIhDwsgBkHAAmogCiAKQQFxRSAQIBFCAEIAEMEFQQBHIAdBIEhxcSIHahDRBSAGQbACaiASIA4gBikDwAIgBkHAAmpBCGopAwAQzAUgBkGQAmogBikDsAIgBkGwAmpBCGopAwAgDyAUEMcFIAZBoAJqQgAgECAHG0IAIBEgBxsgEiAOEMwFIAZBgAJqIAYpA6ACIAZBoAJqQQhqKQMAIAYpA5ACIAZBkAJqQQhqKQMAEMcFIAZB8AFqIAYpA4ACIAZBgAJqQQhqKQMAIA8gFBDNBQJAIAYpA/ABIhAgBkHwAWpBCGopAwAiEUIAQgAQwQUNABCHBUHEADYCAAsgBkHgAWogECARIBOnEKMFIAYpA+gBIRMgBikD4AEhEAwDCxCHBUHEADYCACAGQdABaiAEEM4FIAZBwAFqIAYpA9ABIAZB0AFqQQhqKQMAQgBCgICAgICAwAAQzAUgBkGwAWogBikDwAEgBkHAAWpBCGopAwBCAEKAgICAgIDAABDMBSAGQbABakEIaikDACETIAYpA7ABIRAMAgsgAUIAEKAFCyAGQeAAaiAEt0QAAAAAAAAAAKIQywUgBkHoAGopAwAhEyAGKQNgIRALIAAgEDcDACAAIBM3AwggBkGwA2okAAvLHwMMfwZ+AXwjAEGQxgBrIgckAEEAIQhBACAEIANqIglrIQpCACETQQAhCwJAAkACQANAAkAgAkEwRg0AIAJBLkcNBCABKAIEIgIgASgCaE8NAiABIAJBAWo2AgQgAi0AACECDAMLAkAgASgCBCICIAEoAmhPDQBBASELIAEgAkEBajYCBCACLQAAIQIMAQtBASELIAEQoQUhAgwACwALIAEQoQUhAgtBASEIQgAhEyACQTBHDQADQAJAAkAgASgCBCICIAEoAmhPDQAgASACQQFqNgIEIAItAAAhAgwBCyABEKEFIQILIBNCf3whEyACQTBGDQALQQEhC0EBIQgLQQAhDCAHQQA2ApAGIAJBUGohDQJAAkACQAJAAkACQAJAIAJBLkYiDg0AQgAhFCANQQlNDQBBACEPQQAhEAwBC0IAIRRBACEQQQAhD0EAIQwDQAJAAkAgDkEBcUUNAAJAIAgNACAUIRNBASEIDAILIAtFIQ4MBAsgFEIBfCEUAkAgD0H8D0oNACACQTBGIQsgFKchESAHQZAGaiAPQQJ0aiEOAkAgEEUNACACIA4oAgBBCmxqQVBqIQ0LIAwgESALGyEMIA4gDTYCAEEBIQtBACAQQQFqIgIgAkEJRiICGyEQIA8gAmohDwwBCyACQTBGDQAgByAHKAKARkEBcjYCgEZB3I8BIQwLAkACQCABKAIEIgIgASgCaE8NACABIAJBAWo2AgQgAi0AACECDAELIAEQoQUhAgsgAkFQaiENIAJBLkYiDg0AIA1BCkkNAAsLIBMgFCAIGyETAkAgC0UNACACQV9xQcUARw0AAkAgASAGEKgFIhVCgICAgICAgICAf1INACAGRQ0EQgAhFSABKAJoRQ0AIAEgASgCBEF/ajYCBAsgFSATfCETDAQLIAtFIQ4gAkEASA0BCyABKAJoRQ0AIAEgASgCBEF/ajYCBAsgDkUNARCHBUEcNgIAC0IAIRQgAUIAEKAFQgAhEwwBCwJAIAcoApAGIgENACAHIAW3RAAAAAAAAAAAohDLBSAHQQhqKQMAIRMgBykDACEUDAELAkAgFEIJVQ0AIBMgFFINAAJAIANBHkoNACABIAN2DQELIAdBMGogBRDOBSAHQSBqIAEQ0QUgB0EQaiAHKQMwIAdBMGpBCGopAwAgBykDICAHQSBqQQhqKQMAEMwFIAdBEGpBCGopAwAhEyAHKQMQIRQMAQsCQCATIARBfm2tVw0AEIcFQcQANgIAIAdB4ABqIAUQzgUgB0HQAGogBykDYCAHQeAAakEIaikDAEJ/Qv///////7///wAQzAUgB0HAAGogBykDUCAHQdAAakEIaikDAEJ/Qv///////7///wAQzAUgB0HAAGpBCGopAwAhEyAHKQNAIRQMAQsCQCATIARBnn5qrFkNABCHBUHEADYCACAHQZABaiAFEM4FIAdBgAFqIAcpA5ABIAdBkAFqQQhqKQMAQgBCgICAgICAwAAQzAUgB0HwAGogBykDgAEgB0GAAWpBCGopAwBCAEKAgICAgIDAABDMBSAHQfAAakEIaikDACETIAcpA3AhFAwBCwJAIBBFDQACQCAQQQhKDQAgB0GQBmogD0ECdGoiAigCACEBA0AgAUEKbCEBIBBBAWoiEEEJRw0ACyACIAE2AgALIA9BAWohDwsgE6chCAJAIAxBCU4NACAMIAhKDQAgCEERSg0AAkAgCEEJRw0AIAdBwAFqIAUQzgUgB0GwAWogBygCkAYQ0QUgB0GgAWogBykDwAEgB0HAAWpBCGopAwAgBykDsAEgB0GwAWpBCGopAwAQzAUgB0GgAWpBCGopAwAhEyAHKQOgASEUDAILAkAgCEEISg0AIAdBkAJqIAUQzgUgB0GAAmogBygCkAYQ0QUgB0HwAWogBykDkAIgB0GQAmpBCGopAwAgBykDgAIgB0GAAmpBCGopAwAQzAUgB0HgAWpBCCAIa0ECdEGgMGooAgAQzgUgB0HQAWogBykD8AEgB0HwAWpBCGopAwAgBykD4AEgB0HgAWpBCGopAwAQzwUgB0HQAWpBCGopAwAhEyAHKQPQASEUDAILIAcoApAGIQECQCADIAhBfWxqQRtqIgJBHkoNACABIAJ2DQELIAdB4AJqIAUQzgUgB0HQAmogARDRBSAHQcACaiAHKQPgAiAHQeACakEIaikDACAHKQPQAiAHQdACakEIaikDABDMBSAHQbACaiAIQQJ0QfgvaigCABDOBSAHQaACaiAHKQPAAiAHQcACakEIaikDACAHKQOwAiAHQbACakEIaikDABDMBSAHQaACakEIaikDACETIAcpA6ACIRQMAQsDQCAHQZAGaiAPIgJBf2oiD0ECdGooAgBFDQALQQAhEAJAAkAgCEEJbyIBDQBBACEODAELIAEgAUEJaiAIQX9KGyEGAkACQCACDQBBACEOQQAhAgwBC0GAlOvcA0EIIAZrQQJ0QaAwaigCACILbSERQQAhDUEAIQFBACEOA0AgB0GQBmogAUECdGoiDyAPKAIAIg8gC24iDCANaiINNgIAIA5BAWpB/w9xIA4gASAORiANRXEiDRshDiAIQXdqIAggDRshCCARIA8gDCALbGtsIQ0gAUEBaiIBIAJHDQALIA1FDQAgB0GQBmogAkECdGogDTYCACACQQFqIQILIAggBmtBCWohCAsCQANAAkAgCEEkSA0AIAhBJEcNAiAHQZAGaiAOQQJ0aigCAEHR6fkETw0CCyACQf8PaiEPQQAhDSACIQsDQCALIQICQAJAIAdBkAZqIA9B/w9xIgFBAnRqIgs1AgBCHYYgDa18IhNCgZTr3ANaDQBBACENDAELIBMgE0KAlOvcA4AiFEKAlOvcA359IRMgFKchDQsgCyATpyIPNgIAIAIgAiACIAEgDxsgASAORhsgASACQX9qQf8PcUcbIQsgAUF/aiEPIAEgDkcNAAsgEEFjaiEQIA1FDQACQCAOQX9qQf8PcSIOIAtHDQAgB0GQBmogC0H+D2pB/w9xQQJ0aiIBIAEoAgAgB0GQBmogC0F/akH/D3EiAkECdGooAgByNgIACyAIQQlqIQggB0GQBmogDkECdGogDTYCAAwACwALAkADQCACQQFqQf8PcSEGIAdBkAZqIAJBf2pB/w9xQQJ0aiESA0AgDiELQQAhAQJAAkACQANAIAEgC2pB/w9xIg4gAkYNASAHQZAGaiAOQQJ0aigCACIOIAFBAnRBkDBqKAIAIg1JDQEgDiANSw0CIAFBAWoiAUEERw0ACwsgCEEkRw0AQgAhE0EAIQFCACEUA0ACQCABIAtqQf8PcSIOIAJHDQAgAkEBakH/D3EiAkECdCAHQZAGampBfGpBADYCAAsgB0GABmogEyAUQgBCgICAgOWat47AABDMBSAHQfAFaiAHQZAGaiAOQQJ0aigCABDRBSAHQeAFaiAHKQOABiAHQYAGakEIaikDACAHKQPwBSAHQfAFakEIaikDABDHBSAHQeAFakEIaikDACEUIAcpA+AFIRMgAUEBaiIBQQRHDQALIAdB0AVqIAUQzgUgB0HABWogEyAUIAcpA9AFIAdB0AVqQQhqKQMAEMwFIAdBwAVqQQhqKQMAIRRCACETIAcpA8AFIRUgEEHxAGoiDSAEayIBQQAgAUEAShsgAyABIANIIggbIg5B8ABMDQFCACEWQgAhF0IAIRgMBAtBCUEBIAhBLUobIg0gEGohECACIQ4gCyACRg0BQYCU69wDIA12IQxBfyANdEF/cyERQQAhASALIQ4DQCAHQZAGaiALQQJ0aiIPIA8oAgAiDyANdiABaiIBNgIAIA5BAWpB/w9xIA4gCyAORiABRXEiARshDiAIQXdqIAggARshCCAPIBFxIAxsIQEgC0EBakH/D3EiCyACRw0ACyABRQ0BAkAgBiAORg0AIAdBkAZqIAJBAnRqIAE2AgAgBiECDAMLIBIgEigCAEEBcjYCACAGIQ4MAQsLCyAHQZAFakQAAAAAAADwP0HhASAOaxCIBhDLBSAHQbAFaiAHKQOQBSAHQZAFakEIaikDACAVIBQQogUgBykDuAUhGCAHKQOwBSEXIAdBgAVqRAAAAAAAAPA/QfEAIA5rEIgGEMsFIAdBoAVqIBUgFCAHKQOABSAHQYAFakEIaikDABCHBiAHQfAEaiAVIBQgBykDoAUiEyAHKQOoBSIWEM0FIAdB4ARqIBcgGCAHKQPwBCAHQfAEakEIaikDABDHBSAHQeAEakEIaikDACEUIAcpA+AEIRULAkAgC0EEakH/D3EiDyACRg0AAkACQCAHQZAGaiAPQQJ0aigCACIPQf/Jte4BSw0AAkAgDw0AIAtBBWpB/w9xIAJGDQILIAdB8ANqIAW3RAAAAAAAANA/ohDLBSAHQeADaiATIBYgBykD8AMgB0HwA2pBCGopAwAQxwUgB0HgA2pBCGopAwAhFiAHKQPgAyETDAELAkAgD0GAyrXuAUYNACAHQdAEaiAFt0QAAAAAAADoP6IQywUgB0HABGogEyAWIAcpA9AEIAdB0ARqQQhqKQMAEMcFIAdBwARqQQhqKQMAIRYgBykDwAQhEwwBCyAFtyEZAkAgC0EFakH/D3EgAkcNACAHQZAEaiAZRAAAAAAAAOA/ohDLBSAHQYAEaiATIBYgBykDkAQgB0GQBGpBCGopAwAQxwUgB0GABGpBCGopAwAhFiAHKQOABCETDAELIAdBsARqIBlEAAAAAAAA6D+iEMsFIAdBoARqIBMgFiAHKQOwBCAHQbAEakEIaikDABDHBSAHQaAEakEIaikDACEWIAcpA6AEIRMLIA5B7wBKDQAgB0HQA2ogEyAWQgBCgICAgICAwP8/EIcGIAcpA9ADIAcpA9gDQgBCABDBBQ0AIAdBwANqIBMgFkIAQoCAgICAgMD/PxDHBSAHQcgDaikDACEWIAcpA8ADIRMLIAdBsANqIBUgFCATIBYQxwUgB0GgA2ogBykDsAMgB0GwA2pBCGopAwAgFyAYEM0FIAdBoANqQQhqKQMAIRQgBykDoAMhFQJAIA1B/////wdxQX4gCWtMDQAgB0GQA2ogFSAUEKQFIAdBgANqIBUgFEIAQoCAgICAgID/PxDMBSAHKQOQAyAHKQOYA0IAQoCAgICAgIC4wAAQwgUhAiAUIAdBgANqQQhqKQMAIAJBAEgiDRshFCAVIAcpA4ADIA0bIRUgEyAWQgBCABDBBSELAkAgECACQX9KaiIQQe4AaiAKSg0AIAtBAEcgCCANIA4gAUdycXFFDQELEIcFQcQANgIACyAHQfACaiAVIBQgEBCjBSAHKQP4AiETIAcpA/ACIRQLIAAgFDcDACAAIBM3AwggB0GQxgBqJAALswQCBH8BfgJAAkAgACgCBCICIAAoAmhPDQAgACACQQFqNgIEIAItAAAhAgwBCyAAEKEFIQILAkACQAJAIAJBVWoOAwEAAQALIAJBUGohA0EAIQQMAQsCQAJAIAAoAgQiAyAAKAJoTw0AIAAgA0EBajYCBCADLQAAIQUMAQsgABChBSEFCyACQS1GIQQgBUFQaiEDAkAgAUUNACADQQpJDQAgACgCaEUNACAAIAAoAgRBf2o2AgQLIAUhAgsCQAJAIANBCk8NAEEAIQMDQCACIANBCmxqIQMCQAJAIAAoAgQiAiAAKAJoTw0AIAAgAkEBajYCBCACLQAAIQIMAQsgABChBSECCyADQVBqIQMCQCACQVBqIgVBCUsNACADQcyZs+YASA0BCwsgA6whBgJAIAVBCk8NAANAIAKtIAZCCn58IQYCQAJAIAAoAgQiAiAAKAJoTw0AIAAgAkEBajYCBCACLQAAIQIMAQsgABChBSECCyAGQlB8IQYgAkFQaiIFQQlLDQEgBkKuj4XXx8LrowFTDQALCwJAIAVBCk8NAANAAkACQCAAKAIEIgIgACgCaE8NACAAIAJBAWo2AgQgAi0AACECDAELIAAQoQUhAgsgAkFQakEKSQ0ACwsCQCAAKAJoRQ0AIAAgACgCBEF/ajYCBAtCACAGfSAGIAQbIQYMAQtCgICAgICAgICAfyEGIAAoAmhFDQAgACAAKAIEQX9qNgIEQoCAgICAgICAgH8PCyAGC8kLAgV/BH4jAEEQayIEJAACQAJAAkACQAJAAkACQCABQSRLDQADQAJAAkAgACgCBCIFIAAoAmhPDQAgACAFQQFqNgIEIAUtAAAhBQwBCyAAEKEFIQULIAUQngUNAAtBACEGAkACQCAFQVVqDgMAAQABC0F/QQAgBUEtRhshBgJAIAAoAgQiBSAAKAJoTw0AIAAgBUEBajYCBCAFLQAAIQUMAQsgABChBSEFCwJAAkAgAUFvcQ0AIAVBMEcNAAJAAkAgACgCBCIFIAAoAmhPDQAgACAFQQFqNgIEIAUtAAAhBQwBCyAAEKEFIQULAkAgBUFfcUHYAEcNAAJAAkAgACgCBCIFIAAoAmhPDQAgACAFQQFqNgIEIAUtAAAhBQwBCyAAEKEFIQULQRAhASAFQeEwai0AAEEQSQ0FAkAgACgCaA0AQgAhAyACDQoMCQsgACAAKAIEIgVBf2o2AgQgAkUNCCAAIAVBfmo2AgRCACEDDAkLIAENAUEIIQEMBAsgAUEKIAEbIgEgBUHhMGotAABLDQACQCAAKAJoRQ0AIAAgACgCBEF/ajYCBAtCACEDIABCABCgBRCHBUEcNgIADAcLIAFBCkcNAkIAIQkCQCAFQVBqIgJBCUsNAEEAIQEDQCABQQpsIQECQAJAIAAoAgQiBSAAKAJoTw0AIAAgBUEBajYCBCAFLQAAIQUMAQsgABChBSEFCyABIAJqIQECQCAFQVBqIgJBCUsNACABQZmz5swBSQ0BCwsgAa0hCQsgAkEJSw0BIAlCCn4hCiACrSELA0ACQAJAIAAoAgQiBSAAKAJoTw0AIAAgBUEBajYCBCAFLQAAIQUMAQsgABChBSEFCyAKIAt8IQkgBUFQaiICQQlLDQIgCUKas+bMmbPmzBlaDQIgCUIKfiIKIAKtIgtCf4VYDQALQQohAQwDCxCHBUEcNgIAQgAhAwwFC0EKIQEgAkEJTQ0BDAILAkAgASABQX9qcUUNAEIAIQkCQCABIAVB4TBqLQAAIgJNDQBBACEHA0AgAiAHIAFsaiEHAkACQCAAKAIEIgUgACgCaE8NACAAIAVBAWo2AgQgBS0AACEFDAELIAAQoQUhBQsgBUHhMGotAAAhAgJAIAdBxuPxOEsNACABIAJLDQELCyAHrSEJCyABIAJNDQEgAa0hCgNAIAkgCn4iCyACrUL/AYMiDEJ/hVYNAgJAAkAgACgCBCIFIAAoAmhPDQAgACAFQQFqNgIEIAUtAAAhBQwBCyAAEKEFIQULIAsgDHwhCSABIAVB4TBqLQAAIgJNDQIgBCAKQgAgCUIAEMMFIAQpAwhCAFINAgwACwALIAFBF2xBBXZBB3FB4TJqLAAAIQhCACEJAkAgASAFQeEwai0AACICTQ0AQQAhBwNAIAIgByAIdHIhBwJAAkAgACgCBCIFIAAoAmhPDQAgACAFQQFqNgIEIAUtAAAhBQwBCyAAEKEFIQULIAVB4TBqLQAAIQICQCAHQf///z9LDQAgASACSw0BCwsgB60hCQtCfyAIrSIKiCILIAlUDQAgASACTQ0AA0AgCSAKhiACrUL/AYOEIQkCQAJAIAAoAgQiBSAAKAJoTw0AIAAgBUEBajYCBCAFLQAAIQUMAQsgABChBSEFCyAJIAtWDQEgASAFQeEwai0AACICSw0ACwsgASAFQeEwai0AAE0NAANAAkACQCAAKAIEIgUgACgCaE8NACAAIAVBAWo2AgQgBS0AACEFDAELIAAQoQUhBQsgASAFQeEwai0AAEsNAAsQhwVBxAA2AgAgBkEAIANCAYNQGyEGIAMhCQsCQCAAKAJoRQ0AIAAgACgCBEF/ajYCBAsCQCAJIANUDQACQCADp0EBcQ0AIAYNABCHBUHEADYCACADQn98IQMMAwsgCSADWA0AEIcFQcQANgIADAILIAkgBqwiA4UgA30hAwwBC0IAIQMgAEIAEKAFCyAEQRBqJAAgAwv4AgEGfyMAQRBrIgQkACADQajAACADGyIFKAIAIQMCQAJAAkACQCABDQAgAw0BQQAhBgwDC0F+IQYgAkUNAiAAIARBDGogABshBwJAAkAgA0UNACACIQAMAQsCQCABLQAAIgNBGHRBGHUiAEEASA0AIAcgAzYCACAAQQBHIQYMBAsQuQUoAqwBKAIAIQMgASwAACEAAkAgAw0AIAcgAEH/vwNxNgIAQQEhBgwECyAAQf8BcUG+fmoiA0EySw0BQfAyIANBAnRqKAIAIQMgAkF/aiIARQ0CIAFBAWohAQsgAS0AACIIQQN2IglBcGogA0EadSAJanJBB0sNAANAIABBf2ohAAJAIAhB/wFxQYB/aiADQQZ0ciIDQQBIDQAgBUEANgIAIAcgAzYCACACIABrIQYMBAsgAEUNAiABQQFqIgEtAAAiCEHAAXFBgAFGDQALCyAFQQA2AgAQhwVBGTYCAEF/IQYMAQsgBSADNgIACyAEQRBqJAAgBgsSAAJAIAANAEEBDwsgACgCAEULoxQCDn8DfiMAQbACayIDJABBACEEQQAhBQJAIAAoAkxBAEgNACAAEI8GIQULAkAgAS0AACIGRQ0AQgAhEUEAIQQCQAJAAkACQANAAkACQCAGQf8BcRCeBUUNAANAIAEiBkEBaiEBIAYtAAEQngUNAAsgAEIAEKAFA0ACQAJAIAAoAgQiASAAKAJoTw0AIAAgAUEBajYCBCABLQAAIQEMAQsgABChBSEBCyABEJ4FDQALIAAoAgQhAQJAIAAoAmhFDQAgACABQX9qIgE2AgQLIAApA3ggEXwgASAAKAIIa6x8IREMAQsCQAJAAkACQCABLQAAIgZBJUcNACABLQABIgdBKkYNASAHQSVHDQILIABCABCgBSABIAZBJUZqIQYCQAJAIAAoAgQiASAAKAJoTw0AIAAgAUEBajYCBCABLQAAIQEMAQsgABChBSEBCwJAIAEgBi0AAEYNAAJAIAAoAmhFDQAgACAAKAIEQX9qNgIECyAEDQpBACEIIAFBf0wNCAwKCyARQgF8IREMAwsgAUECaiEGQQAhCQwBCwJAIAcQjQVFDQAgAS0AAkEkRw0AIAFBA2ohBiACIAEtAAFBUGoQrQUhCQwBCyABQQFqIQYgAigCACEJIAJBBGohAgtBACEIQQAhAQJAIAYtAAAQjQVFDQADQCABQQpsIAYtAABqQVBqIQEgBi0AASEHIAZBAWohBiAHEI0FDQALCwJAAkAgBi0AACIKQe0ARg0AIAYhBwwBCyAGQQFqIQdBACELIAlBAEchCCAGLQABIQpBACEMCyAHQQFqIQZBAyENAkACQAJAAkACQAJAIApB/wFxQb9/ag46BAkECQQEBAkJCQkDCQkJCQkJBAkJCQkECQkECQkJCQkECQQEBAQEAAQFCQEJBAQECQkEAgQJCQQJAgkLIAdBAmogBiAHLQABQegARiIHGyEGQX5BfyAHGyENDAQLIAdBAmogBiAHLQABQewARiIHGyEGQQNBASAHGyENDAMLQQEhDQwCC0ECIQ0MAQtBACENIAchBgtBASANIAYtAAAiB0EvcUEDRiIKGyEOAkAgB0EgciAHIAobIg9B2wBGDQACQAJAIA9B7gBGDQAgD0HjAEcNASABQQEgAUEBShshAQwCCyAJIA4gERCuBQwCCyAAQgAQoAUDQAJAAkAgACgCBCIHIAAoAmhPDQAgACAHQQFqNgIEIActAAAhBwwBCyAAEKEFIQcLIAcQngUNAAsgACgCBCEHAkAgACgCaEUNACAAIAdBf2oiBzYCBAsgACkDeCARfCAHIAAoAghrrHwhEQsgACABrCISEKAFAkACQCAAKAIEIg0gACgCaCIHTw0AIAAgDUEBajYCBAwBCyAAEKEFQQBIDQQgACgCaCEHCwJAIAdFDQAgACAAKAIEQX9qNgIEC0EQIQcCQAJAAkACQAJAAkACQAJAAkACQAJAAkAgD0Gof2oOIQYLCwILCwsLCwELAgQBAQELBQsLCwsLAwYLCwILBAsLBgALIA9Bv39qIgFBBksNCkEBIAF0QfEAcUUNCgsgAyAAIA5BABClBSAAKQN4QgAgACgCBCAAKAIIa6x9UQ0PIAlFDQkgAykDCCESIAMpAwAhEyAODgMFBgcJCwJAIA9B7wFxQeMARw0AIANBIGpBf0GBAhCLBhogA0EAOgAgIA9B8wBHDQggA0EAOgBBIANBADoALiADQQA2ASoMCAsgA0EgaiAGLQABIg1B3gBGIgdBgQIQiwYaIANBADoAICAGQQJqIAZBAWogBxshCgJAAkACQAJAIAZBAkEBIAcbai0AACIGQS1GDQAgBkHdAEYNASANQd4ARyENIAohBgwDCyADIA1B3gBHIg06AE4MAQsgAyANQd4ARyINOgB+CyAKQQFqIQYLA0ACQAJAIAYtAAAiB0EtRg0AIAdFDQ8gB0HdAEcNAQwKC0EtIQcgBi0AASIQRQ0AIBBB3QBGDQAgBkEBaiEKAkACQCAGQX9qLQAAIgYgEEkNACAQIQcMAQsDQCADQSBqIAZBAWoiBmogDToAACAGIAotAAAiB0kNAAsLIAohBgsgByADQSBqakEBaiANOgAAIAZBAWohBgwACwALQQghBwwCC0EKIQcMAQtBACEHCyAAIAdBAEJ/EKkFIRIgACkDeEIAIAAoAgQgACgCCGusfVENCgJAIAlFDQAgD0HwAEcNACAJIBI+AgAMBQsgCSAOIBIQrgUMBAsgCSATIBIQygU4AgAMAwsgCSATIBIQ0AU5AwAMAgsgCSATNwMAIAkgEjcDCAwBCyABQQFqQR8gD0HjAEYiChshDQJAAkACQCAOQQFHIg8NACAJIQcCQCAIRQ0AIA1BAnQQgQYiB0UNBwsgA0IANwOoAkEAIQEDQCAHIQwDQAJAAkAgACgCBCIHIAAoAmhPDQAgACAHQQFqNgIEIActAAAhBwwBCyAAEKEFIQcLIAcgA0EgampBAWotAABFDQMgAyAHOgAbIANBHGogA0EbakEBIANBqAJqEKoFIgdBfkYNAEEAIQsgB0F/Rg0JAkAgDEUNACAMIAFBAnRqIAMoAhw2AgAgAUEBaiEBCyAIRQ0AIAEgDUcNAAsgDCANQQF0QQFyIg1BAnQQgwYiBw0ADAgLAAsCQCAIRQ0AQQAhASANEIEGIgdFDQYDQCAHIQsDQAJAAkAgACgCBCIHIAAoAmhPDQAgACAHQQFqNgIEIActAAAhBwwBCyAAEKEFIQcLAkAgByADQSBqakEBai0AAA0AQQAhDAwFCyALIAFqIAc6AAAgAUEBaiIBIA1HDQALQQAhDCALIA1BAXRBAXIiDRCDBiIHDQAMCAsAC0EAIQECQCAJRQ0AA0ACQAJAIAAoAgQiByAAKAJoTw0AIAAgB0EBajYCBCAHLQAAIQcMAQsgABChBSEHCwJAIAcgA0EgampBAWotAAANAEEAIQwgCSELDAQLIAkgAWogBzoAACABQQFqIQEMAAsACwNAAkACQCAAKAIEIgEgACgCaE8NACAAIAFBAWo2AgQgAS0AACEBDAELIAAQoQUhAQsgASADQSBqakEBai0AAA0AC0EAIQtBACEMQQAhAQwBC0EAIQsgA0GoAmoQqwVFDQULIAAoAgQhBwJAIAAoAmhFDQAgACAHQX9qIgc2AgQLIAApA3ggByAAKAIIa6x8IhNQDQYgCiATIBJScQ0GAkAgCEUNAAJAIA8NACAJIAw2AgAMAQsgCSALNgIACyAKDQACQCAMRQ0AIAwgAUECdGpBADYCAAsCQCALDQBBACELDAELIAsgAWpBADoAAAsgACkDeCARfCAAKAIEIAAoAghrrHwhESAEIAlBAEdqIQQLIAZBAWohASAGLQABIgYNAAwFCwALQQAhC0EAIQwLIAQNAQtBfyEECyAIRQ0AIAsQggYgDBCCBgsCQCAFRQ0AIAAQkAYLIANBsAJqJAAgBAsyAQF/IwBBEGsiAiAANgIMIAIgAUECdCAAakF8aiAAIAFBAUsbIgBBBGo2AgggACgCAAtDAAJAIABFDQACQAJAAkACQCABQQJqDgYAAQICBAMECyAAIAI8AAAPCyAAIAI9AQAPCyAAIAI+AgAPCyAAIAI3AwALC1cBA38gACgCVCEDIAEgAyADQQAgAkGAAmoiBBD9BCIFIANrIAQgBRsiBCACIAQgAkkbIgIQigYaIAAgAyAEaiIENgJUIAAgBDYCCCAAIAMgAmo2AgQgAgtKAQF/IwBBkAFrIgMkACADQQBBkAEQiwYiA0F/NgJMIAMgADYCLCADQaIBNgIgIAMgADYCVCADIAEgAhCsBSEAIANBkAFqJAAgAAsLACAAIAEgAhCvBQsoAQF/IwBBEGsiAyQAIAMgAjYCDCAAIAEgAhCwBSECIANBEGokACACC48BAQV/A0AgACIBQQFqIQAgASwAABCeBQ0AC0EAIQJBACEDQQAhBAJAAkACQCABLAAAIgVBVWoOAwECAAILQQEhAwsgACwAACEFIAAhASADIQQLAkAgBRCNBUUNAANAIAJBCmwgASwAAGtBMGohAiABLAABIQAgAUEBaiEBIAAQjQUNAAsLIAJBACACayAEGwsKACAAQazAABAMCwoAIABB2MAAEA0LBgBBhMEACwYAQYzBAAsGAEGQwQALBQBB/DkLBABBAAsEAEEACwQAQQALBABBAAsEAEEACwQAQQALBABBAAvgAQIBfwJ+QQEhBAJAIABCAFIgAUL///////////8AgyIFQoCAgICAgMD//wBWIAVCgICAgICAwP//AFEbDQAgAkIAUiADQv///////////wCDIgZCgICAgICAwP//AFYgBkKAgICAgIDA//8AURsNAAJAIAIgAIQgBiAFhIRQRQ0AQQAPCwJAIAMgAYNCAFMNAEF/IQQgACACVCABIANTIAEgA1EbDQEgACAChSABIAOFhEIAUg8LQX8hBCAAIAJWIAEgA1UgASADURsNACAAIAKFIAEgA4WEQgBSIQQLIAQL2AECAX8CfkF/IQQCQCAAQgBSIAFC////////////AIMiBUKAgICAgIDA//8AViAFQoCAgICAgMD//wBRGw0AIAJCAFIgA0L///////////8AgyIGQoCAgICAgMD//wBWIAZCgICAgICAwP//AFEbDQACQCACIACEIAYgBYSEUEUNAEEADwsCQCADIAGDQgBTDQAgACACVCABIANTIAEgA1EbDQEgACAChSABIAOFhEIAUg8LIAAgAlYgASADVSABIANRGw0AIAAgAoUgASADhYRCAFIhBAsgBAt1AQF+IAAgBCABfiACIAN+fCADQiCIIgQgAUIgiCICfnwgA0L/////D4MiAyABQv////8PgyIBfiIFQiCIIAMgAn58IgNCIIh8IANC/////w+DIAQgAX58IgNCIIh8NwMIIAAgA0IghiAFQv////8Pg4Q3AwALUwEBfgJAAkAgA0HAAHFFDQAgASADQUBqrYYhAkIAIQEMAQsgA0UNACABQcAAIANrrYggAiADrSIEhoQhAiABIASGIQELIAAgATcDACAAIAI3AwgLBABBAAsEAEEAC/gKAgR/BH4jAEHwAGsiBSQAIARC////////////AIMhCQJAAkACQCABQn98IgpCf1EgAkL///////////8AgyILIAogAVStfEJ/fCIKQv///////7///wBWIApC////////v///AFEbDQAgA0J/fCIKQn9SIAkgCiADVK18Qn98IgpC////////v///AFQgCkL///////+///8AURsNAQsCQCABUCALQoCAgICAgMD//wBUIAtCgICAgICAwP//AFEbDQAgAkKAgICAgIAghCEEIAEhAwwCCwJAIANQIAlCgICAgICAwP//AFQgCUKAgICAgIDA//8AURsNACAEQoCAgICAgCCEIQQMAgsCQCABIAtCgICAgICAwP//AIWEQgBSDQBCgICAgICA4P//ACACIAMgAYUgBCAChUKAgICAgICAgIB/hYRQIgYbIQRCACABIAYbIQMMAgsgAyAJQoCAgICAgMD//wCFhFANAQJAIAEgC4RCAFINACADIAmEQgBSDQIgAyABgyEDIAQgAoMhBAwCCyADIAmEUEUNACABIQMgAiEEDAELIAMgASADIAFWIAkgC1YgCSALURsiBxshCSAEIAIgBxsiC0L///////8/gyEKIAIgBCAHGyICQjCIp0H//wFxIQgCQCALQjCIp0H//wFxIgYNACAFQeAAaiAJIAogCSAKIApQIgYbeSAGQQZ0rXynIgZBcWoQxAVBECAGayEGIAVB6ABqKQMAIQogBSkDYCEJCyABIAMgBxshAyACQv///////z+DIQQCQCAIDQAgBUHQAGogAyAEIAMgBCAEUCIHG3kgB0EGdK18pyIHQXFqEMQFQRAgB2shCCAFQdgAaikDACEEIAUpA1AhAwsgBEIDhiADQj2IhEKAgICAgICABIQhBCAKQgOGIAlCPYiEIQEgA0IDhiEDIAsgAoUhCgJAIAYgCGsiB0UNAAJAIAdB/wBNDQBCACEEQgEhAwwBCyAFQcAAaiADIARBgAEgB2sQxAUgBUEwaiADIAQgBxDJBSAFKQMwIAUpA0AgBUHAAGpBCGopAwCEQgBSrYQhAyAFQTBqQQhqKQMAIQQLIAFCgICAgICAgASEIQwgCUIDhiECAkACQCAKQn9VDQACQCACIAN9IgEgDCAEfSACIANUrX0iBIRQRQ0AQgAhA0IAIQQMAwsgBEL/////////A1YNASAFQSBqIAEgBCABIAQgBFAiBxt5IAdBBnStfKdBdGoiBxDEBSAGIAdrIQYgBUEoaikDACEEIAUpAyAhAQwBCyAEIAx8IAMgAnwiASADVK18IgRCgICAgICAgAiDUA0AIAFCAYggBEI/hoQgAUIBg4QhASAGQQFqIQYgBEIBiCEECyALQoCAgICAgICAgH+DIQICQCAGQf//AUgNACACQoCAgICAgMD//wCEIQRCACEDDAELQQAhBwJAAkAgBkEATA0AIAYhBwwBCyAFQRBqIAEgBCAGQf8AahDEBSAFIAEgBEEBIAZrEMkFIAUpAwAgBSkDECAFQRBqQQhqKQMAhEIAUq2EIQEgBUEIaikDACEECyABQgOIIARCPYaEIQMgB61CMIYgBEIDiEL///////8/g4QgAoQhBCABp0EHcSEGAkACQAJAAkACQBDFBQ4DAAECAwsgBCADIAZBBEutfCIBIANUrXwhBAJAIAZBBEYNACABIQMMAwsgBCABQgGDIgIgAXwiAyACVK18IQQMAwsgBCADIAJCAFIgBkEAR3GtfCIBIANUrXwhBCABIQMMAQsgBCADIAJQIAZBAEdxrXwiASADVK18IQQgASEDCyAGRQ0BCxDGBRoLIAAgAzcDACAAIAQ3AwggBUHwAGokAAvhAQIDfwJ+IwBBEGsiAiQAAkACQCABvCIDQf////8HcSIEQYCAgHxqQf////cHSw0AIAStQhmGQoCAgICAgIDAP3whBUIAIQYMAQsCQCAEQYCAgPwHSQ0AIAOtQhmGQoCAgICAgMD//wCEIQVCACEGDAELAkAgBA0AQgAhBkIAIQUMAQsgAiAErUIAIARnIgRB0QBqEMQFIAJBCGopAwBCgICAgICAwACFQYn/ACAEa61CMIaEIQUgAikDACEGCyAAIAY3AwAgACAFIANBgICAgHhxrUIghoQ3AwggAkEQaiQAC1MBAX4CQAJAIANBwABxRQ0AIAIgA0FAaq2IIQFCACECDAELIANFDQAgAkHAACADa62GIAEgA60iBIiEIQEgAiAEiCECCyAAIAE3AwAgACACNwMIC8QDAgN/AX4jAEEgayICJAACQAJAIAFC////////////AIMiBUKAgICAgIDAv0B8IAVCgICAgICAwMC/f3xaDQAgAUIZiKchAwJAIABQIAFC////D4MiBUKAgIAIVCAFQoCAgAhRGw0AIANBgYCAgARqIQQMAgsgA0GAgICABGohBCAAIAVCgICACIWEQgBSDQEgBCADQQFxaiEEDAELAkAgAFAgBUKAgICAgIDA//8AVCAFQoCAgICAgMD//wBRGw0AIAFCGYinQf///wFxQYCAgP4HciEEDAELQYCAgPwHIQQgBUL///////+/v8AAVg0AQQAhBCAFQjCIpyIDQZH+AEkNACACQRBqIAAgAUL///////8/g0KAgICAgIDAAIQiBSADQf+Bf2oQxAUgAiAAIAVBgf8AIANrEMkFIAJBCGopAwAiBUIZiKchBAJAIAIpAwAgAikDECACQRBqQQhqKQMAhEIAUq2EIgBQIAVC////D4MiBUKAgIAIVCAFQoCAgAhRGw0AIARBAWohBAwBCyAAIAVCgICACIWEQgBSDQAgBEEBcSAEaiEECyACQSBqJAAgBCABQiCIp0GAgICAeHFyvguOAgICfwN+IwBBEGsiAiQAAkACQCABvSIEQv///////////wCDIgVCgICAgICAgHh8Qv/////////v/wBWDQAgBUI8hiEGIAVCBIhCgICAgICAgIA8fCEFDAELAkAgBUKAgICAgICA+P8AVA0AIARCPIYhBiAEQgSIQoCAgICAgMD//wCEIQUMAQsCQCAFUEUNAEIAIQZCACEFDAELIAIgBUIAIASnZ0EgaiAFQiCIp2cgBUKAgICAEFQbIgNBMWoQxAUgAkEIaikDAEKAgICAgIDAAIVBjPgAIANrrUIwhoQhBSACKQMAIQYLIAAgBjcDACAAIAUgBEKAgICAgICAgIB/g4Q3AwggAkEQaiQAC+sLAgV/D34jAEHgAGsiBSQAIAFCIIggAkIghoQhCiADQhGIIARCL4aEIQsgA0IxiCAEQv///////z+DIgxCD4aEIQ0gBCAChUKAgICAgICAgIB/gyEOIAJC////////P4MiD0IgiCEQIAxCEYghESAEQjCIp0H//wFxIQYCQAJAAkAgAkIwiKdB//8BcSIHQX9qQf3/AUsNAEEAIQggBkF/akH+/wFJDQELAkAgAVAgAkL///////////8AgyISQoCAgICAgMD//wBUIBJCgICAgICAwP//AFEbDQAgAkKAgICAgIAghCEODAILAkAgA1AgBEL///////////8AgyICQoCAgICAgMD//wBUIAJCgICAgICAwP//AFEbDQAgBEKAgICAgIAghCEOIAMhAQwCCwJAIAEgEkKAgICAgIDA//8AhYRCAFINAAJAIAMgAoRQRQ0AQoCAgICAgOD//wAhDkIAIQEMAwsgDkKAgICAgIDA//8AhCEOQgAhAQwCCwJAIAMgAkKAgICAgIDA//8AhYRCAFINACABIBKEIQJCACEBAkAgAlBFDQBCgICAgICA4P//ACEODAMLIA5CgICAgICAwP//AIQhDgwCCwJAIAEgEoRCAFINAEIAIQEMAgsCQCADIAKEQgBSDQBCACEBDAILQQAhCAJAIBJC////////P1YNACAFQdAAaiABIA8gASAPIA9QIggbeSAIQQZ0rXynIghBcWoQxAVBECAIayEIIAUpA1AiAUIgiCAFQdgAaikDACIPQiCGhCEKIA9CIIghEAsgAkL///////8/Vg0AIAVBwABqIAMgDCADIAwgDFAiCRt5IAlBBnStfKciCUFxahDEBSAIIAlrQRBqIQggBSkDQCIDQjGIIAVByABqKQMAIgJCD4aEIQ0gA0IRiCACQi+GhCELIAJCEYghEQsgC0L/////D4MiAiABQv////8PgyIEfiITIANCD4ZCgID+/w+DIgEgCkL/////D4MiA358IgpCIIYiDCABIAR+fCILIAxUrSACIAN+IhQgASAPQv////8PgyIMfnwiEiANQv////8PgyIPIAR+fCINIApCIIggCiATVK1CIIaEfCITIAIgDH4iFSABIBBCgIAEhCIKfnwiECAPIAN+fCIWIBFC/////weDQoCAgIAIhCIBIAR+fCIRQiCGfCIXfCEEIAcgBmogCGpBgYB/aiEGAkACQCAPIAx+IhggAiAKfnwiAiAYVK0gAiABIAN+fCIDIAJUrXwgAyASIBRUrSANIBJUrXx8IgIgA1StfCABIAp+fCABIAx+IgMgDyAKfnwiASADVK1CIIYgAUIgiIR8IAIgAUIghnwiASACVK18IAEgEUIgiCAQIBVUrSAWIBBUrXwgESAWVK18QiCGhHwiAyABVK18IAMgEyANVK0gFyATVK18fCICIANUrXwiAUKAgICAgIDAAINQDQAgBkEBaiEGDAELIAtCP4ghAyABQgGGIAJCP4iEIQEgAkIBhiAEQj+IhCECIAtCAYYhCyADIARCAYaEIQQLAkAgBkH//wFIDQAgDkKAgICAgIDA//8AhCEOQgAhAQwBCwJAAkAgBkEASg0AAkBBASAGayIHQYABSQ0AQgAhAQwDCyAFQTBqIAsgBCAGQf8AaiIGEMQFIAVBIGogAiABIAYQxAUgBUEQaiALIAQgBxDJBSAFIAIgASAHEMkFIAUpAyAgBSkDEIQgBSkDMCAFQTBqQQhqKQMAhEIAUq2EIQsgBUEgakEIaikDACAFQRBqQQhqKQMAhCEEIAVBCGopAwAhASAFKQMAIQIMAQsgBq1CMIYgAUL///////8/g4QhAQsgASAOhCEOAkAgC1AgBEJ/VSAEQoCAgICAgICAgH9RGw0AIA4gAkIBfCIBIAJUrXwhDgwBCwJAIAsgBEKAgICAgICAgIB/hYRCAFENACACIQEMAQsgDiACIAJCAYN8IgEgAlStfCEOCyAAIAE3AwAgACAONwMIIAVB4ABqJAALQQEBfyMAQRBrIgUkACAFIAEgAiADIARCgICAgICAgICAf4UQxwUgACAFKQMANwMAIAAgBSkDCDcDCCAFQRBqJAALjQECAn8CfiMAQRBrIgIkAAJAAkAgAQ0AQgAhBEIAIQUMAQsgAiABIAFBH3UiA2ogA3MiA61CACADZyIDQdEAahDEBSACQQhqKQMAQoCAgICAgMAAhUGegAEgA2utQjCGfCABQYCAgIB4ca1CIIaEIQUgAikDACEECyAAIAQ3AwAgACAFNwMIIAJBEGokAAufEgIFfwx+IwBBwAFrIgUkACAEQv///////z+DIQogAkL///////8/gyELIAQgAoVCgICAgICAgICAf4MhDCAEQjCIp0H//wFxIQYCQAJAAkACQCACQjCIp0H//wFxIgdBf2pB/f8BSw0AQQAhCCAGQX9qQf7/AUkNAQsCQCABUCACQv///////////wCDIg1CgICAgICAwP//AFQgDUKAgICAgIDA//8AURsNACACQoCAgICAgCCEIQwMAgsCQCADUCAEQv///////////wCDIgJCgICAgICAwP//AFQgAkKAgICAgIDA//8AURsNACAEQoCAgICAgCCEIQwgAyEBDAILAkAgASANQoCAgICAgMD//wCFhEIAUg0AAkAgAyACQoCAgICAgMD//wCFhFBFDQBCACEBQoCAgICAgOD//wAhDAwDCyAMQoCAgICAgMD//wCEIQxCACEBDAILAkAgAyACQoCAgICAgMD//wCFhEIAUg0AQgAhAQwCCyABIA2EQgBRDQICQCADIAKEQgBSDQAgDEKAgICAgIDA//8AhCEMQgAhAQwCC0EAIQgCQCANQv///////z9WDQAgBUGwAWogASALIAEgCyALUCIIG3kgCEEGdK18pyIIQXFqEMQFQRAgCGshCCAFQbgBaikDACELIAUpA7ABIQELIAJC////////P1YNACAFQaABaiADIAogAyAKIApQIgkbeSAJQQZ0rXynIglBcWoQxAUgCSAIakFwaiEIIAVBqAFqKQMAIQogBSkDoAEhAwsgBUGQAWogA0IxiCAKQoCAgICAgMAAhCIOQg+GhCICQgBChMn5zr/mvIL1ACACfSIEQgAQwwUgBUGAAWpCACAFQZABakEIaikDAH1CACAEQgAQwwUgBUHwAGogBSkDgAFCP4ggBUGAAWpBCGopAwBCAYaEIgRCACACQgAQwwUgBUHgAGogBEIAQgAgBUHwAGpBCGopAwB9QgAQwwUgBUHQAGogBSkDYEI/iCAFQeAAakEIaikDAEIBhoQiBEIAIAJCABDDBSAFQcAAaiAEQgBCACAFQdAAakEIaikDAH1CABDDBSAFQTBqIAUpA0BCP4ggBUHAAGpBCGopAwBCAYaEIgRCACACQgAQwwUgBUEgaiAEQgBCACAFQTBqQQhqKQMAfUIAEMMFIAVBEGogBSkDIEI/iCAFQSBqQQhqKQMAQgGGhCIEQgAgAkIAEMMFIAUgBEIAQgAgBUEQakEIaikDAH1CABDDBSAIIAcgBmtqIQYCQAJAQgAgBSkDAEI/iCAFQQhqKQMAQgGGhEJ/fCINQv////8PgyIEIAJCIIgiD34iECANQiCIIg0gAkL/////D4MiEX58IgJCIIggAiAQVK1CIIaEIA0gD358IAJCIIYiDyAEIBF+fCICIA9UrXwgAiAEIANCEYhC/////w+DIhB+IhEgDSADQg+GQoCA/v8PgyISfnwiD0IghiITIAQgEn58IBNUrSAPQiCIIA8gEVStQiCGhCANIBB+fHx8Ig8gAlStfCAPQgBSrXx9IgJC/////w+DIhAgBH4iESAQIA1+IhIgBCACQiCIIhN+fCICQiCGfCIQIBFUrSACQiCIIAIgElStQiCGhCANIBN+fHwgEEIAIA99IgJCIIgiDyAEfiIRIAJC/////w+DIhIgDX58IgJCIIYiEyASIAR+fCATVK0gAkIgiCACIBFUrUIghoQgDyANfnx8fCICIBBUrXwgAkJ+fCIRIAJUrXxCf3wiD0L/////D4MiAiABQj6IIAtCAoaEQv////8PgyIEfiIQIAFCHohC/////w+DIg0gD0IgiCIPfnwiEiAQVK0gEiARQiCIIhAgC0IeiEL//+//D4NCgIAQhCILfnwiEyASVK18IAsgD358IAIgC34iFCAEIA9+fCISIBRUrUIghiASQiCIhHwgEyASQiCGfCISIBNUrXwgEiAQIA1+IhQgEUL/////D4MiESAEfnwiEyAUVK0gEyACIAFCAoZC/P///w+DIhR+fCIVIBNUrXx8IhMgElStfCATIBQgD34iEiARIAt+fCIPIBAgBH58IgQgAiANfnwiAkIgiCAPIBJUrSAEIA9UrXwgAiAEVK18QiCGhHwiDyATVK18IA8gFSAQIBR+IgQgESANfnwiDUIgiCANIARUrUIghoR8IgQgFVStIAQgAkIghnwgBFStfHwiBCAPVK18IgJC/////////wBWDQAgAUIxhiAEQv////8PgyIBIANC/////w+DIg1+Ig9CAFKtfUIAIA99IhEgBEIgiCIPIA1+IhIgASADQiCIIhB+fCILQiCGIhNUrX0gBCAOQiCIfiADIAJCIIh+fCACIBB+fCAPIAp+fEIghiACQv////8PgyANfiABIApC/////w+DfnwgDyAQfnwgC0IgiCALIBJUrUIghoR8fH0hDSARIBN9IQEgBkF/aiEGDAELIARCIYghECABQjCGIARCAYggAkI/hoQiBEL/////D4MiASADQv////8PgyINfiIPQgBSrX1CACAPfSILIAEgA0IgiCIPfiIRIBAgAkIfhoQiEkL/////D4MiEyANfnwiEEIghiIUVK19IAQgDkIgiH4gAyACQiGIfnwgAkIBiCICIA9+fCASIAp+fEIghiATIA9+IAJC/////w+DIA1+fCABIApC/////w+DfnwgEEIgiCAQIBFUrUIghoR8fH0hDSALIBR9IQEgAiECCwJAIAZBgIABSA0AIAxCgICAgICAwP//AIQhDEIAIQEMAQsgBkH//wBqIQcCQCAGQYGAf0oNAAJAIAcNACACQv///////z+DIAQgAUIBhiADViANQgGGIAFCP4iEIgEgDlYgASAOURutfCIBIARUrXwiA0KAgICAgIDAAINQDQAgAyAMhCEMDAILQgAhAQwBCyACQv///////z+DIAQgAUIBhiADWiANQgGGIAFCP4iEIgEgDlogASAOURutfCIBIARUrXwgB61CMIZ8IAyEIQwLIAAgATcDACAAIAw3AwggBUHAAWokAA8LIABCADcDACAAQoCAgICAgOD//wAgDCADIAKEUBs3AwggBUHAAWokAAvqAwICfwJ+IwBBIGsiAiQAAkACQCABQv///////////wCDIgRCgICAgICAwP9DfCAEQoCAgICAgMCAvH98Wg0AIABCPIggAUIEhoQhBAJAIABC//////////8PgyIAQoGAgICAgICACFQNACAEQoGAgICAgICAwAB8IQUMAgsgBEKAgICAgICAgMAAfCEFIABCgICAgICAgIAIhUIAUg0BIAUgBEIBg3whBQwBCwJAIABQIARCgICAgICAwP//AFQgBEKAgICAgIDA//8AURsNACAAQjyIIAFCBIaEQv////////8Dg0KAgICAgICA/P8AhCEFDAELQoCAgICAgID4/wAhBSAEQv///////7//wwBWDQBCACEFIARCMIinIgNBkfcASQ0AIAJBEGogACABQv///////z+DQoCAgICAgMAAhCIEIANB/4h/ahDEBSACIAAgBEGB+AAgA2sQyQUgAikDACIEQjyIIAJBCGopAwBCBIaEIQUCQCAEQv//////////D4MgAikDECACQRBqQQhqKQMAhEIAUq2EIgRCgYCAgICAgIAIVA0AIAVCAXwhBQwBCyAEQoCAgICAgICACIVCAFINACAFQgGDIAV8IQULIAJBIGokACAFIAFCgICAgICAgICAf4OEvwtyAgF/An4jAEEQayICJAACQAJAIAENAEIAIQNCACEEDAELIAIgAa1CACABZyIBQdEAahDEBSACQQhqKQMAQoCAgICAgMAAhUGegAEgAWutQjCGfCEEIAIpAwAhAwsgACADNwMAIAAgBDcDCCACQRBqJAALMwEBfyAAQQEgABshAQJAA0AgARCBBiIADQECQBDkBSIARQ0AIAARDQAMAQsLEA4ACyAACwcAIAAQggYLAwAACyIBAX8jAEEQayIBJAAgASAAENYFENcFIQAgAUEQaiQAIAALDAAgACABENgFGiAACzkBAn8jAEEQayIBJABBACECAkAgAUEIaiAAKAIEENkFENoFDQAgABDbBRDcBSECCyABQRBqJAAgAgsjACAAQQA2AgwgACABNgIEIAAgATYCACAAIAFBAWo2AgggAAsLACAAIAE2AgAgAAsKACAAKAIAEOEFCwQAIAALPQECf0EAIQECQAJAIAAoAggiAi0AACIAQQFGDQAgAEECcQ0BIAJBAjoAAEEBIQELIAEPC0G8NEEAENQFAAseAQF/IwBBEGsi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BSAFKQMQIgQgBUEQakEIaikDACIDIAQgAxDPBSAFQQhqKQMAIQIgBSkDACEEDAELAkAgASAIrUIwhiACQv///////z+DhCIJIAMgBEIwiKdB//8BcSIGrUIwhiAEQv///////z+DhCIKEMEFQQBKDQACQCABIAkgAyAKEMEFRQ0AIAEhBAwCCyAFQfAAaiABIAJCAEIAEMwFIAVB+ABqKQMAIQIgBSkDcCEEDAELAkACQCAIRQ0AIAEhBAwBCyAFQeAAaiABIAlCAEKAgICAgIDAu8AAEMwFIAVB6ABqKQMAIglCMIinQYh/aiEIIAUpA2AhBAsCQCAGDQAgBUHQAGogAyAKQgBCgICAgICAwLvAABDMBSAFQdgAaikDACIKQjCIp0GIf2ohBiAFKQNQIQMLIApC////////P4NCgICAgICAwACEIQsgCUL///////8/g0KAgICAgIDAAIQhCQJAIAggBkwNAANAAkACQCAJIAt9IAQgA1StfSIKQgBTDQACQCAKIAQgA30iBIRCAFINACAFQSBqIAEgAkIAQgAQzAUgBUEoaikDACECIAUpAyAhBAwFCyAKQgGGIARCP4iEIQkMAQsgCUIBhiAEQj+IhCEJCyAEQgGGIQQgCEF/aiIIIAZKDQALIAYhCAsCQAJAIAkgC30gBCADVK19IgpCAFkNACAJIQoMAQsgCiAEIAN9IgSEQgBSDQAgBUEwaiABIAJCAEIAEMwFIAVBOGopAwAhAiAFKQMwIQQMAQsCQCAKQv///////z9WDQADQCAEQj+IIQMgCEF/aiEIIARCAYYhBCADIApCAYaEIgpCgICAgICAwABUDQALCyAHQYCAAnEhBgJAIAhBAEoNACAFQcAAaiAEIApC////////P4MgCEH4AGogBnKtQjCGhEIAQoCAgICAgMDDPxDMBSAFQcgAaikDACECIAUpA0AhBAwBCyAKQv///////z+DIAggBnKtQjCGhCECCyAAIAQ3AwAgACACNwMIIAVBgAFqJAALrgEAAkACQCABQYAISA0AIABEAAAAAAAA4H+iIQACQCABQf8PTg0AIAFBgXhqIQEMAgsgAEQAAAAAAADgf6IhACABQf0XIAFB/RdIG0GCcGohAQwBCyABQYF4Sg0AIABEAAAAAAAAEACiIQACQCABQYNwTA0AIAFB/gdqIQEMAQsgAEQAAAAAAAAQAKIhACABQYZoIAFBhmhKG0H8D2ohAQsgACABQf8Haq1CNIa/ogtLAgF+An8gAUL///////8/gyECAkACQCABQjCIp0H//wFxIgNB//8BRg0AQQQhBCADDQFBAkEDIAIgAIRQGw8LIAIgAIRQIQQLIAQLkQQBA38CQCACQYAESQ0AIAAgASACEBAaIAAPCyAAIAJqIQMCQAJAIAEgAHNBA3ENAAJAAkAgAkEBTg0AIAAhAgwBCwJAIABBA3ENACAAIQIMAQsgACECA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgIgA08NASACQQNxDQALCwJAIANBfHEiBEHAAEkNACACIARBQGoiBUsNAANAIAIgASgCADYCACACIAEoAgQ2AgQgAiABKAIINgIIIAIgASgCDDYCDCACIAEoAhA2AhAgAiABKAIUNgIUIAIgASgCGDYCGCACIAEoAhw2AhwgAiABKAIgNgIgIAIgASgCJDYCJCACIAEoAig2AiggAiABKAIsNgIsIAIgASgCMDYCMCACIAEoAjQ2AjQgAiABKAI4NgI4IAIgASgCPDYCPCABQcAAaiEBIAJBwABqIgIgBU0NAAsLIAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQAMAgsACwJAIANBBE8NACAAIQIMAQsCQCADQXxqIgQgAE8NACAAIQIMAQsgACECA0AgAiABLQAAOgAAIAIgAS0AAToAASACIAEtAAI6AAIgAiABLQADOgADIAFBBGohASACQQRqIgIgBE0NAAsLAkAgAiADTw0AA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgIgA0cNAAsLIAAL8gICA38BfgJAIAJFDQAgAiAAaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIFayICQSBJDQAgAa1CgYCAgBB+IQYgAyAFaiEBA0AgASAGNwMYIAEgBjcDECABIAY3AwggASAGNwMAIAFBIGohASACQWBqIgJBH0sNAAsLIAAL+AIBAX8CQCAAIAFGDQACQCABIABrIAJrQQAgAkEBdGtLDQAgACABIAIQigYPCyABIABzQQNxIQMCQAJAAkAgACABTw0AAkAgA0UNACAAIQMMAwsCQCAAQQNxDQAgACEDDAILIAAhAwNAIAJFDQQgAyABLQAAOgAAIAFBAWohASACQX9qIQIgA0EBaiIDQQNxRQ0CDAALAAsCQCADDQACQCAAIAJqQQNxRQ0AA0AgAkUNBSAAIAJBf2oiAmoiAyABIAJqLQAAOgAAIANBA3ENAAsLIAJBA00NAANAIAAgAkF8aiICaiABIAJqKAIANgIAIAJBA0sNAAsLIAJFDQIDQCAAIAJBf2oiAmogASACai0AADoAACACDQAMAwsACyACQQNNDQADQCADIAEoAgA2AgAgAUEEaiEBIANBBGohAyACQXxqIgJBA0sNAAsLIAJFDQADQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAALXAEBfyAAIAAtAEoiAUF/aiABcjoASgJAIAAoAgAiAUEIcUUNACAAIAFBIHI2AgBBfw8LIABCADcCBCAAIAAoAiwiATYCHCAAIAE2AhQgACABIAAoAjBqNgIQQQALzgEBA38CQAJAIAIoAhAiAw0AQQAhBCACEI0GDQEgAigCECEDCwJAIAMgAigCFCIFayABTw0AIAIgACABIAIoAiQRBQAPCwJAAkAgAiwAS0EATg0AQQAhAwwBCyABIQQDQAJAIAQiAw0AQQAhAwwCCyAAIANBf2oiBGotAABBCkcNAAsgAiAAIAMgAigCJBEFACIEIANJDQEgACADaiEAIAEgA2shASACKAIUIQULIAUgACABEIoGGiACIAIoAhQgAWo2AhQgAyABaiEECyAECwQAQQELAgALmgEBA38gACEBAkACQCAAQQNxRQ0AAkAgAC0AAA0AIAAgAGsPCyAAIQEDQCABQQFqIgFBA3FFDQEgAS0AAA0ADAILAAsDQCABIgJBBGohASACKAIAIgNB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AACUAAAAlQAAAJYAAACXAAAAmAAAAJkAAACHAAAATjNXQU05UHJvY2Vzc29yRQAAAAD8GwAAOA4AAAAAAADcDgAAmgAAAJsAAACMAAAAcgAAAHMAAAB0AAAAdQAAAEwAAAB3AAAAnAAAAHkAAACdAAAASW5wdXQATWFpbgBBdXgASW5wdXQgJWkAT3V0cHV0AE91dHB1dCAlaQAgAC0AJXMtJXMALgBONWlwbHVnMTRJUGx1Z1Byb2Nlc3NvckUAAAD8GwAAwQ4AACoAJWQAdm9pZABib29sAGNoYXIAc2lnbmVkIGNoYXIAdW5zaWduZWQgY2hhcgBzaG9ydAB1bnNpZ25lZCBzaG9ydABpbnQAdW5zaWduZWQgaW50AGxvbmcAdW5zaWduZWQgbG9uZwBmbG9hdABkb3VibGUAc3RkOjpzdHJpbmcAc3RkOjpiYXNpY19zdHJpbmc8dW5zaWduZWQgY2hhcj4Ac3RkOjp3c3RyaW5nAHN0ZDo6dTE2c3RyaW5nAHN0ZDo6dTMyc3RyaW5nAGVtc2NyaXB0ZW46OnZhbABlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGZsb2F0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxkb3VibGU+AE5TdDNfXzIxMmJhc2ljX3N0cmluZ0loTlNfMTFjaGFyX3RyYWl0c0loRUVOU185YWxsb2NhdG9ySWhFRUVFAAAAgBwAAP8RAAAAAAAAAQAAAPwIAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSXdOU18xMWNoYXJfdHJhaXRzSXdFRU5TXzlhbGxvY2F0b3JJd0VFRUUAAIAcAABYEgAAAAAAAAEAAAD8CAAAAAAAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEc05TXzExY2hhcl90cmFpdHNJRHNFRU5TXzlhbGxvY2F0b3JJRHNFRUVFAAAAgBwAALASAAAAAAAAAQAAAPwIAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSURpTlNfMTFjaGFyX3RyYWl0c0lEaUVFTlNfOWFsbG9jYXRvcklEaUVFRUUAAACAHAAADBMAAAAAAAABAAAA/AgAAAAAAABOMTBlbXNjcmlwdGVuM3ZhbEUAAPwbAABoEwAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJY0VFAAD8GwAAhBMAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWFFRQAA/BsAAKwTAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0loRUUAAPwbAADUEwAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJc0VFAAD8GwAA/BMAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXRFRQAA/BsAACQUAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lpRUUAAPwbAABMFAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJakVFAAD8GwAAdBQAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWxFRQAA/BsAAJwUAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ltRUUAAPwbAADEFAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZkVFAAD8GwAA7BQAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWRFRQAA/BsAABQVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAnwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALSsgICAwWDB4AChudWxsKQAAAAAAAAAAAAAAAAAAAAARAAoAERERAAAAAAUAAAAAAAAJAAAAAAsAAAAAAAAAABEADwoREREDCgcAAQAJCwsAAAkGCwAACwAGEQAAABEREQAAAAAAAAAAAAAAAAAAAAALAAAAAAAAAAARAAoKERERAAoAAAIACQsAAAAJAAsAAAsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAADAAAAAAMAAAAAAkMAAAAAAAMAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAA0AAAAEDQAAAAAJDgAAAAAADgAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAPAAAAAA8AAAAACRAAAAAAABAAABAAABIAAAASEhIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgAAABISEgAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsAAAAAAAAAAAAAAAoAAAAACgAAAAAJCwAAAAAACwAACwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAMAAAAAAwAAAAACQwAAAAAAAwAAAwAADAxMjM0NTY3ODlBQkNERUYtMFgrMFggMFgtMHgrMHggMHgAaW5mAElORgBuYW4ATkFOAC4AaW5maW5pdHkAbmFuAAAAAAAAAAAAAAAAAAAA0XSeAFedvSqAcFIP//8+JwoAAABkAAAA6AMAABAnAACghgEAQEIPAICWmAAA4fUFGAAAADUAAABxAAAAa////877//+Sv///AAAAAAAAAAD/////////////////////////////////////////////////////////////////AAECAwQFBgcICf////////8KCwwNDg8QERITFBUWFxgZGhscHR4fICEiI////////woLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIj/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wABAgQHAwYFAAAAAAAAAAIAAMADAADABAAAwAUAAMAGAADABwAAwAgAAMAJAADACgAAwAsAAMAMAADADQAAwA4AAMAPAADAEAAAwBEAAMASAADAEwAAwBQAAMAVAADAFgAAwBcAAMAYAADAGQAAwBoAAMAbAADAHAAAwB0AAMAeAADAHwAAwAAAALMBAADDAgAAwwMAAMMEAADDBQAAwwYAAMMHAADDCAAAwwkAAMMKAADDCwAAwwwAAMMNAADTDgAAww8AAMMAAAy7AQAMwwIADMMDAAzDBAAM019fY3hhX2d1YXJkX2FjcXVpcmUgZGV0ZWN0ZWQgcmVjdXJzaXZlIGluaXRpYWxpemF0aW9uAFB1cmUgdmlydHVhbCBmdW5jdGlvbiBjYWxsZWQhAFN0OXR5cGVfaW5mbwAAAAD8GwAAkBoAAE4xMF9fY3h4YWJpdjExNl9fc2hpbV90eXBlX2luZm9FAAAAACQcAACoGgAAoBoAAE4xMF9fY3h4YWJpdjExN19fY2xhc3NfdHlwZV9pbmZvRQAAACQcAADYGgAAzBoAAAAAAABMGwAAowAAAKQAAAClAAAApgAAAKcAAABOMTBfX2N4eGFiaXYxMjNfX2Z1bmRhbWVudGFsX3R5cGVfaW5mb0UAJBwAACQbAADMGgAAdgAAABAbAABYGwAAYgAAABAbAABkGwAAYwAAABAbAABwGwAAaAAAABAbAAB8GwAAYQAAABAbAACIGwAAcwAAABAbAACUGwAAdAAAABAbAACgGwAAaQAAABAbAACsGwAAagAAABAbAAC4GwAAbAAAABAbAADEGwAAbQAAABAbAADQGwAAZgAAABAbAADcGwAAZAAAABAbAADoGwAAAAAAAPwaAACjAAAAqAAAAKUAAACmAAAAqQAAAKoAAACrAAAArAAAAAAAAABsHAAAowAAAK0AAAClAAAApgAAAKkAAACuAAAArwAAALAAAABOMTBfX2N4eGFiaXYxMjBfX3NpX2NsYXNzX3R5cGVfaW5mb0UAAAAAJBwAAEQcAAD8GgAAAAAAAMgcAACjAAAAsQAAAKUAAACmAAAAqQAAALIAAACzAAAAtAAAAE4xMF9fY3h4YWJpdjEyMV9fdm1pX2NsYXNzX3R5cGVfaW5mb0UAAAAkHAAAoBwAAPwaAAAAQeA5C4QClAUAAJoFAACfBQAApgUAAKkFAAC5BQAAwwUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAiUAAAQeQ7CwA=';
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw "sync fetching of the wasm failed: you can preload it to Module['wasmBinary'] manually, or emcc.py will do that for you when generating HTML (but not JS)";
    }
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch === 'function'
      && !isFileURI(wasmBinaryFile)
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
    else {
      if (readAsync) {
        // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
        return new Promise(function(resolve, reject) {
          readAsync(wasmBinaryFile, function(response) { resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))) }, reject)
        });
      }
    }
  }
    
  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

function instantiateSync(file, info) {
  var instance;
  var module;
  var binary;
  try {
    binary = getBinary(file);
    module = new WebAssembly.Module(binary);
    instance = new WebAssembly.Instance(module, info);
  } catch (e) {
    var str = e.toString();
    err('failed to compile wasm module: ' + str);
    if (str.indexOf('imported Memory') >= 0 ||
        str.indexOf('memory import') >= 0) {
      err('Memory size incompatibility issues may be due to changing INITIAL_MEMORY at runtime to something too large. Use ALLOW_MEMORY_GROWTH to allow any size memory (and also make sure not to set INITIAL_MEMORY at runtime to something smaller than it was at compile time).');
    }
    throw e;
  }
  return [instance, module];
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmMemory = Module['asm']['memory'];
    updateGlobalBufferAndViews(wasmMemory.buffer);

    wasmTable = Module['asm']['__indirect_function_table'];

    addOnInit(Module['asm']['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');
  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');

  function receiveInstantiatedSource(output) {
    // 'output' is a WebAssemblyInstantiatedSource object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(output['instance']);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      var result = WebAssembly.instantiate(binary, info);
      return result;
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);

      abort(reason);
    });
  }

  // Prefer streaming instantiation if available.

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }

  var result = instantiateSync(wasmBinaryFile, info);
  // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193,
  // the above line no longer optimizes out down to the following line.
  // When the regression is fixed, we can remove this if/else.
  receiveInstance(result[0]);
  return Module['asm']; // exports were assigned here
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  7652: function($0, $1, $2) {var msg = {}; msg.verb = Module.UTF8ToString($0); msg.prop = Module.UTF8ToString($1); msg.data = Module.UTF8ToString($2); Module.port.postMessage(msg);},  
 7808: function($0, $1, $2, $3) {var arr = new Uint8Array($3); arr.set(Module.HEAP8.subarray($2,$2+$3)); var msg = {}; msg.verb = Module.UTF8ToString($0); msg.prop = Module.UTF8ToString($1); msg.data = arr.buffer; Module.port.postMessage(msg);},  
 8023: function($0) {Module.print(UTF8ToString($0))},  
 8054: function($0) {Module.print($0)}
};






  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback(Module); // Pass the module as the first argument.
          continue;
        }
        var func = callback.func;
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            wasmTable.get(func)();
          } else {
            wasmTable.get(func)(callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }

  function demangle(func) {
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
        // so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  var runtimeKeepaliveCounter=0;
  function keepRuntimeAlive() {
      return noExitRuntime || runtimeKeepaliveCounter > 0;
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  function _atexit(func, arg) {
    }
  function ___cxa_atexit(a0,a1
  ) {
  return _atexit(a0,a1);
  }

  function _gmtime_r(time, tmPtr) {
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[((tmPtr)>>2)] = date.getUTCSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getUTCMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getUTCHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getUTCDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getUTCMonth();
      HEAP32[(((tmPtr)+(20))>>2)] = date.getUTCFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)] = date.getUTCDay();
      HEAP32[(((tmPtr)+(36))>>2)] = 0;
      HEAP32[(((tmPtr)+(32))>>2)] = 0;
      var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
      var yday = ((date.getTime() - start) / (1000 * 60 * 60 * 24))|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
      // Allocate a string "GMT" for us to point to.
      if (!_gmtime_r.GMTString) _gmtime_r.GMTString = allocateUTF8("GMT");
      HEAP32[(((tmPtr)+(40))>>2)] = _gmtime_r.GMTString;
      return tmPtr;
    }
  function ___gmtime_r(a0,a1
  ) {
  return _gmtime_r(a0,a1);
  }

  function _tzset() {
      // TODO: Use (malleable) environment variables instead of system settings.
      if (_tzset.called) return;
      _tzset.called = true;
  
      var currentYear = new Date().getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
  
      // Local standard timezone offset. Local standard time is not adjusted for daylight savings.
      // This code uses the fact that getTimezoneOffset returns a greater value during Standard Time versus Daylight Saving Time (DST). 
      // Thus it determines the expected output during Standard Time, and it compares whether the output of the given date the same (Standard) or less (DST).
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  
      // timezone is specified as seconds west of UTC ("The external variable
      // `timezone` shall be set to the difference, in seconds, between
      // Coordinated Universal Time (UTC) and local standard time."), the same
      // as returned by stdTimezoneOffset.
      // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
      HEAP32[((__get_timezone())>>2)] = stdTimezoneOffset * 60;
  
      HEAP32[((__get_daylight())>>2)] = Number(winterOffset != summerOffset);
  
      function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT";
      };
      var winterName = extractZone(winter);
      var summerName = extractZone(summer);
      var winterNamePtr = allocateUTF8(winterName);
      var summerNamePtr = allocateUTF8(summerName);
      if (summerOffset < winterOffset) {
        // Northern hemisphere
        HEAP32[((__get_tzname())>>2)] = winterNamePtr;
        HEAP32[(((__get_tzname())+(4))>>2)] = summerNamePtr;
      } else {
        HEAP32[((__get_tzname())>>2)] = summerNamePtr;
        HEAP32[(((__get_tzname())+(4))>>2)] = winterNamePtr;
      }
    }
  function _localtime_r(time, tmPtr) {
      _tzset();
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[((tmPtr)>>2)] = date.getSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getMonth();
      HEAP32[(((tmPtr)+(20))>>2)] = date.getFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)] = date.getDay();
  
      var start = new Date(date.getFullYear(), 0, 1);
      var yday = ((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
      HEAP32[(((tmPtr)+(36))>>2)] = -(date.getTimezoneOffset() * 60);
  
      // Attention: DST is in December in South, and some regions don't have DST at all.
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset))|0;
      HEAP32[(((tmPtr)+(32))>>2)] = dst;
  
      var zonePtr = HEAP32[(((__get_tzname())+(dst ? 4 : 0))>>2)];
      HEAP32[(((tmPtr)+(40))>>2)] = zonePtr;
  
      return tmPtr;
    }
  function ___localtime_r(a0,a1
  ) {
  return _localtime_r(a0,a1);
  }

  function getShiftFromSize(size) {
      switch (size) {
          case 1: return 0;
          case 2: return 1;
          case 4: return 2;
          case 8: return 3;
          default:
              throw new TypeError('Unknown type size: ' + size);
      }
    }
  
  function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
      }
      embind_charCodes = codes;
    }
  var embind_charCodes=undefined;
  function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    }
  
  var awaitingDependencies={};
  
  var registeredTypes={};
  
  var typeDependencies={};
  
  var char_0=48;
  
  var char_9=57;
  function makeLegalFunctionName(name) {
      if (undefined === name) {
          return '_unknown';
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, '$');
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
          return '_' + name;
      } else {
          return name;
      }
    }
  function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      /*jshint evil:true*/
      return new Function(
          "body",
          "return function " + name + "() {\n" +
          "    \"use strict\";" +
          "    return body.apply(this, arguments);\n" +
          "};\n"
      )(body);
    }
  function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function(message) {
          this.name = errorName;
          this.message = message;
  
          var stack = (new Error(message)).stack;
          if (stack !== undefined) {
              this.stack = this.toString() + '\n' +
                  stack.replace(/^Error(:[^\n]*)?\n/, '');
          }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
          if (this.message === undefined) {
              return this.name;
          } else {
              return this.name + ': ' + this.message;
          }
      };
  
      return errorClass;
    }
  var BindingError=undefined;
  function throwBindingError(message) {
      throw new BindingError(message);
    }
  
  var InternalError=undefined;
  function throwInternalError(message) {
      throw new InternalError(message);
    }
  function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
      myTypes.forEach(function(type) {
          typeDependencies[type] = dependentTypes;
      });
  
      function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
              throwInternalError('Mismatched type converter count');
          }
          for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i]);
          }
      }
  
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach(function(dt, i) {
          if (registeredTypes.hasOwnProperty(dt)) {
              typeConverters[i] = registeredTypes[dt];
          } else {
              unregisteredTypes.push(dt);
              if (!awaitingDependencies.hasOwnProperty(dt)) {
                  awaitingDependencies[dt] = [];
              }
              awaitingDependencies[dt].push(function() {
                  typeConverters[i] = registeredTypes[dt];
                  ++registered;
                  if (registered === unregisteredTypes.length) {
                      onComplete(typeConverters);
                  }
              });
          }
      });
      if (0 === unregisteredTypes.length) {
          onComplete(typeConverters);
      }
    }
  /** @param {Object=} options */
  function registerType(rawType, registeredInstance, options) {
      options = options || {};
  
      if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance');
      }
  
      var name = registeredInstance.name;
      if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
              return;
          } else {
              throwBindingError("Cannot register type '" + name + "' twice");
          }
      }
  
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
  
      if (awaitingDependencies.hasOwnProperty(rawType)) {
          var callbacks = awaitingDependencies[rawType];
          delete awaitingDependencies[rawType];
          callbacks.forEach(function(cb) {
              cb();
          });
      }
    }
  function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
      var shift = getShiftFromSize(size);
  
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': function(wt) {
              // ambiguous emscripten ABI: sometimes return values are
              // true or false, and sometimes integers (0 or 1)
              return !!wt;
          },
          'toWireType': function(destructors, o) {
              return o ? trueValue : falseValue;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': function(pointer) {
              // TODO: if heap is fixed (like in asm.js) this could be executed outside
              var heap;
              if (size === 1) {
                  heap = HEAP8;
              } else if (size === 2) {
                  heap = HEAP16;
              } else if (size === 4) {
                  heap = HEAP32;
              } else {
                  throw new TypeError("Unknown boolean type size: " + name);
              }
              return this['fromWireType'](heap[pointer >> shift]);
          },
          destructorFunction: null, // This type does not need a destructor
      });
    }

  var emval_free_list=[];
  
  var emval_handle_array=[{},{value:undefined},{value:null},{value:true},{value:false}];
  function __emval_decref(handle) {
      if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
          emval_handle_array[handle] = undefined;
          emval_free_list.push(handle);
      }
    }
  
  function count_emval_handles() {
      var count = 0;
      for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
              ++count;
          }
      }
      return count;
    }
  
  function get_first_emval() {
      for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
              return emval_handle_array[i];
          }
      }
      return null;
    }
  function init_emval() {
      Module['count_emval_handles'] = count_emval_handles;
      Module['get_first_emval'] = get_first_emval;
    }
  function __emval_register(value) {
      switch (value) {
        case undefined :{ return 1; }
        case null :{ return 2; }
        case true :{ return 3; }
        case false :{ return 4; }
        default:{
          var handle = emval_free_list.length ?
              emval_free_list.pop() :
              emval_handle_array.length;
  
          emval_handle_array[handle] = {refcount: 1, value: value};
          return handle;
          }
        }
    }
  
  function simpleReadValueFromPointer(pointer) {
      return this['fromWireType'](HEAPU32[pointer >> 2]);
    }
  function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': function(handle) {
              var rv = emval_handle_array[handle].value;
              __emval_decref(handle);
              return rv;
          },
          'toWireType': function(destructors, value) {
              return __emval_register(value);
          },
          'argPackAdvance': 8,
          'readValueFromPointer': simpleReadValueFromPointer,
          destructorFunction: null, // This type does not need a destructor
  
          // TODO: do we need a deleteObject here?  write a test where
          // emval is passed into JS via an interface
      });
    }

  function _embind_repr(v) {
      if (v === null) {
          return 'null';
      }
      var t = typeof v;
      if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
      } else {
          return '' + v;
      }
    }
  
  function floatReadValueFromPointer(name, shift) {
      switch (shift) {
          case 2: return function(pointer) {
              return this['fromWireType'](HEAPF32[pointer >> 2]);
          };
          case 3: return function(pointer) {
              return this['fromWireType'](HEAPF64[pointer >> 3]);
          };
          default:
              throw new TypeError("Unknown float type: " + name);
      }
    }
  function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': function(value) {
              return value;
          },
          'toWireType': function(destructors, value) {
              // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
              // avoid the following if() and assume value is of proper type.
              if (typeof value !== "number" && typeof value !== "boolean") {
                  throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
              }
              return value;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': floatReadValueFromPointer(name, shift),
          destructorFunction: null, // This type does not need a destructor
      });
    }

  function integerReadValueFromPointer(name, shift, signed) {
      // integers are quite common, so generate very specialized functions
      switch (shift) {
          case 0: return signed ?
              function readS8FromPointer(pointer) { return HEAP8[pointer]; } :
              function readU8FromPointer(pointer) { return HEAPU8[pointer]; };
          case 1: return signed ?
              function readS16FromPointer(pointer) { return HEAP16[pointer >> 1]; } :
              function readU16FromPointer(pointer) { return HEAPU16[pointer >> 1]; };
          case 2: return signed ?
              function readS32FromPointer(pointer) { return HEAP32[pointer >> 2]; } :
              function readU32FromPointer(pointer) { return HEAPU32[pointer >> 2]; };
          default:
              throw new TypeError("Unknown integer type: " + name);
      }
    }
  function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
      name = readLatin1String(name);
      if (maxRange === -1) { // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come out as 'i32 -1'. Always treat those as max u32.
          maxRange = 4294967295;
      }
  
      var shift = getShiftFromSize(size);
  
      var fromWireType = function(value) {
          return value;
      };
  
      if (minRange === 0) {
          var bitshift = 32 - 8*size;
          fromWireType = function(value) {
              return (value << bitshift) >>> bitshift;
          };
      }
  
      var isUnsignedType = (name.indexOf('unsigned') != -1);
  
      registerType(primitiveType, {
          name: name,
          'fromWireType': fromWireType,
          'toWireType': function(destructors, value) {
              // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
              // avoid the following two if()s and assume value is of proper type.
              if (typeof value !== "number" && typeof value !== "boolean") {
                  throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
              }
              if (value < minRange || value > maxRange) {
                  throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ', ' + maxRange + ']!');
              }
              return isUnsignedType ? (value >>> 0) : (value | 0);
          },
          'argPackAdvance': 8,
          'readValueFromPointer': integerReadValueFromPointer(name, shift, minRange !== 0),
          destructorFunction: null, // This type does not need a destructor
      });
    }

  function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [
          Int8Array,
          Uint8Array,
          Int16Array,
          Uint16Array,
          Int32Array,
          Uint32Array,
          Float32Array,
          Float64Array,
      ];
  
      var TA = typeMapping[dataTypeIndex];
  
      function decodeMemoryView(handle) {
          handle = handle >> 2;
          var heap = HEAPU32;
          var size = heap[handle]; // in elements
          var data = heap[handle + 1]; // byte offset into emscripten heap
          return new TA(buffer, data, size);
      }
  
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': decodeMemoryView,
          'argPackAdvance': 8,
          'readValueFromPointer': decodeMemoryView,
      }, {
          ignoreDuplicateRegistrations: true,
      });
    }

  function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8
      //process only std::string bindings with UTF8 support, in contrast to e.g. std::basic_string<unsigned char>
      = (name === "std::string");
  
      registerType(rawType, {
          name: name,
          'fromWireType': function(value) {
              var length = HEAPU32[value >> 2];
  
              var str;
              if (stdStringIsUTF8) {
                  var decodeStartPtr = value + 4;
                  // Looping here to support possible embedded '0' bytes
                  for (var i = 0; i <= length; ++i) {
                      var currentBytePtr = value + 4 + i;
                      if (i == length || HEAPU8[currentBytePtr] == 0) {
                          var maxRead = currentBytePtr - decodeStartPtr;
                          var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                          if (str === undefined) {
                              str = stringSegment;
                          } else {
                              str += String.fromCharCode(0);
                              str += stringSegment;
                          }
                          decodeStartPtr = currentBytePtr + 1;
                      }
                  }
              } else {
                  var a = new Array(length);
                  for (var i = 0; i < length; ++i) {
                      a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
                  }
                  str = a.join('');
              }
  
              _free(value);
  
              return str;
          },
          'toWireType': function(destructors, value) {
              if (value instanceof ArrayBuffer) {
                  value = new Uint8Array(value);
              }
  
              var getLength;
              var valueIsOfTypeString = (typeof value === 'string');
  
              if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                  throwBindingError('Cannot pass non-string to std::string');
              }
              if (stdStringIsUTF8 && valueIsOfTypeString) {
                  getLength = function() {return lengthBytesUTF8(value);};
              } else {
                  getLength = function() {return value.length;};
              }
  
              // assumes 4-byte alignment
              var length = getLength();
              var ptr = _malloc(4 + length + 1);
              HEAPU32[ptr >> 2] = length;
              if (stdStringIsUTF8 && valueIsOfTypeString) {
                  stringToUTF8(value, ptr + 4, length + 1);
              } else {
                  if (valueIsOfTypeString) {
                      for (var i = 0; i < length; ++i) {
                          var charCode = value.charCodeAt(i);
                          if (charCode > 255) {
                              _free(ptr);
                              throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                          }
                          HEAPU8[ptr + 4 + i] = charCode;
                      }
                  } else {
                      for (var i = 0; i < length; ++i) {
                          HEAPU8[ptr + 4 + i] = value[i];
                      }
                  }
              }
  
              if (destructors !== null) {
                  destructors.push(_free, ptr);
              }
              return ptr;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': simpleReadValueFromPointer,
          destructorFunction: function(ptr) { _free(ptr); },
      });
    }

  function __embind_register_std_wstring(rawType, charSize, name) {
      name = readLatin1String(name);
      var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
      if (charSize === 2) {
          decodeString = UTF16ToString;
          encodeString = stringToUTF16;
          lengthBytesUTF = lengthBytesUTF16;
          getHeap = function() { return HEAPU16; };
          shift = 1;
      } else if (charSize === 4) {
          decodeString = UTF32ToString;
          encodeString = stringToUTF32;
          lengthBytesUTF = lengthBytesUTF32;
          getHeap = function() { return HEAPU32; };
          shift = 2;
      }
      registerType(rawType, {
          name: name,
          'fromWireType': function(value) {
              // Code mostly taken from _embind_register_std_string fromWireType
              var length = HEAPU32[value >> 2];
              var HEAP = getHeap();
              var str;
  
              var decodeStartPtr = value + 4;
              // Looping here to support possible embedded '0' bytes
              for (var i = 0; i <= length; ++i) {
                  var currentBytePtr = value + 4 + i * charSize;
                  if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                      var maxReadBytes = currentBytePtr - decodeStartPtr;
                      var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                      if (str === undefined) {
                          str = stringSegment;
                      } else {
                          str += String.fromCharCode(0);
                          str += stringSegment;
                      }
                      decodeStartPtr = currentBytePtr + charSize;
                  }
              }
  
              _free(value);
  
              return str;
          },
          'toWireType': function(destructors, value) {
              if (!(typeof value === 'string')) {
                  throwBindingError('Cannot pass non-string to C++ string type ' + name);
              }
  
              // assumes 4-byte alignment
              var length = lengthBytesUTF(value);
              var ptr = _malloc(4 + length + charSize);
              HEAPU32[ptr >> 2] = length >> shift;
  
              encodeString(value, ptr + 4, length + charSize);
  
              if (destructors !== null) {
                  destructors.push(_free, ptr);
              }
              return ptr;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': simpleReadValueFromPointer,
          destructorFunction: function(ptr) { _free(ptr); },
      });
    }

  function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
          isVoid: true, // void return values can be optimized out sometimes
          name: name,
          'argPackAdvance': 0,
          'fromWireType': function() {
              return undefined;
          },
          'toWireType': function(destructors, o) {
              // TODO: assert if anything else is given?
              return undefined;
          },
      });
    }

  function _abort() {
      abort();
    }

  function _emscripten_asm_const_int(code, sigPtr, argbuf) {
      var args = readAsmConstArgs(sigPtr, argbuf);
      return ASM_CONSTS[code].apply(null, args);
    }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function emscripten_realloc_buffer(size) {
      try {
        // round size grow request up to wasm page size (fixed 64KB per spec)
        wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16); // .grow() takes a delta compared to the previous size
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1 /*success*/;
      } catch(e) {
      }
      // implicit 0 return to save code size (caller will cast "undefined" into 0
      // anyhow)
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      // With pthreads, races can happen (another thread might increase the size in between), so return a failure, and let the caller retry.
  
      // Memory resize rules:
      // 1. Always increase heap size to at least the requested size, rounded up to next page multiple.
      // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap geometrically: increase the heap size according to 
      //                                         MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%),
      //                                         At most overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
      // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap linearly: increase the heap size by at least MEMORY_GROWTH_LINEAR_STEP bytes.
      // 3. Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
      // 4. If we were unable to allocate as much memory, it may be due to over-eager decision to excessively reserve due to (3) above.
      //    Hence if an allocation fails, cut down on the amount of excess growth, in an attempt to succeed to perform a smaller allocation.
  
      // A limit was set for how much we can grow. We should not exceed that
      // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
      // In CAN_ADDRESS_2GB mode, stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate full 4GB Wasm memories, the size will wrap
      // back to 0 bytes in Wasm side for any code that deals with heap sizes, which would require special casing all heap size related code to treat
      // 0 specially.
      var maxHeapSize = 2147483648;
      if (requestedSize > maxHeapSize) {
        return false;
      }
  
      // Loop through potential heap size increases. If we attempt a too eager reservation that fails, cut down on the
      // attempted size and reserve a smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
        // but limit overreserving (default to capping at +96MB overgrowth at most)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296 );
  
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
  
          return true;
        }
      }
      return false;
    }

  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]) {
        // no-op
      }
      return sum;
    }
  
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];
  function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }
  function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
  
      var tm_zone = HEAP32[(((tm)+(40))>>2)];
  
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)],
        tm_gmtoff: HEAP32[(((tm)+(36))>>2)],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : ''
      };
  
      var pattern = UTF8ToString(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate time representation
        // Modified Conversion Specifiers
        '%Ec': '%c',                      // Replaced by the locale's alternative appropriate date and time representation.
        '%EC': '%C',                      // Replaced by the name of the base year (period) in the locale's alternative representation.
        '%Ex': '%m/%d/%y',                // Replaced by the locale's alternative date representation.
        '%EX': '%H:%M:%S',                // Replaced by the locale's alternative time representation.
        '%Ey': '%y',                      // Replaced by the offset from %EC (year only) in the locale's alternative representation.
        '%EY': '%Y',                      // Replaced by the full alternative year representation.
        '%Od': '%d',                      // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading zeros if there is any alternative symbol for zero; otherwise, with leading <space> characters.
        '%Oe': '%e',                      // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading <space> characters.
        '%OH': '%H',                      // Replaced by the hour (24-hour clock) using the locale's alternative numeric symbols.
        '%OI': '%I',                      // Replaced by the hour (12-hour clock) using the locale's alternative numeric symbols.
        '%Om': '%m',                      // Replaced by the month using the locale's alternative numeric symbols.
        '%OM': '%M',                      // Replaced by the minutes using the locale's alternative numeric symbols.
        '%OS': '%S',                      // Replaced by the seconds using the locale's alternative numeric symbols.
        '%Ou': '%u',                      // Replaced by the weekday as a number in the locale's alternative representation (Monday=1).
        '%OU': '%U',                      // Replaced by the week number of the year (Sunday as the first day of the week, rules corresponding to %U ) using the locale's alternative numeric symbols.
        '%OV': '%V',                      // Replaced by the week number of the year (Monday as the first day of the week, rules corresponding to %V ) using the locale's alternative numeric symbols.
        '%Ow': '%w',                      // Replaced by the number of the weekday (Sunday=0) using the locale's alternative numeric symbols.
        '%OW': '%W',                      // Replaced by the week number of the year (Monday as the first day of the week) using the locale's alternative numeric symbols.
        '%Oy': '%y',                      // Replaced by the year (offset from %C ) using the locale's alternative numeric symbols.
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      }
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      }
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        }
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      }
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      }
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else {
            return thisDate.getFullYear()-1;
          }
      }
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls((year/100)|0,2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year.
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes
          // January 4th, which is also the week that includes the first Thursday of the year, and
          // is also the first week that contains at least four days in the year.
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of
          // the last week of the preceding year; thus, for Saturday 2nd January 1999,
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th,
          // or 31st is a Monday, it and any following days are part of week 1 of the following year.
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
  
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          var twelveHour = date.tm_hour;
          if (twelveHour == 0) twelveHour = 12;
          else if (twelveHour > 12) twelveHour -= 12;
          return leadingNulls(twelveHour, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour >= 0 && date.tm_hour < 12) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          return date.tm_wday || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53].
          // The first Sunday of January is the first day of week 1;
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week)
          // as a decimal number [01,53]. If the week containing 1 January has four
          // or more days in the new year, then it is considered week 1.
          // Otherwise, it is the last week of the previous year, and the next week is week 1.
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          }
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          return date.tm_wday;
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53].
          // The first Monday of January is the first day of week 1;
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ).
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich).
          var off = date.tm_gmtoff;
          var ahead = off >= 0;
          off = Math.abs(off) / 60;
          // convert from minutes into hhmm format (which means 60 minutes = 100 units)
          off = (off / 60)*100 + (off % 60);
          return (ahead ? '+' : '-') + String("0000" + off).slice(-4);
        },
        '%Z': function(date) {
          return date.tm_zone;
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      }
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }

  function _time(ptr) {
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)] = ret;
      }
      return ret;
    }

  var readAsmConstArgsArray=[];
  function readAsmConstArgs(sigPtr, buf) {
      readAsmConstArgsArray.length = 0;
      var ch;
      // Most arguments are i32s, so shift the buffer pointer so it is a plain
      // index into HEAP32.
      buf >>= 2;
      while (ch = HEAPU8[sigPtr++]) {
        // A double takes two 32-bit slots, and must also be aligned - the backend
        // will emit padding to avoid that.
        var double = ch < 105;
        if (double && (buf & 1)) buf++;
        readAsmConstArgsArray.push(double ? HEAPF64[buf++ >> 1] : HEAP32[buf]);
        ++buf;
      }
      return readAsmConstArgsArray;
    }
embind_init_charCodes();
BindingError = Module['BindingError'] = extendError(Error, 'BindingError');;
InternalError = Module['InternalError'] = extendError(Error, 'InternalError');;
init_emval();;
var ASSERTIONS = false;



/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE === 'boolean' && ENVIRONMENT_IS_NODE) {
    var buf;
    try {
      // TODO: Update Node.js externs, Closure does not recognize the following Buffer.from()
      /**@suppress{checkTypes}*/
      buf = Buffer.from(s, 'base64');
    } catch (_) {
      buf = new Buffer(s, 'base64');
    }
    return new Uint8Array(buf['buffer'], buf['byteOffset'], buf['byteLength']);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


var asmLibraryArg = {
  "__cxa_atexit": ___cxa_atexit,
  "__gmtime_r": ___gmtime_r,
  "__localtime_r": ___localtime_r,
  "_embind_register_bool": __embind_register_bool,
  "_embind_register_emval": __embind_register_emval,
  "_embind_register_float": __embind_register_float,
  "_embind_register_integer": __embind_register_integer,
  "_embind_register_memory_view": __embind_register_memory_view,
  "_embind_register_std_string": __embind_register_std_string,
  "_embind_register_std_wstring": __embind_register_std_wstring,
  "_embind_register_void": __embind_register_void,
  "abort": _abort,
  "emscripten_asm_const_int": _emscripten_asm_const_int,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "strftime": _strftime,
  "time": _time
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = asm["__wasm_call_ctors"]

/** @type {function(...*):?} */
var _free = Module["_free"] = asm["free"]

/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = asm["malloc"]

/** @type {function(...*):?} */
var _createModule = Module["_createModule"] = asm["createModule"]

/** @type {function(...*):?} */
var __ZN3WAM9Processor4initEjjPv = Module["__ZN3WAM9Processor4initEjjPv"] = asm["_ZN3WAM9Processor4initEjjPv"]

/** @type {function(...*):?} */
var _wam_init = Module["_wam_init"] = asm["wam_init"]

/** @type {function(...*):?} */
var _wam_terminate = Module["_wam_terminate"] = asm["wam_terminate"]

/** @type {function(...*):?} */
var _wam_resize = Module["_wam_resize"] = asm["wam_resize"]

/** @type {function(...*):?} */
var _wam_onparam = Module["_wam_onparam"] = asm["wam_onparam"]

/** @type {function(...*):?} */
var _wam_onmidi = Module["_wam_onmidi"] = asm["wam_onmidi"]

/** @type {function(...*):?} */
var _wam_onsysex = Module["_wam_onsysex"] = asm["wam_onsysex"]

/** @type {function(...*):?} */
var _wam_onprocess = Module["_wam_onprocess"] = asm["wam_onprocess"]

/** @type {function(...*):?} */
var _wam_onpatch = Module["_wam_onpatch"] = asm["wam_onpatch"]

/** @type {function(...*):?} */
var _wam_onmessageN = Module["_wam_onmessageN"] = asm["wam_onmessageN"]

/** @type {function(...*):?} */
var _wam_onmessageS = Module["_wam_onmessageS"] = asm["wam_onmessageS"]

/** @type {function(...*):?} */
var _wam_onmessageA = Module["_wam_onmessageA"] = asm["wam_onmessageA"]

/** @type {function(...*):?} */
var ___getTypeName = Module["___getTypeName"] = asm["__getTypeName"]

/** @type {function(...*):?} */
var ___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = asm["__embind_register_native_and_builtin_types"]

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = asm["__errno_location"]

/** @type {function(...*):?} */
var __get_tzname = Module["__get_tzname"] = asm["_get_tzname"]

/** @type {function(...*):?} */
var __get_daylight = Module["__get_daylight"] = asm["_get_daylight"]

/** @type {function(...*):?} */
var __get_timezone = Module["__get_timezone"] = asm["_get_timezone"]

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = asm["stackSave"]

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = asm["stackRestore"]

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = asm["stackAlloc"]





// === Auto-generated postamble setup entry stuff ===

Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
Module["setValue"] = setValue;
Module["UTF8ToString"] = UTF8ToString;

var calledRun;

/**
 * @constructor
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
}
Module['run'] = run;

/** @param {boolean|number=} implicit */
function exit(status, implicit) {
  EXITSTATUS = status;

  // if this is just main exit-ing implicitly, and the status is 0, then we
  // don't need to do anything here and can just leave. if the status is
  // non-zero, though, then we need to report it.
  // (we may have warned about this earlier, if a situation justifies doing so)
  if (implicit && keepRuntimeAlive() && status === 0) {
    return;
  }

  if (keepRuntimeAlive()) {
  } else {

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);

    ABORT = true;
  }

  quit_(status, new ExitStatus(status));
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

run();





