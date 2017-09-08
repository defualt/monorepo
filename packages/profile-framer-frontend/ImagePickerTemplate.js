import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {appConnect} from './nameSpacedResponsive';
import ImagePicker from './ImagePicker';
import makeActionFetchTemplates from './makeActionFetchTemplates';
import { compositeImageIntoParams } from './compositeImage';
import ancestorConstantsHoc from './ancestorConstantsHoc';

class ImagePickerTemplate extends Component {
  constructor() {
    super();
    this.generateLinkTo = this.generateLinkTo.bind(this);
  }
  componentWillMount() {
    if (this.props.limit > 3) {
      this.props.fetchTemplates(this.props.constants);
    }
  }
  generateLinkTo(imgSrcObj) {
    return {
      type: `CROP`,
      payload: {
        ...compositeImageIntoParams(this.props.compositeImageData),
        fgSrcKey: imgSrcObj.srcKey,
      },
    };
  }
  render() {
    return (
      <ImagePicker
        images={this.props.images}
        limit={this.props.limit}
        layoutVariation={this.props.layoutVariation}
        generateLinkTo={this.generateLinkTo}
      />
    );
  }
}

ImagePickerTemplate.propTypes = {
  constants: PropTypes.object.isRequired,
  fetchTemplates: PropTypes.func.isRequired,
  images: PropTypes.array,
  limit: PropTypes.number,
  layoutVariation: PropTypes.string,
  compositeImageData: PropTypes.object.isRequired,
};
ImagePickerTemplate.defaultProps = {
  generateLinkTo: () => {},
  images: [],
  limit: Infinity,
  layoutVariation: '',
};
export default ancestorConstantsHoc(appConnect(
  (appState /* , { params }*/) => {
    return {
      images: appState.templates,
      compositeImageData: appState.compositeImageData,
    };
  },
  {
    fetchTemplates: makeActionFetchTemplates,
  }
)(ImagePickerTemplate));