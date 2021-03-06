/* eslint-disable no-console */
/* eslint-disable no-alert */
import root from 'window-or-global'
import deferred from './deferred';
import { appConnect } from './nameSpacedResponsive';
import ancestorConstantsHoc from './ancestorConstantsHoc';

// window.FB is initially undefined, because lazy-loaded facebook SDK defines FB.
// So references to FB are via this getter.
function FB() {
  return root.FB;
}

const offline = false;
const bs = {
  loader: {
    load: () => {},
    unload: () => {},
  },
  util: {
    getPageUrl: () => {
      console.warn('getPageUrl WTF');
      return '';
    },
  },
};

function loadSdk() {
  const d = root.document;
  if (d) {
    const s = 'script';
    const id = 'facebook-jssdk';
    const fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    const js = d.createElement(s) || {};
    js.id = id;
    js.src = '//connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  }
}

function asyncInit() {
  return new Promise((resolve /* , reject*/) => {
    if (!offline) {
      root.fbAsyncInit = () => {
        FB().init({
          appId: '1633460223596071',
          cookie: true, // enable cookies to allow the server to access
          // the session
          xfbml: true, // parse social plugins on this page
          version: 'v2.10', // use version 2.2
        });

        resolve();
      };
      // root.laterScripts.push(function() {
      loadSdk();
      // });
    } else {
      setTimeout(() => {
        resolve();
      }, 300);
    }
  });
}

function fbApi(...args) {
  return new Promise((resolve, reject) => {
    FB().api(...args, response => {
      if (!response || response.error) {
        reject(response);
      } else {
        resolve(response);
      }
    });
  });
}

function getMyInfo() {
  if (!offline) {
    const promise = fbApi('/me');
    // promise.then((response) => {
    //   console.log('getMyInfo', response)
    // }).catch((response) => {
    //   console.log('getMyInfo catch', response)
    // });
    return promise;
  }
  return new Promise((resolve /* , reject*/) => {
    setTimeout(() => {
      resolve({});
    }, 500);
  });
}

function getPhotos(response) {
  if (!offline) {
    return fbApi(`/${response.id}/photos`, 'get', {
      fields: 'images,id',
      type: 'uploaded', // tagged,uploaded
      limit: 2,
      order: 'reverse_chronological',
    });
  }
  return new Promise((resolve /* , reject*/) => {
    const fakeData = [];
    for (let i = 1, l = 6; i < l; i++) {
      fakeData.push({
        images: [{ source: `/images/mock-fb-image${i}.jpg` }],
      });
    }
    setTimeout(() => {
      resolve({
        data: fakeData,
      });
    }, 500);
  });
}

function login() {
  return new Promise((resolve, reject) => {
    if (!offline) {
      FB().login(
        (response, ...args) => {
          if (response.status === 'connected') {
            resolve(response, ...args);
          } else {
            reject(response, ...args);
          }
        },
        {
          scope: 'public_profile,email,user_photos,publish_actions',
        }
      );
    } else {
      resolve();
    }
  });
}

function statusChangeCallback(response) {
  const self = this;
  return new Promise((resolve, reject) => {
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      resolve(response);
    } else if (!self.attemptedAuth) {
      self.attemptedAuth = true;
      FB().login(
        response => {
          if (response.status === 'connected') {
            console.log('fb connected');
            resolve(response);
          } else {
            console.log('fb not connected');
            reject(response);
          }
        },
        {
          scope: 'public_profile,email,user_photos,publish_actions',
        }
      );
    } else {
      reject(response);
    }
  });
}

