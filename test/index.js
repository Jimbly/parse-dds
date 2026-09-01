var parse = require('../')
var test = require('tape')
var toArrayBuffer = require('buffer-to-arraybuffer')

var path = require('path')
var fs = require('fs')

function dxtSize(shape, bpp) {
  var w = (shape[0] + 3) & ~3
  var h = (shape[1] + 3) & ~3
  return w * h * bpp
}

function checkLevel(t, format, image) {
  t.deepEqual(image.length, dxtSize(image.shape, format === 'dxt1' ? 0.5 : 1), 'data size matches block size')
}

function checkLevels(t, result) {
  for (var ii = 0; ii < result.images.length; ++ii) {
    checkLevel(t, result.format, result.images[ii])
  }
}

test('should parse DDS headers', function (t) {
  var data = fs.readFileSync(path.join(__dirname, 'fixtures', 'test-dxt1.dds'))
  var array = toArrayBuffer(data)
  var result = parse(array)
  t.deepEqual(result.shape, [ 512, 512 ], 'size is correct')
  t.deepEqual(result.format, 'dxt1', 'internal format')
  t.deepEqual(typeof result.flags, 'number', 'exports some flags')
  t.deepEqual(result.images[0], { length: 131072, offset: 128, shape: [ 512, 512 ] }, 'mipmap level 0')
  t.deepEqual(result.images[1], { length: 131072 / 4, offset: 128 + 131072, shape: [ 256, 256 ] }, 'mipmap level 1')
  checkLevels(t, result);
  t.end()
})

test('should parse DDS headers', function (t) {
  var data = fs.readFileSync(path.join(__dirname, 'fixtures', 'test-dxt5.dds'))
  var array = toArrayBuffer(data)
  var result = parse(array)
  t.deepEqual(result.shape, [ 512, 512 ], 'size is correct')
  t.deepEqual(result.format, 'dxt5', 'internal format')
  t.deepEqual(typeof result.flags, 'number', 'exports some flags')
  t.deepEqual(result.images[0].shape, [ 512, 512 ])
  t.deepEqual(result.images[1].shape, [ 256, 256 ])
  t.deepEqual(result.images[2].shape, [ 128, 128 ])
  t.deepEqual(result.images[3].shape, [ 64, 64 ])
  t.end()
})

test('should parse DDS headers', function (t) {
  var data = fs.readFileSync(path.join(__dirname, 'fixtures', 'test-cube-dx10-rgba32f.dds'))
  var array = toArrayBuffer(data)
  var result = parse(array)
  var numMipmaps = 8 // log2(128)
  t.deepEqual(result.shape, [ 128, 128 ], 'size is correct')
  t.deepEqual(result.format, 'rgba32f', 'internal format is correct')
  t.deepEqual(result.images.length, 6 * numMipmaps, 'num mipmaps is correct')
  t.deepEqual(result.images[0].shape, [ 128, 128 ])
  t.deepEqual(result.images[1].shape, [ 64, 64 ])
  t.deepEqual(result.images[2].shape, [ 32, 32 ])
  t.deepEqual(result.images[3].shape, [ 16, 16 ])
  t.deepEqual(result.images[7].shape, [ 1, 1 ])
  t.deepEqual(result.images[8].shape, [ 128, 128 ])
  t.end()
})

test('should handle non-multiple-of-4', function (t) {
  var data = fs.readFileSync(path.join(__dirname, 'fixtures', 'test-7x3-dxt1.dds'))
  var array = toArrayBuffer(data)
  var result = parse(array)
  t.deepEqual(result.shape, [ 7, 3 ], 'size is correct')
  t.deepEqual(result.format, 'dxt1', 'internal format')
  t.deepEqual(typeof result.flags, 'number', 'exports some flags')
  t.deepEqual(result.images.length, 1);
  t.deepEqual(result.images[0].shape, [ 7, 3 ])
  checkLevels(t, result)
  t.end()
})
