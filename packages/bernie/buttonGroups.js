import { connect } from 'react-redux';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'redux-first-router-link'
import Upload from './Upload';
import {BernieLink} from './routingComponents';

import styled from 'styled-components';
import styleConstants from './style-constants';
import ConnectResponsiveStatusesDictHOC from './ConnectResponsiveStatusesDictHOC';



import './app.scss';

const Div = props => {
  return (
    <div {...props}>
      {props.children}
    </div>
  );
};
Div.propTypes = {
  children: PropTypes.node.isRequired,
};

const A = props => {
  return (
    <a {...props}>
      {props.children}
    </a>
  );
};
A.propTypes = {
  children: PropTypes.node.isRequired,
};

const StyledSubsection = ConnectResponsiveStatusesDictHOC(styled.div`
  padding-bottom: ${styleConstants.appPad}em;
`);

const StyledIconWrapper = ConnectResponsiveStatusesDictHOC(styled.div`
  width:${styleConstants.appPad * 2}em;
  height: ${styleConstants.appPad * 2}em;
  float:left;
  ${props => {
    // singleColHome
    if(!props.isModal && props.responsiveStatusesDict.singleCol) {
      return `
        float:none;
        margin:0 auto;
      `;
    }
    return '';
  }}
`);

const StyledIcon = ConnectResponsiveStatusesDictHOC(styled.i`
  font-size:${styleConstants.appPad * 2}em;
  
`);

let BernieAppButtonGroup = class extends Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    const icon =
      this.props.icon &&
      <StyledIconWrapper className="section_header_icon" isModal={this.props.isModal}>
        <StyledIcon className="material-icons" isModal={this.props.isModal}>
          {this.props.icon}
        </StyledIcon>
      </StyledIconWrapper>;

    const shortHeadline =
      this.props.shortHeadline &&
      <div className="section_header_microText">
        <span>
          {this.props.shortHeadline}
        </span>
      </div>;

    const headline =
      this.props.headline &&
      <div className="section_header_text">
        <span>
          {this.props.headline}
        </span>
      </div>;
    const buttons =
      this.props.buttons &&
      <div className="buttonGroup_buttons">
        {this.props.buttons.map(btnDetails => {
          let btnInner;
          let className = 'buttonGroup_button button';
          if (btnDetails.onUploadSuccess) {
            btnInner = (
              <Upload
                className={btnDetails.className}
                onSuccess={this.props.onUploadSuccess}
              >
                {btnDetails.text}
              </Upload>
            );
          } else if (btnDetails.aHref) {
            btnInner = (
              <a className={btnDetails.className} href={btnDetails.aHref}>
                {btnDetails.text}
              </a>
            );
          } else if (btnDetails.actionType) {
            btnInner = (
              <BernieLink
                className={btnDetails.className}
                to={
                  {
                    type: `BERNIE_${btnDetails.actionType}`,
                    compositeImageData: this.props.compositeImageData,
                  }
                }
              >
                {btnDetails.text}
              </BernieLink>
            );
          } else if (btnDetails.onClick) {
            btnInner = (
              <span onClick={btnDetails.onClick} role="button" tabIndex="0">
                {btnDetails.text}
              </span>
            );
            className = `${className} ${btnDetails.className}`;
          } else {
            btnInner = (
              <span>
                {btnDetails.text}
              </span>
            );
            className = `${className} ${btnDetails.className}`;
          }

          return (
            <div key={btnDetails.text} className={className}>
              {btnInner}
            </div>
          );
        })}
      </div>;

    const LinkOrDiv = this.props.compositeImageData.screen === this.props.urlFragment ? Div : BernieLink;
    const to = {
      type: `BERNIE_DYNAMIC`,
      compositeImageData: this.props.compositeImageData,
      bernieDynamicScreen: this.props.urlFragment,
    };
    return (
      <StyledSubsection
        className={`app_body_rightPillar_section_subsection ${this.props
          .className}`}
      >
        <div className="buttonGroup">
          <LinkOrDiv to={to} className="section_header">
            {shortHeadline}
            {icon}
            {headline}
          </LinkOrDiv>
          {buttons}
        </div>
      </StyledSubsection>
    );
  }
}
BernieAppButtonGroup.propTypes = {
  icon: PropTypes.string,
  shortHeadline: PropTypes.string,
  className: PropTypes.string,
  headline: PropTypes.string,
  buttons: PropTypes.array,
  urlFragment: PropTypes.string,
  compositeImageData: PropTypes.object,
  onUploadSuccess: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};
