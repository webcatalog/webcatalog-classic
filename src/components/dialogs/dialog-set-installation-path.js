/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import InputAdornment from '@material-ui/core/InputAdornment';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';

import {
  close,
  save,
  updateForm,
} from '../../state/dialog-set-installation-path/actions';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';

const useStyle = makeStyles((theme) => ({
  top: {
    marginTop: theme.spacing(1),
  },
  dialogActions: {
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: 0,
    padding: theme.spacing(1),
  },
}));

const DialogSetInstallationPath = () => {
  const classes = useStyle();
  const dispatch = useDispatch();

  const open = useSelector((state) => state.dialogSetInstallationPath.open);
  const form = useSelector((state) => state.dialogSetInstallationPath.form);

  const {
    installationPath = '~/Applications/WebCatalog Apps',
    requireAdmin = false,
  } = useMemo(() => (form || { }), [form]);

  const onClose = useCallback(() => dispatch(close()), [dispatch]);
  const onUpdateForm = useCallback((formData) => dispatch(updateForm(formData)), [dispatch]);
  const onSave = useCallback(() => dispatch(save()), [dispatch]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
    >
      <EnhancedDialogTitle onClose={onClose}>
        Set Custom Installation Path
      </EnhancedDialogTitle>
      <DialogContent>
        <Typography align="center" variant="body2" className={classes.top}>
          Use at your own risk.
        </Typography>
        <TextField
          fullWidth
          id="installationPath"
          label="Installation path"
          margin="normal"
          value={installationPath}
          variant="outlined"
          disabled
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={() => {
                    window.remote.dialog.showOpenDialog(window.remote.getCurrentWindow(), {
                      properties: ['openDirectory'],
                    })
                      .then(({ canceled, filePaths }) => {
                        if (!canceled && filePaths && filePaths.length > 0) {
                          onUpdateForm({ installationPath: filePaths[0] });
                        }
                      })
                      .then(console.log); // eslint-disable-line
                  }}
                >
                  Change
                </Button>
              </InputAdornment>
            ),
          }}
        />
        {window.process.platform !== 'win32' && (
          <FormControlLabel
            control={(
              <Checkbox
                disabled={installationPath === '~/Applications/WebCatalog Apps' || installationPath === '/Applications/WebCatalog Apps'}
                checked={installationPath === '~/Applications/WebCatalog Apps' || installationPath === '/Applications/WebCatalog Apps' ? false : requireAdmin}
                onChange={(e) => onUpdateForm({ requireAdmin: e.target.checked })}
              />
            )}
            label="Require sudo for installation"
          />
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={onSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogSetInstallationPath;
