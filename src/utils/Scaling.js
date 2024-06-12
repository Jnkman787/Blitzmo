import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window')

// Guideline sizes are based on standard iphone screen dimensions
const guidelineBaseWidth = 375
const guidelineBaseHeight = 812
//const screenSize = Math.sqrt(width * height) / 100;

// S20 screen size is:
//const guidelineBaseWidth = 360
//const guidelineBaseHeight = 726

const scale = size => (width / guidelineBaseWidth) * size
const verticalScale = size => (height / guidelineBaseHeight) * size
const moderateScale = (size, factor = 0.5) => 
  size + (scale(size) - size) * factor

export { width, height, scale, verticalScale, moderateScale }