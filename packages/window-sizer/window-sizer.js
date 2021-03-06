import root from 'window-or-global'
import debounce from 'debounce';
import vanilla from '@defualt/vanilla';

const { getWinWidth, getWinHeight } = vanilla;

let resizing = false;
function isResizing() {
  return resizing;
}

const dimensions = {
  height: getWinHeight(),
  width: getWinWidth(),
};

// const isTouchDevice = 'ontouchstart' in document.documentElement;
// const danger_of_url_bar_disappearing_and_thus_window_height_will_change = isTouchDevice;
const heightTweak = root.document && root.document.documentElement && 'ontouchstart' in root.document.documentElement ? 80  : 0;
export { heightTweak };

const resizeDeb = debounce(300,null);
let cbs = [];
function removeCb(fun) {
  cbs = cbs.filter((cb) => {
    return cb !== fun;
  });
}
function addCb(fun) {
  cbs.push(fun);
  return () => {
    removeCb(fun);
  }
}
root.addEventListener && root.addEventListener('resize', () => {
  resizing = true;
  const lastDimensions = {
    ...dimensions,
  };
  Object.assign(dimensions, {
    height: getWinHeight(),
    width: getWinWidth(),
  });
  // scrolling triggers resize on some mobile browsers (minimizing url when not scrolled to top)
  // don't refresh under these conditions
  const newWindowHeight = dimensions.height - heightTweak;
  const newWindowWidth = dimensions;
  const threshTest = Math.abs((lastDimensions.height - heightTweak) - newWindowHeight) > 80;
  if(threshTest || lastDimensions.width !== newWindowWidth){
    resizeDeb().then(() => {
      resizing = false;
      cbs.forEach((cb) => {
        cb();
      });
    })
  }
}, false);

export default {
  cbs,
  addCb,
  removeCb,
  dimensions,
  isResizing,
};
