/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import connectComponent from '../../helpers/connect-component';
import isUrl from '../../helpers/is-url';

import freedesktopMainCategories from '../../constants/freedesktop-main-categories';
import freedesktopAdditionalCategories from '../../constants/freedesktop-additional-categories';

import {
  requestOpenInBrowser,
} from '../../senders';

import {
  close,
  create,
  getIconFromInternet,
  getIconFromAppSearch,
  updateForm,
} from '../../state/dialog-create-custom-app/actions';

import defaultIcon from '../../assets/default-icon.png';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';

const styles = (theme) => ({
  grid: {
    marginTop: theme.spacing(1),
  },
  iconContainer: {
    height: 96,
    width: 96,
    backgroundColor: theme.palette.common.minBlack,
  },
  icon: {
    height: 96,
    width: 96,
  },
  iconContainerPlated: {
    height: 96,
    width: 96,
    // 100/1024 * 96
    padding: 9,
  },
  iconPlated: {
    height: 78,
    width: 78,
    boxShadow: theme.shadows[1],
    // 96 * 22.375%
    borderRadius: 21,
    backgroundColor: theme.palette.common.white,
  },
  dialogActions: {
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: 0,
    padding: theme.spacing(1),
  },
  buttonBot: {
    marginTop: theme.spacing(1),
  },
  caption: {
    display: 'block',
  },
  link: {
    cursor: 'pointer',
  },
});

