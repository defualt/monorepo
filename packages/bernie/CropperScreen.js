/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import windowSizer from '@defualt/window-sizer';
import {back} from 'redux-first-router';
import ReactCropperEnhanced from './ReactCropperEnhanced';

import styled from 'styled-components';
import styleConstants from './style-constants';
import ConnectResponsiveStatusesDictHOC from './ConnectResponsiveStatusesDictHOC';

const StyledButton = ConnectResponsiveStatusesDictHOC(styled.div`
  ${styleConstants.mixins.button()}
`);
const StyledButtonAnchor = ConnectResponsiveStatusesDictHOC(styled.a`
  ${styleConstants.mixins.button()}
`);

const StyledButtonInnerSpan = ConnectResponsiveStatusesDictHOC(styled.span`
  ${styleConstants.mixins.buttonInner()}
`);

function whitelistFilterProps(obj, whitelist) {
  return Object.keys(obj).reduce((accum, key) => {
    const keyIsAllowed =
      whitelist.filter(whitelistItem => {
        return key === whitelistItem;
      }).length > 0;
    if (keyIsAllowed) {
      accum[key] = obj[key];
    }
    return accum;
  }, {});
}

const isTouchDevice = 'ontouchstart' in document.documentElement;

class DesignPicker extends Component {
  render() {
    return (
      <div className="modalFooter clearfix">
        <div className="footer_section footer_imageOptions">
          <h3>Change design</h3>
          <div className="designFrame">
            <div className="designFrame_innerWrap">
              <img
                alt="Basic Hair and Glasses Template"
                className="designFrame_design standardTemplate"
                src="http://s3-us-west-1.amazonaws.com/bernieapp/decorations/h3.png"
              />
            </div>
          </div>
          <div className="designFrame">
            <div className="designFrame_innerWrap">
              <img
                alt="Colorful Hair and Glasses Template"
                className="designFrame_design standardTemplate"
                src="http://s3-us-west-1.amazonaws.com/bernieapp/decorations/h4.png"
              />
            </div>
          </div>
          <div className="designFrame">
            <div className="designFrame_innerWrap">
              <img
                alt="Text and GradientTemplate Template"
                className="designFrame_design standardTemplate"
                src="http://s3-us-west-1.amazonaws.com/bernieapp/decorations/wg.png"
              />
            </div>
          </div>
          <StyledButton className="moreimageOptions button">
            <StyledButtonInnerSpan className="macro">more options</StyledButtonInnerSpan>
            <StyledButtonInnerSpan className="micro">change design</StyledButtonInnerSpan>
          </StyledButton>
        </div>
        <div className="footer_section">
          <h3>&nbsp;</h3>
          <div className="designFrame designFrame-empty" />
          <StyledButton className="getPhotoButton button">
            <StyledButtonInnerSpan>get photo</StyledButtonInnerSpan>
          </StyledButton>
        </div>
      </div>
    );
  }
}

function CloseButton() {
  return (
    <StyledButton
      className="closeButton button"
      onClick={back}
      role="button"
      tabIndex={0}
    >
      <StyledButtonInnerSpan>X</StyledButtonInnerSpan>
    </StyledButton>
  );
}

function CompletionInterface(props) {
  const url = props.generateCompletionUrl(props.activeCompositeImageData);
  return (
    <div className="modalHeader clearfix">
      <div className="doneSection">
        <h2>Drag and resize the box to crop</h2>
        <div className="modal_buttonGroup">
          <StyledButtonAnchor href={url} className="button mainButton cropDoneButton">
            <StyledButtonInnerSpan>Done</StyledButtonInnerSpan>
          </StyledButtonAnchor>
        </div>
      </div>
    </div>
  );
}
CompletionInterface.propTypes = {
  activeCompositeImageData: PropTypes.object.isRequired,
  generateCompletionUrl: PropTypes.func.isRequired,
};

class CropperScreen extends Component {
  constructor(props) {
    super();
    this.state = {
      foreground: {
        ...props.foreground,
      },
      background: {
        ...props.background,
      },
    };
    this.crop = this.crop.bind(this);
  }

  componentWillMount() {
    // When window resizes, flicker cropperExists.
    // cropperExists determines whether or not <ReactCropper> renders.
    // So <ReactCropper> will unmount then mount another instance.
    // This lets us reset the cropper for each resize.
    this.setState({ windowHeight: windowSizer.dimensions.height });
    this.windowSizerCb = windowSizer.addCb(() => {
      this.setState({ windowHeight: windowSizer.dimensions.height });
    });
  }
  componentWillUnmount() {
    if (this.windowSizerCb) {
      windowSizer.removeCb(this.windowSizerCb);
      delete this.windowSizerCb;
    }
  }

  crop(cropData) {
    // this.setState(result);
    this.setState({
      foreground: {
        ...this.state.foreground,
        x: Math.round(cropData.detail.x),
        y: Math.round(cropData.detail.y),
        width: Math.round(cropData.detail.width),
        height: Math.round(cropData.detail.height),
      },
    });
  }

  render() {
    const styles = {
      cropModal: { height: this.state.windowHeight || '', overflow: 'hidden' },
      cropContainer: {
        height: this.state.windowHeight - 256,
        overflow: 'hidden',
      },
    };

    const reactCropperOptions = {
      zoomOnWheel: false,
      aspectRatio: 1 / 1,
      responsive: true,
      guides: false,
      autoCropArea: 0.9,
      rotatable: false,
      crop: this.crop,
      src: this.state.background.src,
      cropSrc: this.state.foreground.src,
      data: this.state.foreground
        ? whitelistFilterProps(this.state.foreground, [
            'width',
            'height',
            'x',
            'y',
          ])
        : null,
      //{width: 200, height: 200, x: 10, y: 10, scaleX: 1, scaleY: 1,}
    };
    reactCropperOptions.strict = false;

    if (isTouchDevice) {
      Object.assign(reactCropperOptions, {
        mouseWheelZoom: false,
        cropBoxMovable: false,
        movable: true,
        cropBoxResizable: false,
        dragCrop: false,
        minCropBoxWidth: windowSizer.dimensions.width - 20,
      });
    }

    const activeCompositeImageData = {
      foreground: this.state.foreground,
      background: this.props.background,
    };
    return (
      <div className="modal cropModal" style={styles.cropModal}>
        <CloseButton />
        <DesignPicker />
        <div className="cropOuterContainer">
          <div className="cropContainer" style={styles.cropContainer}>
            <ReactCropperEnhanced
              onResize={this.state.onResize}
              {...reactCropperOptions}
            />
          </div>
        </div>
        <CompletionInterface
          activeCompositeImageData={activeCompositeImageData}
          generateCompletionUrl={this.props.generateCompletionUrl}
        />
      </div>
    );
  }
}
CropperScreen.propTypes = {
  background: PropTypes.object.isRequired,
  foreground: PropTypes.object.isRequired,
  generateCompletionUrl: PropTypes.func.isRequired
};

export default CropperScreen;
