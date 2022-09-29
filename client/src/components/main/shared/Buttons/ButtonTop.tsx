import Button, { ButtonProps } from "@material-ui/core/Button";
import { styled } from "@material-ui/core/styles";
import React, { ReactElement } from "react";

const ButtonTopStyled = styled(Button)({
  marginLeft: "6px",
  marginRight: "6px",
});

interface ButtonTopProps extends ButtonProps {
  text: string;
}

const ButtonTop = ({
  text,
  onClick,
  variant,
  color,
}: ButtonTopProps): ReactElement => {
  return (
    <ButtonTopStyled variant={variant} onClick={onClick} color={color}>
      {text}
    </ButtonTopStyled>
  );
};

export default ButtonTop;
