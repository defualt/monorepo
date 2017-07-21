console.log('APP.js');
import mymodule from './public/js/mymodule';
import express from 'express';
import ejs from 'ejs';
import path from 'path';
import url from 'url';
import fs from 'fs';
import { x as mongooseStuff } from './js/mongooseStuff';
import endpointCompositeImage from './js/endpointCompositeImage';
import endpointGetNormalizedImageInfo from './js/endpointGetNormalizedImageInfo';
import endpointGetS3SignedUploadUrl from './js/endpointGetS3SignedUploadUrl';
import endpointIframeUpload from './js/endpointIframeUpload';
import generateUrlRegexNamespace from './js/generateUrlRegexNamespace';
import ensureLeadingSlash from '@defualt/ensure-leading-slash';
// var mymodule = require('./public/js/mymodule');
// var express = require('express');
// var ejs = require('ejs');
// var path = require('path');
// var url = require('url');
// var mongooseStuff = require('./js/mongooseStuff').x;
// var endpointCompositeImage = require('./js/endpointCompositeImage');

// var endpointGetNormalizedImageInfo = require('./js/endpointGetNormalizedImageInfo');

// var endpointGetS3SignedUploadUrl = require('./js/endpointGetS3SignedUploadUrl');

// var endpointIframeUpload = require('./js/endpointIframeUpload');
// var fs = require('fs');

/*
 * Set-up the Express app.
 */

export default ({app, port = 3000, nameSpace = ''}) => {
  console.log("SERVING BERNIE BACKEND");
  // This module either extends an existing express app
  // or creates a new express app
  let appIsBrandNew = false;
  if (!app) {
    appIsBrandNew = true;
    app = express();
  }

  app.set('views', __dirname + '/views');
  app.engine('html', ejs.renderFile);

  app.use(express.static(path.join(__dirname, 'public')));

  /*
   * Load the S3 information from the environment variables.
   */
  var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
  var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
  var S3_BUCKET = process.env.S3_BUCKET

  //===========================
  //HTML PAGES
  //____________________________

  app.get(ensureLeadingSlash(`${nameSpace}/privacy`), function(req, res){
      res.render('privacy.html',{
          pageName:'privacy',
          urlInfo:mymodule.deriveUrlInfo({nameSpace}),
          userTemplates:userTemplates
      });
  });

  app.get(ensureLeadingSlash(`${nameSpace}/terms`), function(req, res){
      res.render('terms.html',{
          pageName:'terms',
          urlInfo:mymodule.deriveUrlInfo({nameSpace}),
          userTemplates:userTemplates
      });
  });

  app.get(ensureLeadingSlash(`${nameSpace}/iframeuploadbutton`), function(req, res){
      res.render('iframeuploadbutton.html',{
          pageName:'iframeuploadbutton',
          urlInfo:null,
          buttonText:req.query.buttonText
      });
  });



  var standardRouteHtmlHandler = function(req, res){
    var urlToUse = req.url;  
    urlToUse = url.parse(urlToUse).pathname === '/' ? null : urlToUse;
    var offline = typeof req.query.offline !== 'undefined';
    var iframebutton = typeof req.query.iframebutton !== 'undefined';
    var urlInfo = mymodule.deriveUrlInfo({pathname: urlToUse,offline,nameSpace});
    
    mongooseStuff.UpdateComplexImage(urlInfo).then(function(result){});

    res.render('redesign'+'.html',{
        userTemplates:userTemplates,
        req:req,
        urlInfo:urlInfo,
        mymodule:mymodule,
        offline:offline,
        iframebutton:iframebutton
        // pretty:stringify(req, null, 2)
    });
  };
  app.get(mymodule.getStandardModesRegex(nameSpace), standardRouteHtmlHandler);

  app.get(ensureLeadingSlash(`${nameSpace}/`), standardRouteHtmlHandler);

  app.get(ensureLeadingSlash(`${nameSpace}/redesign`), standardRouteHtmlHandler);



  app.get(ensureLeadingSlash(`${nameSpace}/list`), function(req, res){
      var offline = typeof req.query.offline !== 'undefined';
      mongooseStuff.GetComplexImageAll().then(function(images){
      // mongooseStuff.getImages().then(function(images){
        res.render('list.html', { 
            images:images,
            offline:offline
        });
      });
  });


  var userTemplates = []; 
  //===========================
  //ENDPOINTS
  //____________________________

  endpointCompositeImage({
    app:app,
    accessKeyId:AWS_ACCESS_KEY,
    secretAccessKey:AWS_SECRET_KEY,
    Bucket: S3_BUCKET,
    urlPattern: generateUrlRegexNamespace('image\/')
  });

  endpointGetNormalizedImageInfo({
    app:app,
    accessKeyId:AWS_ACCESS_KEY,
    secretAccessKey:AWS_SECRET_KEY,
    Bucket: S3_BUCKET,
    userTemplates:userTemplates,
    urlPattern: ensureLeadingSlash(`${nameSpace}/get_normalized_image_info`)
  });
  endpointGetS3SignedUploadUrl({
    app:app,
    accessKeyId:AWS_ACCESS_KEY,
    secretAccessKey:AWS_SECRET_KEY,
    Bucket: S3_BUCKET,
    urlPattern: ensureLeadingSlash(`${nameSpace}/get_s3_signed_upload_url`)
  });

  endpointIframeUpload({
    app:app,
    accessKeyId:AWS_ACCESS_KEY,
    secretAccessKey:AWS_SECRET_KEY,
    Bucket: S3_BUCKET,
    urlPattern: ensureLeadingSlash(`${nameSpace}/uploadsimple`)
  });




  // require('./js/passportStuff')({
  //   app:app
  // });
  // app.listen(3000);










  app.post(ensureLeadingSlash(`${nameSpace}/SimpleImage`),function(req, res){
    var data = req.body;
    mongooseStuff.simpleimage(data.url, data.idX).then(function() {
      res.send({
          status:"success"
      })
    })
  })

  app.post(ensureLeadingSlash(`${nameSpace}/ComplexImage`), function(req, res){
      var data = req.body;

      mongooseStuff.ComplexImage(data).then(function(result){
        res.send({
            status:"success",
            result:result,
            payload:data
        })
      });
  });

  app.post(ensureLeadingSlash(`${nameSpace}/GetComplexImage`), function(req, res){
      var data = req.body.data;
      mongooseStuff.GetComplexImage('asdf').then(function(result){
        res.send({
            status:"success",
            result:result
        })
      });
  });

  app.post(ensureLeadingSlash(`${nameSpace}/UpdateComplexImage`), function(req, res){
      var data = req.body;
      mongooseStuff.UpdateComplexImage(data).then(function(result){
        res.send({
            status:"success",
            result:result
        })
      });
  });




  // GetComplexImage
  // mongooseStuff.ComplexImage({url:'asdf'}).always(function(arguments){
  //    console.log('ComplexImage',arguments)
  //  })

  // mongooseStuff.GetComplexImageAll().always(function(arguments){
  //   console.log('ComplexImage',arguments)
  // })
   
  mongooseStuff.GetUserTemplatesAll().always(function(data){
    // console.log('GetUserTemplatesAll',data);
    userTemplates = data;
    // console.log('userTemplates',userTemplates)
  })

  if (appIsBrandNew) {
    app.listen(port, (error) => {
      if (error) {
        console.error(error);
      } else {
        console.info(
          '🌎 Listening on port %s. Open up http://localhost:%s/ in your browser.',
          port,
          port,
        );
      }
    });
  }

  return app;
};
