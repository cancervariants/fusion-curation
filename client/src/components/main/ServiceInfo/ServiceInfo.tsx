import { Dialog, DialogTitle, Typography } from '@material-ui/core';
import { useEffect, useState } from 'react';
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
      <DialogTitle id="simple-dialog-title">Service Info</DialogTitle>
      <Typography className='service-info'>
        {
          'version' in serviceInfo ?
            `Fusion Curation v${serviceInfo.version}`
            : 'version lookup failed'
        }
      </Typography>
    </Dialog>
  );
};

export default ServiceInfo;
