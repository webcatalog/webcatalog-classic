/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { dialog, getCurrentWindow } from '@electron/remote';
import {
  DIALOG_SET_INSTALLATION_PATH_CLOSE,
  DIALOG_SET_INSTALLATION_PATH_FORM_UPDATE,
  DIALOG_SET_INSTALLATION_PATH_OPEN,
} from '../../constants/actions';

import {
  requestSetPreference,
} from '../../senders';

export const close = () => ({
  type: DIALOG_SET_INSTALLATION_PATH_CLOSE,
});

export const open = () => (dispatch, getState) => {
  const state = getState();

  return dispatch({
    type: DIALOG_SET_INSTALLATION_PATH_OPEN,
    initialForm: {
      installationPath: state.preferences.installationPath,
      requireAdmin: state.preferences.requireAdmin,
    },
  });
};

export const updateForm = (changes) => ({
  type: DIALOG_SET_INSTALLATION_PATH_FORM_UPDATE,
  changes,
});

export const save = () => (dispatch, getState) => {
  const state = getState();

  const { form } = state.dialogSetInstallationPath;

  const { installationPath, requireAdmin } = form;

  const appCount = Object.keys(state.appManagement.apps).length;

  if (appCount > 0) {
    dialog.showMessageBox(getCurrentWindow(), {
      title: 'Uninstall all of WebCatalog apps first',
      message: 'You need to uninstall all of your WebCatalog apps before changing this preference.',
      buttons: ['OK'],
      cancelId: 0,
      defaultId: 0,
    }).catch(console.log); // eslint-disable-line
  } else {
    requestSetPreference('requireAdmin', requireAdmin);
    requestSetPreference('installationPath', installationPath);
  }
  dispatch(close());
};
