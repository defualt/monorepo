import React from 'react';

import styled from 'styled-components';
import styleConstants from './style-constants';

const StyledButton = styled.div`${styleConstants.mixins.button()};`;
const StyledButtonInner = styled.span`
  ${styleConstants.mixins.buttonInner()} background: ${styleConstants.colors
      .red};
`;

const StyledInputContainer = styled.div`padding: ${styleConstants.appPad}em;`;

const StyledTextContainer = styled.div`
  padding: ${styleConstants.appPad}em;
  box-sizing: border-box;
  @media (min-width: 500px) {
    width: 500px;
    margin: 0 auto;
  }
`;

const StyledLi = styled.li`
  list-style: square;
  list-style-position: inside;
  padding-left: ${styleConstants.appPad}em;
  line-height: ${styleConstants.appPad * 1.5}em;
`;
const StyledP = styled.p`
  line-height: ${styleConstants.appPad * 1.5}em;
  line-height: ${styleConstants.appPad * 1.5}em;
`;

export default function TemplateUploadScreen() {
  return (
    <div>
      <StyledTextContainer className="textContainer">
        <StyledP>
          Upload an image with the following specs. Then you and other users can
          use it as a template to enhance selfies!
        </StyledP>
        <StyledP>Your template image must be:</StyledP>
        <ul>
          <StyledLi>a .png or .jpg file</StyledLi>
          <StyledLi>a square (width and height are equal)</StyledLi>
          <StyledLi>smaller than 5mb</StyledLi>
        </ul>
        <StyledP>
          TIP: Make your template a .png file with transparent areas so users
          can combine their photos with your template.
        </StyledP>
      </StyledTextContainer>
      <StyledInputContainer className="inputContainer">
        <StyledButton className="button mainButton templateUploadizer">
          <StyledButtonInner>Upload a template</StyledButtonInner>
        </StyledButton>
      </StyledInputContainer>
    </div>
  );
}
