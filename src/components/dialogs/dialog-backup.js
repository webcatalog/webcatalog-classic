/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable object-curly-newline */
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

import {
  Avatar,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@material-ui/core';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';
import { close } from '../../state/dialog-backup/actions';
import getAssetPath from '../../helpers/get-asset';
import getFilename from '../../helpers/get-filename';
import isCustomApp from '../../helpers/is-custom-app';
import {
  APP_DETAILS_FILENAME,
  APP_DETAILS_ZIP_FILENAME,
  APP_IMAGES_FOLDERNAME,
} from '../../constants/backups';

const DialogBackup = () => {
  const dispatch = useDispatch();

  const [selectedApps, setSelectedApps] = useState([]);
  const [allAppsSelected, setAllAppsSelected] = useState(false);

  const open = useSelector((state) => state.dialogBackup.open);
  const appsList = useSelector((state) => Object.entries(state.appManagement.apps));

  const onClose = useCallback(() => dispatch(close()), [dispatch]);
  const onAppSelected = useCallback((appIndex) => () => {
    const currentAppIndex = selectedApps.indexOf(appIndex);
    const newSelectedApps = [...selectedApps];

    if (currentAppIndex === -1) {
      newSelectedApps.push(appIndex);
    } else {
      setAllAppsSelected(false);
      newSelectedApps.splice(currentAppIndex, 1);
    }

    const isAllAppsSelected = (appsList.length === newSelectedApps.length);
    setSelectedApps(newSelectedApps);
    setAllAppsSelected(isAllAppsSelected);
  }, [appsList, selectedApps]);
  const onBackup = useCallback(async () => {
    // TODO: Add zip utils for better architecture.
    const zip = new JSZip();
    const imagesFolder = zip.folder(APP_IMAGES_FOLDERNAME);

    const selectedAppsData = appsList
      .filter((_, index) => selectedApps.indexOf(index) !== -1)
      .map(([appKey, appInfo]) => {
        const { id, name, url, icon, opts } = appInfo;

        if (!isCustomApp(appKey)) {
          const filePosfix = window.process.platform === 'win32' ? '-unplated.png' : '.png';
          const iconUrl = `https://cdn-1.webcatalog.io/catalog/${appKey}/${appKey}-icon${filePosfix}`;

          return [appKey, { id, name, url, icon: iconUrl, opts }];
        }

        return [appKey, { id, name, url, icon, opts }];
      });

    zip.file(APP_DETAILS_FILENAME, JSON.stringify(selectedAppsData));

    await Promise.all(selectedAppsData.map(async ([appKey, appInfo]) => {
      if (isCustomApp(appKey)) {
        const { name, icon } = appInfo;
        const iconFilename = `${name}-${getFilename(icon)}`;

        // eslint-disable-next-line no-undef
        const fileResponse = await fetch(getAssetPath(icon));
        const fileResponseBody = await fileResponse.body;
        const dataStream = await fileResponseBody.getReader().read();

        imagesFolder.file(iconFilename, dataStream.value, { base64: true });
      }
    }));

    const zipFileBlob = await zip.generateAsync({ type: 'blob' });
    FileSaver.saveAs(zipFileBlob, APP_DETAILS_ZIP_FILENAME);

    onClose();
  }, [selectedApps, appsList, onClose]);

  const onAllAppSelected = () => {
    setAllAppsSelected(!allAppsSelected);

    if (allAppsSelected) {
      setSelectedApps([]);
    } else {
      setSelectedApps([...Array(appsList.length).keys()]);
    }
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
      maxWidth="sm"
    >
      <EnhancedDialogTitle onClose={onClose}>
        Backup Apps & Spaces
      </EnhancedDialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Choose which apps & spaces to backup.
        </Typography>
        <List>
          <ListItem
            button
            dense
            onClick={onAllAppSelected}
          >
            <ListItemText primary="All Apps & Spaces" />
            <ListItemSecondaryAction>
              <Checkbox
                edge="end"
                color="primary"
                tabIndex={-1}
                disableRipple
                checked={allAppsSelected}
                onChange={onAllAppSelected}
              />
            </ListItemSecondaryAction>
          </ListItem>
          {appsList && appsList.map(([appKey, appInfo], appIndex) => (
            <ListItem
              button
              dense
              key={appKey}
              onClick={onAppSelected(appIndex)}
            >
              <ListItemAvatar>
                <Avatar src={getAssetPath(appInfo.icon)} />
              </ListItemAvatar>
              <ListItemText
                id={appKey}
                primary={appInfo.name}
              />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  color="primary"
                  tabIndex={-1}
                  disableRipple
                  checked={selectedApps.indexOf(appIndex) !== -1}
                  onChange={onAppSelected(appIndex)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          disabled={!selectedApps.length}
          onClick={onBackup}
        >
          Backup
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogBackup;
