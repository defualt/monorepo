/* eslint-disable import/no-mutable-exports */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import styleConstants from './style-constants';
import { appConnect } from './nameSpacedResponsive';
import CropperScreen from './CropperScreen';
import ImagePickerFacebook from './ImagePickerFacebook';
import ImagePickerTemplate from './ImagePickerTemplate';
import HomeLayout from './HomeLayout';
import UrlImportScreen from './UrlImportScreen';
import TemplateUploadScreen from './TemplateUploadScreen';
import ModalScreen from './ModalScreen';
import './app.scss';
import setBackgroundHoc from './setBackgroundHoc';
import publishTemplateCropHoc from './publishTemplateCropHoc';
import ancestorConstantsHoc from './ancestorConstantsHoc';
import UploadCompositeImageSetter from './UploadCompositeImageSetter';

import { formUrl } from './deriveUrlInfo';

// ========
// ========
console.log('can this be cleaned up');
let HomeLayoutWithUploadCallback = props => {
  return <HomeLayout onUploadSuccess={props.setBackground} />;
};
HomeLayoutWithUploadCallback.propTypes = {
  setBackground: PropTypes.func.isRequired,
};
HomeLayoutWithUploadCallback = setBackgroundHoc(HomeLayoutWithUploadCallback);

export { HomeLayoutWithUploadCallback };

// let ImagePickerFacebookWithOnClick =
export function ImagePickerFacebookWithOnClick() {
  return (
    <ModalScreen hasCloseButton headerText="Pick a photo">
      <ImagePickerFacebook />
    </ModalScreen>
  );
}

// ===
const StyledHeaderContentWrapper = styled.div`
  color: ${styleConstants.colors.red};
  padding: 0 ${styleConstants.appPad}em;
  display: inline-block;
`;
export function ImagePickerTemplateWithOnClick() {
  const headerContent = (
    <StyledHeaderContentWrapper>
      <UploadCompositeImageSetter isTemplateUploader>
        upload a template
      </UploadCompositeImageSetter>
    </StyledHeaderContentWrapper>
  );
  return (
    <ModalScreen hasCloseButton headerText="Pick a design" headerContent={headerContent}>
      <ImagePickerTemplate />
    </ModalScreen>
  );
}

let CropperWithFgBgCompletion = class extends Component {
  constructor() {
    super();
    this.generateCompletionUrl = this.generateCompletionUrl.bind(this);
  }
  generateCompletionUrl(activeCompositeImageData) {
    return `${this.props.constants.urlAppNameSpace}/${formUrl(
      activeCompositeImageData
    )}`;
  }
  render() {
    return (
      <ModalScreen hasCloseButton center={false}>
        <CropperScreen
          hideControlsBar={this.props.isMakeSquareTemplateMode}
          hideForeground={this.props.isMakeSquareTemplateMode}
          defaultGeo={this.props.isMakeSquareTemplateMode}
          useClickHandledButton={this.props.isMakeSquareTemplateMode}
          foreground={this.props.compositeImageData.foreground}
          background={this.props.compositeImageData.background}
          generateCompletionUrl={this.generateCompletionUrl}
          publishTemplateCrop={this.props.publishTemplateCrop}
        />
      </ModalScreen>
    );
  }
};
CropperWithFgBgCompletion.propTypes = {
  isMakeSquareTemplateMode: PropTypes.bool,
  compositeImageData: PropTypes.object.isRequired,
  constants: PropTypes.object.isRequired,
  publishTemplateCrop: PropTypes.func.isRequired,
};
CropperWithFgBgCompletion.defaultPrps = {
  isMakeSquareTemplateMode: false,
};
CropperWithFgBgCompletion = publishTemplateCropHoc(ancestorConstantsHoc(
  appConnect((appState /* , { params }*/) => {
    return {
      compositeImageData: appState.compositeImageData,
    };
  })(CropperWithFgBgCompletion)
));
export { CropperWithFgBgCompletion };

export function UrlImportScreenWithWithUploadCallback() {
  return (
    <ModalScreen hasCloseButton headerText="Enter the URL to an Image">
      <UrlImportScreen />
    </ModalScreen>
  );
}

export function TemplateUploadScreenWithUploadCallback() {
  return (
    <ModalScreen hasCloseButton headerText="Upload a template">
      <TemplateUploadScreen />
    </ModalScreen>
  );
}
