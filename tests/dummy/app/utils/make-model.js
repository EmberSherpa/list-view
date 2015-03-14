import images from './images';

export default function makeModel(count = 10000, imageArrayName = 'images') {
  var imagesArray = images[imageArrayName];
  return function model() {
    var result = [];
    for (var i = 0; i < count; i++) {
      result.push({
        name: `${imageArrayName.dasherize()} ${i+1}`,
        imageSrc: imagesArray[i%imagesArray.length]
      });
    }
    return result;
  };
}
