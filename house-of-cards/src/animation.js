var easingFunctions = {
  linear: function (t) {return t;},
  easeIn: function (t) {return t*t;},
  easeOut: function (t) {return t*(2-t);},
  easeInOut: function (t) {return t<0.5 ? 2*t*t : -1+(4-2*t)*t;},
};

var animations = {},
    __animationId = 0;

var transformPropList = {rotateX:true,rotateY:true,rotateZ:true,translateX:true,translateY:true,translateZ:true};

function addAnimation(node, {props, durationMillis, delay, easingName}) {
  var normalProps = {},
      transformProps = {},
      id = __animationId++;

  node.cachedProps = node.cachedProps || {};

  for (var prop in props) {
    if (transformPropList[prop]) {
      var val = node.cachedProps[prop] || 0;
      transformProps[prop] = {
        start: val,
        diff: props[prop].target - val,
        unit: props[prop].unit
      };
    }
    else {
      var val = node.cachedProps[prop] || parseInt(computedNodeStyle.getPropertyValue(prop),10)||0;
      normalProps[prop] = {
        start: val,
        diff: props[prop].target - val,
        unit: props[prop].unit
      };
    }
  }

  animations[id] = {
    id,
    node,
    start: performance.now()+(delay||0),
    normalProps,
    transformProps,
    durationMillis,
    easingFn: easingFunctions[easingName] || easingFunctions['easeInOut']
  };
}

function onAnimation(timestamp) {
  for (var aId in animations) {
    var a = animations[aId];
    var progress = Math.min((timestamp-a.start)/a.durationMillis,1);
    if (progress < 0) continue;

    var easedProgress = a.easingFn(progress);

    for (var propName in a.normalProps) {
      var prop = a.normalProps[propName];
      var newVal = prop.start+prop.diff*easedProgress;
      a.node.style[propName] = newVal + (prop.unit||'');
      a.node.cachedProps[propName] = newVal;
    }

    var transforms = [];
    for (var propName in a.transformProps) {
      var prop = a.transformProps[propName];
      var newVal = prop.start+prop.diff*easedProgress;
      transforms.push(propName + '(' + newVal + (prop.unit||'') + ')');
      a.node.cachedProps[propName] = newVal;
    }
    if (transforms.length) a.node.style.transform = transforms.join(" ");

    if (progress==1) delete animations[aId];
  }
  window.requestAnimationFrame(onAnimation);
}
window.requestAnimationFrame(onAnimation)

module.exports = {
  addAnimation
}