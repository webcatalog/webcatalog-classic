/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import {
  DIALOG_UPGRADE_CLOSE,
  DIALOG_UPGRADE_OPEN,
} from '../../constants/actions';

export const close = () => ({
  type: DIALOG_UPGRADE_CLOSE,
});

export const open = () => ({
  type: DIALOG_UPGRADE_OPEN,
});