class FbManager {
  constructor() {
    this.attemptedAuth = false;
    this.urlToExport = null;
    this.asyncInitPromise = asyncInit();
  }
  fbGetLoginStatus(dfd) {
    // return new Promise((resolve, reject) => {
    dfd = !!dfd && !!dfd.then ? dfd : new deferred();
    const self = this;
    FB().getLoginStatus(response => {
      statusChangeCallback(response)
        .then(() => {
          dfd.resolve();
        })
        .fail(response => {
          if (response.status === 'not_authorized') {
            // The person is logged into Facebook, but not your app.
            // document.getElementById('status').innerHTML = 'Please log into this app.';
            console.log('Please log into this app.');
            if (!self.attemptedAuth) {
              self.fbGetLoginStatus(dfd);
            } else {
              dfd.reject(response);
            }
          } else {
            // The person is not logged into Facebook, so we're not sure if
            // they are logged into this app or not.
            // document.getElementById('status').innerHTML = 'Please log into Facebook.';
            console.log('Please log into Facebook.');
            dfd.reject(response);
          }
        });
    });
    return dfd.promise;
  }
  importStuff() {
    bs.loader.load();
    this.attemptedAuth = false;
    return this.asyncInitPromise.then(login).then(getMyInfo).then(getPhotos);
    // .always(function() {
    //   bs.loader.unload();
    // })
  }
  postToWall(url) {
    bs.loader.load();
    return this.asyncInitPromise
      .then(() => {
        return new Promise((resolve, reject) => {
          FB().ui(
            {
              method: 'share',
              href: url,
            },
            (response) => {
              if (response && !response.error_message) {
                resolve();
              } else {
                reject();
              }              
            }
          );
        });
      })
      // .always(() => {
      //   bs.loader.unload();
      // });
  }
  exportStuff(url) {
    bs.loader.load();
    this.attemptedAuth = false;
    return (
      this.asyncInitPromise
        .then(login)
        .then(getMyInfo)
        .then(this.uploadPhoto(url))
        // .fail(statusChangeCallback)
        // .then(getMyInfo)
        // .then(this.uploadPhoto)
        // .then((x) => {
        //   console.log('SUCCESS',x)
        //   return x;
        // })
        // .catch((x) => {
        //   console.log('ERROR',x)
        //   alert('sorry, that did not work');
        // })
        // .always(() => {
        //   this.urlToExport = null;
        //   bs.loader.unload();
        // })
    );
  }
  uploadPhoto(url) {
    return (response) => {
      return fbApi(`/${response.id}/photos`, 'post', {
        url: url.replace('localhost.bernieselfie.com:3000','www.bernieselfie.com'),
      });
    };
  }
}

const fbManager = new FbManager();
export default fbManager;

const imagesFromFBPromises = {};
export function makeActionFetchPhotos(ownProps) {
  return (dispatch, getState, {client}) => {
    const imagesFromFBPromise =
      imagesFromFBPromises[ownProps.constants.appNameSpace] ||
      fbManager.importStuff();
    imagesFromFBPromises[ownProps.constants.appNameSpace] = imagesFromFBPromise;
    return imagesFromFBPromise.then(response => {
      if (response && response.data && response.data.length) {
        const images = response.data.reduce((accum, imageObj) => {
          if (
            imageObj &&
            imageObj.images &&
            imageObj.images[0] &&
            imageObj.images[0].source
          ) {
            return [
              ...accum,
              {
                src: imageObj.images[0].source,
              },
            ];
          }
          return accum;
        }, []);
        dispatch({
          type: 'FETCH_FACEBOOK_PHOTOS',
          images,
        });
      }
    });
  };
}


let attemptId = 0;
export function fetchFacebookPhotosHoc(Comp) {
  return ancestorConstantsHoc(
    appConnect(
      (appState) => {
        return {
          images: appState.facebookPhotos,
        };
      },
      {
        fetchFacebookPhotos: (ownProps,...args) => {
          return (dispatch  , getState) => {
            const currentAttamptId = attemptId++;
            dispatch({
              type: 'LOADING',
              where: `fetchFacebookPhotos_${currentAttamptId}`
            })
            const imagesFromFBPromise = imagesFromFBPromises[ownProps.constants.appNameSpace] || fbManager.importStuff();
            imagesFromFBPromises[ownProps.constants.appNameSpace] = imagesFromFBPromise;
            setTimeout(() => {
              return imagesFromFBPromise.then(response => {
                if (getState().loading === `fetchFacebookPhotos_${currentAttamptId}` && response && response.data && response.data.length) {
                  const images = response.data.reduce((accum, imageObj) => {
                    if (
                      imageObj &&
                      imageObj.images &&
                      imageObj.images[0] &&
                      imageObj.images[0].source
                    ) {
                      return [
                        ...accum,
                        {
                          src: imageObj.images[0].source,
                        },
                      ];
                    }
                    return accum;
                  }, []);
                  dispatch({
                    type: 'FETCH_FACEBOOK_PHOTOS',
                    images,
                  });
                  dispatch({
                    type: 'STOP_LOADING',
                    where: `fetchFacebookPhotos_${currentAttamptId}`,
                  });
                }
              });
            },2000);
          };
        },
      },
      // (stateProps, dispatchProps, ownProps) => {
      //   console.log('stateProps, dispatchProps, ownProps',stateProps, dispatchProps, ownProps)
      //   return Object.assign({}, ownProps, stateProps, dispatchProps);
      // }
    )(Comp)
  );
}


const postToWall = fbManager.postToWall.bind(fbManager);
const exportStuff = fbManager.exportStuff.bind(fbManager);
export {postToWall,exportStuff}
