/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    color: theme.palette.text.primary,
  },
  title: {
    marginBottom: 8,
  },
  icon: {
    height: 112,
    width: 112,
  },
}));

const EmptyState = ({
  children,
  icon,
  title,
}) => {
  const classes = useStyles();

  const Icon = icon;

  return (
    <div className={classes.root}>
      <Icon className={classes.icon} color="action" />
      <br />
      {title && (
        <Typography
          className={classes.title}
          variant="h6"
          color="inherit"
        >
          {title}
        </Typography>
      )}
      {typeof children === 'string' ? (
        <Typography
          variant="subtitle1"
          align="center"
          color="inherit"
        >
          {children}
        </Typography>
      ) : children}
    </div>
  );
};

EmptyState.defaultProps = {
  children: null,
  title: null,
};

EmptyState.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
    PropTypes.string,
  ]),
  icon: PropTypes.object.isRequired,
  title: PropTypes.string,
};

export default EmptyState;
