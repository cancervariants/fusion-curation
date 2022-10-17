import { Tooltip, makeStyles } from "@material-ui/core";
import { styled } from "@mui/material/styles";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import DeleteIcon from "@material-ui/icons/Delete";
import DoneIcon from "@material-ui/icons/Done";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import { red, green } from "@material-ui/core/colors";
import "./StructuralElementInputAccordion.scss";
import { BaseStructuralElementProps } from "./StructuralElementInputProps";

const useStyles = makeStyles(() => ({
  cardHeaderAction: {
    margin: "auto !important",
    display: "flex",
  },
  cardHeaderTitleRoot: {
    textAlign: "center",
    fontSize: "15px !important",
    marginRight: "10px !important",
  },
  cardHeaderSubTitleRoot: {
    textAlign: "center",
  },
  cardAvatar: {
    marginRight: "10px !important",
  },
  cardActionsRoot: {
    padding: "0 8px 8px 16px !important",
  },
}));

interface StructuralElementInputAccordionProps
  extends BaseStructuralElementProps {
  expanded: boolean;
  setExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
  inputElements?: JSX.Element;
  validated: boolean;
  icon: JSX.Element;
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}
const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const StructuralElementInputAccordion: React.FC<
  StructuralElementInputAccordionProps
> = ({
  expanded,
  setExpanded,
  element,
  handleDelete,
  inputElements,
  validated,
  icon,
}) => {
  const classes = useStyles();

  return (
    <Card>
      <CardHeader
        avatar={icon}
        action={
          <Tooltip title="Delete element">
            <DeleteIcon
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(element.element_id);
              }}
              onFocus={(event) => event.stopPropagation()}
            />
          </Tooltip>
        }
        title={element.nomenclature ? element.nomenclature : null}
        classes={{
          action: classes.cardHeaderAction,
          avatar: classes.cardAvatar,
        }}
        titleTypographyProps={{
          classes: {
            root: classes.cardHeaderTitleRoot,
          },
        }}
        subheaderTypographyProps={{
          classes: {
            root: classes.cardHeaderSubTitleRoot,
          },
        }}
      />
      <CardActions
        classes={{
          root: classes.cardActionsRoot,
        }}
      >
        {validated ? (
          <Tooltip title="Validation successful">
            <DoneIcon className="input-correct" style={{ color: green[500] }} />
          </Tooltip>
        ) : (
          <Tooltip title="Invalid component">
            <ClearIcon
              className="input-incorrect"
              style={{ color: red[500] }}
            />
          </Tooltip>
        )}
        {inputElements ? (
          <ExpandMore
            expand={expanded}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <EditIcon className="edit-icon" style={{ fontSize: 23 }} />
          </ExpandMore>
        ) : null}
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{inputElements}</CardContent>
      </Collapse>
    </Card>
  );
};

export default StructuralElementInputAccordion;
