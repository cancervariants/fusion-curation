import {
  Dialog, DialogTitle, Divider, List, ListItem, ListItemText
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { getInfo } from '../../../services/main';
import { ServiceInfoResponse } from '../../../services/ResponseModels';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import './About.scss';

interface AboutProps {
  show: boolean,
  setShow: CallableFunction,
}

const About: React.FC<AboutProps> = ({ show, setShow }) => {
  const [serviceInfo, setServiceInfo] = useState({} as ServiceInfoResponse);

  useEffect(() => {
    if (show) {
      getInfo()
        .then(infoResponse => {
          setServiceInfo(infoResponse);
        });
    }
  }, [show]);

  return (
    <Dialog
      aria-labelledby="simple-dialog-title"
      open={show}
      onClose={() => setShow(false)}
      maxWidth="sm"
      fullWidth={true}
    >
      <DialogTitle id="simple-dialog-title">
        {
          'curfu_version' in serviceInfo ?
            `Fusion Curation v${serviceInfo.curfu_version}`
            : 'version lookup failed'
        }
      </DialogTitle>
      <Divider />
      <List className='service-info'>
        <ListItem
          button
          component='a'
          href='https://fusions.cancervariants.org'
          target='_blank'
          rel='noopener'
        >
          <ListItemText>
            Fusion Guidelines Homepage
          </ListItemText>
          <ArrowForwardIosIcon style={{ fontSize: 20 }}/>
        </ListItem>
        <ListItem
          button
          component='a'
          href='https://github.com/cancervariants/fusion-curation/'
          target='_blank'
          rel='noopener'
        >
          <ListItemText>
            Code Repository
          </ListItemText>
          <ArrowForwardIosIcon style={{ fontSize: 20 }}/>
        </ListItem>
        <ListItem
          button
          component='a'
          href='https://cancervariants.org/'
          target='_blank'
          rel='noopener'
        >
          <ListItemText>
            Variant Interpretation for Cancer Consortium
          </ListItemText>
          <ArrowForwardIosIcon style={{ fontSize: 20 }}/>
        </ListItem>
      </List>
    </Dialog >
  );
};

export default About;