const DialogCreateCustomApp = (props) => {
  const {
    applyIconTemplate,
    classes,
    downloadingIcon,
    freedesktopAdditionalCategory,
    freedesktopMainCategory,
    icon,
    internetIcon,
    name,
    nameError,
    onClose,
    onCreate,
    onGetIconFromInternet,
    onGetIconFromAppSearch,
    onUpdateForm,
    open,
    url,
    urlDisabled,
    urlError,
  } = props;

  let iconPath = defaultIcon;
  if (icon) {
    if (isUrl(icon)) iconPath = icon;
    else iconPath = `file://${icon}`;
  } else if (internetIcon) {
    iconPath = internetIcon;
  }

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
    >
      <EnhancedDialogTitle onClose={onClose}>
        {urlDisabled ? 'Create Custom Space' : 'Create Custom App'}
      </EnhancedDialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          id="name"
          label="Name"
          helperText={nameError}
          margin="dense"
          onChange={(e) => onUpdateForm({ name: e.target.value })}
          value={name}
          error={Boolean(nameError)}
          variant="outlined"
        />
        {/* <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel id="input-type-label">Classification</InputLabel>
          <Select
            id="input-type"
            labelId="input-type-label"
            value={urlDisabled}
            onChange={(event) => onUpdateForm({ urlDisabled: event.target.value })}
            label="Classification"
            margin="dense"
          >
            <MenuItem value={false}>App</MenuItem>
            <MenuItem value>Space</MenuItem>
          </Select>
          <FormHelperText>
            <Link
              onClick={() => requestOpenInBrowser('https://docs.webcatalog.io/article/18-what-is-the-difference-between-standard-apps-and-multisite-apps')}
              className={classes.link}
            >
              What is the difference between apps and spaces?
            </Link>
          </FormHelperText>
        </FormControl> */}
        {!urlDisabled && (
          <TextField
            fullWidth
            id="url"
            label="URL"
            helperText={urlError}
            margin="dense"
            onChange={(e) => onUpdateForm({ url: e.target.value })}
            value={urlDisabled ? 'No URL specified.' : url}
            disabled={urlDisabled}
            error={Boolean(urlError)}
            variant="outlined"
          />
        )}
        <Grid container spacing={1} className={classes.grid}>
          <Grid item xs={12} sm="auto">
            {applyIconTemplate ? (
              <div className={classes.iconContainerPlated}>
                <img src={iconPath} alt={name} className={classes.iconPlated} />
              </div>
            ) : (
              <div className={classes.iconContainer}>
                <img src={iconPath} alt={name} className={classes.icon} />
              </div>
            )}
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                window.remote.dialog.showOpenDialog({
                  filters: [
                    { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'tif', 'bmp', 'dib'] },
                  ],
                  properties: ['openFile'],
                })
                  .then(({ canceled, filePaths }) => {
                    if (!canceled && filePaths && filePaths.length > 0) {
                      onUpdateForm({ icon: filePaths[0] });
                    }
                  })
                  .catch(console.log); // eslint-disable-line
              }}
              disabled={downloadingIcon}
            >
              Select Local Image...
            </Button>
            <Typography variant="caption" className={classes.caption}>
              PNG, JPEG, GIF, TIFF or BMP.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              className={classes.buttonBot}
              disabled={Boolean(!url || urlError || urlDisabled || downloadingIcon)}
              onClick={() => onGetIconFromInternet()}
            >
              {downloadingIcon ? 'Downloading...' : 'Download Icon from URL'}
            </Button>
            <br />
            <Button
              variant="outlined"
              size="small"
              className={classes.buttonBot}
              disabled={Boolean(!url || urlError || urlDisabled || downloadingIcon)}
              onClick={() => onGetIconFromAppSearch()}
            >
              {downloadingIcon ? 'Downloading...' : 'Download Icon from WebCatalog'}
            </Button>
            <br />
            <Button
              variant="outlined"
              size="small"
              className={classes.buttonBot}
              disabled={!(icon || internetIcon) || downloadingIcon}
              onClick={() => onUpdateForm({ icon: null, internetIcon: null })}
            >
              Reset to Default
            </Button>
            <br />
            <FormGroup row>
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={applyIconTemplate}
                    onChange={(e) => onUpdateForm({ applyIconTemplate: e.target.checked })}
                    name="applyIconTemplate"
                    color="primary"
                  />
                )}
                label="Add shadows and rounded corners"
              />
            </FormGroup>
          </Grid>
        </Grid>
        {window.process.platform === 'linux' && (
          <>
            <br />
            <Divider />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel id="input-main-category-label">Main Category</InputLabel>
              <Select
                id="input-main-category"
                labelId="input-main-category-label"
                value={freedesktopMainCategory}
                onChange={(event) => onUpdateForm({
                  freedesktopMainCategory: event.target.value,
                  freedesktopAdditionalCategory: '',
                })}
                label="Type"
                margin="dense"
              >
                {freedesktopMainCategories
                  .map((val) => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel id="input-additional-category-label">Additional Category</InputLabel>
              <Select
                id="input-additional-category"
                labelId="input-additional-category-label"
                value={freedesktopAdditionalCategory === '' ? '_' : freedesktopAdditionalCategory}
                onChange={(event) => onUpdateForm({
                  freedesktopAdditionalCategory: event.target.value === '_' ? '' : event.target.value,
                })}
                label="Type"
                margin="dense"
              >
                <MenuItem value="_">(blank)</MenuItem>
                {freedesktopAdditionalCategories
                  .filter((val) => (!val.relatedMainCategories
                      || val.relatedMainCategories.includes(freedesktopMainCategory)))
                  .map((val) => (
                    <MenuItem key={val.name} value={val.name}>{val.name}</MenuItem>
                  ))}
              </Select>
              <FormHelperText>
                <span>
                  Specify which section of the system application menu this app belongs to.&nbsp;
                </span>
                <Link
                  onClick={() => requestOpenInBrowser('https://specifications.freedesktop.org/menu-spec/latest/apa.html')}
                  className={classes.link}
                >
                  Learn more about Freedesktop.org specifications
                </Link>
                <span>.</span>
              </FormHelperText>
            </FormControl>
          </>
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
          onClick={onCreate}
        >
          Install
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DialogCreateCustomApp.defaultProps = {
  applyIconTemplate: false,
  freedesktopAdditionalCategory: '',
  freedesktopMainCategory: 'Network',
  icon: null,
  internetIcon: null,
  name: '',
  nameError: null,
  url: '',
  urlError: null,
};

DialogCreateCustomApp.propTypes = {
  applyIconTemplate: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  downloadingIcon: PropTypes.bool.isRequired,
  freedesktopAdditionalCategory: PropTypes.string,
  freedesktopMainCategory: PropTypes.string,
  icon: PropTypes.string,
  internetIcon: PropTypes.string,
  name: PropTypes.string,
  nameError: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onGetIconFromAppSearch: PropTypes.func.isRequired,
  onGetIconFromInternet: PropTypes.func.isRequired,
  onUpdateForm: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  url: PropTypes.string,
  urlDisabled: PropTypes.bool.isRequired,
  urlError: PropTypes.string,
};

const mapStateToProps = (state) => {
  const {
    downloadingIcon,
    open,
    form: {
      applyIconTemplate,
      freedesktopAdditionalCategory,
      freedesktopMainCategory,
      icon,
      internetIcon,
      name,
      nameError,
      url,
      urlDisabled,
      urlError,
    },
  } = state.dialogCreateCustomApp;

  return {
    applyIconTemplate,
    downloadingIcon,
    freedesktopAdditionalCategory,
    freedesktopMainCategory,
    icon,
    internetIcon,
    name,
    nameError,
    open,
    url,
    urlDisabled,
    urlError,
  };
};

const actionCreators = {
  close,
  create,
  getIconFromInternet,
  getIconFromAppSearch,
  updateForm,
};

export default connectComponent(
  DialogCreateCustomApp,
  mapStateToProps,
  actionCreators,
  styles,
);
