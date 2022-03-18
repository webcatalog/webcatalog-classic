/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable max-len */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import { shell } from '@electron/remote';

import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import HelpIcon from '@material-ui/icons/Help';

import ReactMarkdown from 'react-markdown';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';

import extractHostname from '../../helpers/extract-hostname';
import isUrl from '../../helpers/is-url';
import generateUrlWithRef from '../../helpers/generate-url-with-ref';

import { close } from '../../state/dialog-catalog-app-details/actions';

import {
  requestOpenInBrowser,
} from '../../senders';

import AppCard from '../shared/app-card';
import LinkSharing from '../shared/link-sharing';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    paddingBottom: theme.spacing(4),
  },
  status: {
    textAlign: 'center',
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  appDesc: {
    width: '100%',
  },
  appDescSection: {
    marginTop: theme.spacing(2),
    '& h5': {
      ...theme.typography.h6,
      margin: 0,
    },
    '& h5 + p': {
      marginTop: 0,
    },
  },
  legal: {
    marginTop: theme.spacing(1),
  },
  shareInput: {
    marginTop: theme.spacing(4),
  },
  appInfoName: {
    color: theme.palette.text.secondary,
  },
  helpButton: {
    marginLeft: theme.spacing(0.5),
    marginTop: -3,
  },
  ul: {
    margin: 0,
  },
  li: {
    marginLeft: '-0.8rem',
    cursor: 'pointer',
  },
}));

const DialogCatalogAppDetails = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const open = useSelector((state) => state.dialogCatalogAppDetails.open);
  const details = useSelector((state) => state.dialogCatalogAppDetails.details);

  const shareUrl = details && !details.err && details.url ? `https://webcatalog.io/webcatalog/apps/${details.id}/` : '';
  const hostname = details ? extractHostname(details.url) : null;

  return (
    <Dialog
      className={classes.root}
      onClose={() => dispatch(close())}
      open={open}
      fullWidth
    >
      <EnhancedDialogTitle onClose={() => dispatch(close())} />
      <DialogContent className={classes.dialogContent}>
        {details ? (
          <>
            {details.err ? (
              <Typography variant="body2" className={classes.status}>
                Failed to Load App Information.
              </Typography>
            ) : (
              <>
                <AppCard
                  id={details.id}
                  name={details.name}
                  url={details.url}
                  category={details.category}
                  widevine={details.widevine}
                  icon={details.icon}
                  iconThumbnail={isUrl(details.icon256) ? details.icon256 : `file://${details.icon256}`}
                  inDetailsDialog
                />
                <div className={classes.appDesc}>
                  <div className={classes.appDescSection}>
                    {details.url && (
                      <Typography variant="body2">
                        <span className={classes.appInfoName}>Website: </span>
                        <Link
                          href="#"
                          variant="body2"
                          onClick={(e) => {
                            e.preventDefault();
                            requestOpenInBrowser(generateUrlWithRef(details.url));
                          }}
                        >
                          {hostname}
                        </Link>
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <span className={classes.appInfoName}>Classification: </span>
                      {details.url ? 'App' : 'Space'}

                      <Tooltip title="What is this?" placement="right">
                        <IconButton
                          size="small"
                          aria-label="What is this?"
                          classes={{ root: classes.helpButton }}
                          onClick={() => requestOpenInBrowser('https://docs.webcatalog.io/article/18-what-is-the-difference-between-standard-apps-and-multisite-apps')}
                        >
                          <HelpIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                    {details.category && (
                      <Typography variant="body2">
                        <span className={classes.appInfoName}>Category: </span>
                        {details.category}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <span className={classes.appInfoName}>ID: </span>
                      {details.id}
                    </Typography>
                    {details.relatedPaths && (
                      <Typography variant="body2" component="div">
                        <span className={classes.appInfoName}>Related Files & Directories: </span>
                        <ul className={classes.ul}>
                          {details.relatedPaths.map((pathDetails) => (
                            <li
                              key={pathDetails.path}
                              className={classes.li}
                            >
                              <Link onClick={() => shell.showItemInFolder(pathDetails.path)}>
                                {pathDetails.path}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </Typography>
                    )}

                    <Typography variant="body2" className={classes.appDescSection} component="div">
                      <ReactMarkdown linkTarget="_blank">
                        {details.description}
                      </ReactMarkdown>
                    </Typography>

                    {(details.url || details.id.startsWith('group-')) && (
                      <Typography variant="body2" color="textSecondary" className={classes.legal}>
                        {`We are not affiliated, associated, authorized, endorsed by or in any way officially connected to ${details.name}${hostname ? ` (${hostname})` : ''}, except for the fact that we use their websites to develop and provide you this app. All product names, logos, and brands are property of their respective owners.`}
                      </Typography>
                    )}
                  </div>

                  {!details.id.startsWith('custom-') && details.url && (
                    <LinkSharing url={shareUrl} className={classes.shareInput} />
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <Typography variant="body2" className={classes.status}>
            Loading...
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

DialogCatalogAppDetails.defaultProps = {
  details: null,
};

export default DialogCatalogAppDetails;
