import { combineReducers } from 'redux';
import { standardModesRegexArrayString } from './deriveUrlInfo';
import {
  BernieHomeLayoutWithUploadCallback, ImagePickerFacebookWithOnClick,
  ImagePickerTemplateWithOnClick,CropperWithFgBgCompletion,Dynamic
} from './routingComponents';
import {
  buttonGroupComponentsRegexArrayString,
} from './buttonGroups';
import { paramsIntoCompositeImage, furtherRefineCompositeImageData } from './compositeImage';


const nameSpace = '/bernie';

const geoPathFrag =
      ':fgX([^/|^_]*)_:fgY([^/|^_]*)_:fgW([^/|^_]*)_:fgH([^/|^_]*)_:bgW([^/|^_]*)_:bgH([^/]*)';

const routeModes = [
  {
    key: 'H3LIKE',
    urlStart: `${nameSpace}/:fgSrcKey(${standardModesRegexArrayString})/:bgSrcKey/${geoPathFrag}`,
    match:(payload) => {
      return payload.fgSrcKey.match(new RegExp(`^(${standardModesRegexArrayString})$`));
    },
  },
  {
    key: 'UT',
    urlStart: `${nameSpace}/ut/:bgSrcKey/${geoPathFrag}/:fgSrcKey`,
    match:(payload) => {
      return payload.fgSrcKey;
    },
  },
  {
    key: 'BASE',
    urlStart: nameSpace,
    match:() => {
      return true;
    },
  },  
];

function payloadRefineAction({type, payload}){
  let found = false;
  let i = 0;
  while(!found) {
    const homeLayoutObject = routeModes[i++];
    if (homeLayoutObject.match(payload)) {
      found = `${type}_${homeLayoutObject.key}`;
    }
  }
  return {
    type: found,
    payload
  };
}

const routes = [
  {
    action: 'BERNIE_HOME',
    urlEnd: '',
    component: BernieHomeLayoutWithUploadCallback,
  },
  {
    action: 'BERNIE_IMPORT_FACEBOOK',
    urlEnd: 'import-photo-from-facebook',
    component: ImagePickerFacebookWithOnClick,
  },
  {
    action: 'BERNIE_SELECT_TEMPLATE',
    urlEnd: 'select-template',
    component: ImagePickerTemplateWithOnClick,
  },
  {
    action: 'BERNIE_CROP',
    urlEnd: 'crop',
    component: CropperWithFgBgCompletion,
  },
  {
    action: 'BERNIE_DYNAMIC',
    urlEnd: `:bernieDynamicScreen(${buttonGroupComponentsRegexArrayString})`,
    component: Dynamic,
  },
];

const bernieRoutesMap = {}; 
const bernieScreenNameMap = {}
const bernieScreenComponentMap = {};
routeModes.forEach((homeLayoutPath) => {
  const key = homeLayoutPath.key;
  const urlStart = homeLayoutPath.urlStart;
  // const urlStart = routeModes[key];
  routes.forEach((route) => {
    let urlEnd = route.urlEnd;
    urlEnd = urlEnd ? `/${urlEnd}` : ''
    const path = `${urlStart}${urlEnd}`;
    const routesMapKey = `${route.action}_${key}`
    bernieRoutesMap[routesMapKey] = path;
    bernieScreenNameMap[routesMapKey] = route.action;
    bernieScreenComponentMap[route.action] = route.component;
  });
});

const bernieReducers = combineReducers({
  compositeImageData: (state = {}, action) => {
    if(bernieRoutesMap[action.type]) {
      const newCompositeImageData = paramsIntoCompositeImage(action.payload);
      const compositeImageData = furtherRefineCompositeImageData(state, newCompositeImageData, '/bernie');
      return compositeImageData;
    }
    switch (action.type) {
      case 'SET_COMPOSITE_IMAGE_DATA':
        return {
          ...action.compositeImageData      
        };
      default:
        return state;
    }
  },
  bernieScreen: (state = 'BERNIE_HOME', action) => {
    if(bernieRoutesMap[action.type]) {
      return bernieScreenNameMap[action.type];
    }
    return state;
  },
});
export {nameSpace,bernieScreenComponentMap,payloadRefineAction,bernieReducers,bernieRoutesMap};
