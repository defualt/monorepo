import './app.scss';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import bind_here from 'bind_here';
import { initUpload } from './s3';

var uploadizerId = 0;
class Upload extends Component {
  constructor() {
    super();
    this.state = {
    };
    this.methodsBoundHere = bind_here(this, [
      'handleChange',
    ]);
    Object.assign(this, this.methodsBoundHere);
  }
  handleChange(e) {
    console.log('asdfasdf', e.target.files);
    const file = e && e.target && e.target.files && e.target.files[0];
    console.log(file);
    /*
      lastModified
      :
      1411792088000
      lastModifiedDate
      :
      Sat Sep 27 2014 00:28:08 GMT-0400 (EDT)
      name
      :
      "dude-with-hat.JPG"
      size
      :
      783464
      type
      :
      "image/jpeg"
      webkitRelativePath
      :
      ""
    */
    // e.target.value ----- C:\fakepath\dude-with-hat.JPG
    this.props.onSuccess();
    return;
    bs.loader.load();
    var myAjax;
    if(!offline){
        myAjax = initUpload(self.$input,self.folder,self.mustBeSquare);
        if(self.ajaxOptions.success){
            myAjax.then(this.props.onSuccess);
        }
        if(self.ajaxOptions.error){
            myAjax.catch(this.props.onError);
        }
    } else {
      myAjax = {
        then:(cb) => {
            setTimeout(() => {
                if(!!self.ajaxOptions && !!self.ajaxOptions.success){
                    this.props.onSuccess();
                }
                cb();
            },1000);
        },
        catch:(cb) => { cb(); }
      };
    }
    myAjax.then(function(){
        bs.loader.unload();
    });
    myAjax.catch(function(){
        bs.loader.unload();
    });
  }
  handleChangeFallback(e) {
    var self = this;
    this.$iframe.on('load',function(){
        var lastData = self.$iframe.contents().find(".lastData").html();
        lastData = !!lastData ? JSON.parse(lastData) : null;
        if(!!lastData){
            !!self.ajaxOptions.success ? self.ajaxOptions.success(lastData) : null;
        }
    })
  }
  render() {
    const id = 'uploadizerId_' + (uploadizerId++);
    console.log('zcxvzxcvzxcv1')
    if (window.FormData) {
      console.log('zcxvzxcvzxcv')
      return (
        <form>
          <input id={id} className="fileInput" type="file" name="someInputUploadName" onChange={this.handleChange} />
          <label htmlFor={id}>{this.props.children}</label>
        </form>
      );
    }
    // fallback
    return (<div>asdf</div>);
    // return (
    //   <div>
    //     <div style="display:none;">{this.props.children}</div>
    //     <iframe class="uploadButtonIframe" src="/iframeuploadbutton?'+$.param({buttonText:this.text})+'" frameborder="0" allowfullscreen onLoad={}></iframe>
    //   </div>
    // );
    
  }
}
Upload.propTypes = {};
export default Upload;
/*
var makeCameraUploadizer = function($button){
    bs.uploadizer($button,{
        success:function(response){
            $homeLayout.hide();
            var formattedResponse = modalManager.formatUrlAndResponseForCropModal(response);
            generateCropModal(formattedResponse);
        }
    });
};

class

var uploadizerId = 0;
var Uploadizer = function($el,ajaxOptions,folder,mustBeSquare){
    this.mustBeSquare = mustBeSquare;
    this.id = 'uploadizerId_' + (uploadizerId++);
    this.folder = folder;
    this.$el = $el;
    this.text = $el.text();
    this.$el.html('');
    this.$form = $('<form></form>')
    this.$input = $('<input id="'+this.id+'" class="fileInput" type="file" name="someInputUploadName"/>');
    this.$label = $('<label for="'+this.id+'">'+this.text+'</label>');        
    this.$el.append(this.$form);
    this.$form.append(this.$input);
    this.$form.append(this.$label);
    this.ajaxOptions = !!ajaxOptions ? ajaxOptions : {};
    this.dfd = jQuery.Deferred();
    this.bind();
};
Uploadizer.prototype.bind = function(){
    var self = this;

    self.$input.on('change',function(e){
        bs.loader.load();
        // var formData = new FormData(self.$form[0]);
        // jQuery.each(jQuery('.upload')[0].files, function(i, file) {
        //     formData.append('file-'+i, file);
        // });
        var myAjax;
        if(!offline){
            myAjax = window.bs.s3Stuff.initUpload(self.$input,self.folder,self.mustBeSquare);
            if(self.ajaxOptions.success){
                myAjax.success(self.ajaxOptions.success);
            }
            if(self.ajaxOptions.error){
                myAjax.error(self.ajaxOptions.error);
            }
        } else {
            myAjax = {
                success:function(cb){
                    setTimeout(function(){
                        if(!!self.ajaxOptions && !!self.ajaxOptions.success){
                            self.ajaxOptions.success();
                        }
                        cb();
                    },1000);
                },
                error:function(){}
            };
        }
        myAjax.success(function(){
            bs.loader.unload();
        });
        myAjax.error(function(){
            bs.loader.unload();
        });
        
    });
};

var UploadizerFallback = function($el,ajaxOptions){
    this.$el = $el;
    this.text = $el.text();
    this.$el.wrapInner('<div style="display:none;"></div>');
    // this.$el.html('');
    this.$iframe = $('<iframe class="uploadButtonIframe" src="/iframeuploadbutton?'+$.param({buttonText:this.text})+'" frameborder="0" allowfullscreen></iframe>')
    this.$el.append(this.$iframe);
    this.ajaxOptions = !!ajaxOptions ? ajaxOptions : {};
    this.dfd = jQuery.Deferred();
    this.bind();
};
UploadizerFallback.prototype.bind = function(){
    var self = this;
    this.$iframe.on('load',function(){
        var lastData = self.$iframe.contents().find(".lastData").html();
        lastData = !!lastData ? JSON.parse(lastData) : null;
        if(!!lastData){
            !!self.ajaxOptions.success ? self.ajaxOptions.success(lastData) : null;
        }
    })
};

return function($el,ajaxOptions,folder,mustBeSquare){
    var ClassTypeToReturn = !!window.FormData ? Uploadizer : UploadizerFallback;
    ClassTypeToReturn = !!iframebutton ? UploadizerFallback : ClassTypeToReturn;

    return new ClassTypeToReturn($el,ajaxOptions,folder,mustBeSquare);
    // return new Uploadizer($el,ajaxOptions)
    // return new UploadizerFallback($el,ajaxOptions)
};
*/