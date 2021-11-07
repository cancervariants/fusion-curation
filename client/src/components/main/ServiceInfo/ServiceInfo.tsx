import {
  Dialog, DialogTitle, Divider, List, ListItem, ListItemText
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { getInfo } from '../../../services/main';
import { ServiceInfoResponse } from '../../../services/ResponseModels';
import './ServiceInfo.scss';

const ServiceInfo = ({ show, setShow }) => {
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
    >
      <DialogTitle id="simple-dialog-title">            {
        'version' in serviceInfo ?
          `Fusion Curation v${serviceInfo.version}`
          : 'version lookup failed'
      }
      </DialogTitle>
      <Divider />
      <List className='service-info'>
        <ListItem
          button
          component='a'
          href='https://cancervariants.org/projects/fusions'
          target='_blank'
          rel='noopener'
        >
          <ListItemText>
            Project Homepage
          </ListItemText>
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
        </ListItem>
      </List>
    </Dialog >
  );
};


/*

      <Typography >
      </Typography>
      <Typography>
        <Link href='https://cancervariants.org/projects/fusions/'>
          Project Homepage
        </Link>
      </Typography>
      <Typography>
        <Link href='https://github.com/cancervariants/fusion-curation/'>
          Code Repository
        </Link>
      </Typography>

*/
export default ServiceInfo;