BernieAppButtonGroup.defaultProps = {
  icon: '',
  shortHeadline: '',
  className: '',
  headline: '',
  buttons: [],
  urlFragment: '',
  compositeImageData: null,
  onUploadSuccess: null,
};

BernieAppButtonGroup = connect(
  ( state /* , { params }*/) => {
    return {
      compositeImageData: state.bernie.compositeImageData,
      location: state.location,
    };
  },
  {
  }
)(BernieAppButtonGroup);

const buttonGroupComponents = {};
function makeButtonGroupComponent(
  options /* {
  headline,// shortHeadline, icon, buttons
}*/
) {
  function ButtonGroup(props) {
    const ButtonGroup = <BernieAppButtonGroup {...props} {...options} />;
    if (props.isModal) {
      return (
        <div className="modal">
          {ButtonGroup}
        </div>
      );
    }
    return ButtonGroup;
  }
  ButtonGroup.propTypes = {
    isModal: PropTypes.bool,
  };
  ButtonGroup.defaultProps = {
    isModal: false,
  };
  return ButtonGroup;
}

const ImportButtonGroup = makeButtonGroupComponent({
  urlFragment: 'import',
  headline: 'Photo from:',
  shortHeadline: 'import',
  icon: 'photo_camera',
  buttons: [
    {
      text: 'Facebook',
      routerLinkScreenName: 'import-photo-from-facebook',
      actionType: 'IMPORT_FACEBOOK'
    },
    {
      text: 'Camera',
      onUploadSuccess(imgData) {
        /*
          Key: "selfies/a-brian14744733088711500480799004.png",
          failingSquare: undefined,
          height: 1280,
          public_id:"a-brian14744733088711500480799004.png",
          url:"https://bernieapp.s3.amazonaws.com/selfies/a-brian14744733088711500480799004.png",
          width:
          960
        */
        this.props.onUploadSuccess(imgData);
      },
    },
    {
      text: 'URL',
    },
    {
      text: 'Storage',
    },
  ],
});
buttonGroupComponents.import = ImportButtonGroup;

const ShareButtonGroup = makeButtonGroupComponent({
  urlFragment: 'share',
  headline: 'Share this via:',
  shortHeadline: 'share',
  icon: 'share',
  buttons: [
    {
      text: 'Facebook photo',
    },
    {
      text: 'Facebook post',
    },
    {
      text: 'Tweet',
      aHref:
        'https://twitter.com/intent/tweet?url=xXxXxXxXxXxXxXxXxXxXxXxX&via=bernieselfie&hashtags=BernieSanders%2Cfeelthebern%2Cbernieselfie&related=BernieSander',
    },
  ],
});
buttonGroupComponents.share = ShareButtonGroup;

const EditBrushButtonGroup = makeButtonGroupComponent({
  urlFragment: 'editBrush',
  className: 'microSubsection',
  shortHeadline: 'edit',
  icon: 'brush',
});
buttonGroupComponents.editBrush = EditBrushButtonGroup;

const EditSizeButtonGroup = makeButtonGroupComponent({
  urlFragment: 'editSize',
  className: 'editSubsection',
  shortHeadline: 'edit',
  headline: 'Edit:',
  icon: 'transform',
  buttons: [
    {
      text: 'Size and position',
      routerLinkScreenName: 'crop',
      actionType: 'CROP'
    },
  ],
});
buttonGroupComponents.editSize = EditSizeButtonGroup;

const EditDesignButtonGroup = makeButtonGroupComponent({
  urlFragment: 'editDesign',
  className: 'designSubsection',
  shortHeadline: 'edit',
  headline: 'Change design:',
  icon: 'brush',
  buttons: [
    {
      text: 'more options',
      routerLinkScreenName: 'select-template',
      actionType: 'SELECT_TEMPLATE'
    },
    {
      text: 'upload a template',
    },
  ],
});
buttonGroupComponents.editDesign = EditDesignButtonGroup;
const objectKeysButtonGroupComponents = Object.keys(buttonGroupComponents);
const buttonGroupComponentsRegexArrayString = objectKeysButtonGroupComponents.reduce(
  (regexArray, componentKey, i) => {
    regexArray.push(componentKey);
    if (i === objectKeysButtonGroupComponents.length - 1) {
      return regexArray.join('|');
    }
    return regexArray;
  },
  []
);


export {
  buttonGroupComponents,
  buttonGroupComponentsRegexArrayString,
  EditDesignButtonGroup,
  EditSizeButtonGroup,
  EditBrushButtonGroup,
  ShareButtonGroup,
  ImportButtonGroup,
};
