import {
  DIALOG_PROXY_CLOSE,
  DIALOG_PROXY_FORM_UPDATE,
  DIALOG_PROXY_OPEN,
} from '../../constants/actions';

import validate from '../../helpers/validate';
import hasErrors from '../../helpers/has-errors';

import {
  requestSetPreference,
} from '../../senders';

export const close = () => ({
  type: DIALOG_PROXY_CLOSE,
});

export const open = () => ({
  type: DIALOG_PROXY_OPEN,
});

const getValidationRules = (proxyType) => {
  if (proxyType === 'rules') {
    return {
      proxyRules: {
        fieldName: 'Proxy address',
        required: true,
      },
    };
  }
  if (proxyType === 'pacScript') {
    return {
      proxyPacScript: {
        fieldName: 'Script URL',
        required: true,
      },
    };
  }
  return {};
};

export const updateForm = (changes) => (dispatch, getState) => {
  const state = getState();

  const { form } = state.dialogProxy;

  // revalidate all fields if proxy type changes
  if (changes.proxyType) {
    const validatedChanges = validate(
      { ...form, ...changes },
      getValidationRules(changes.proxyType),
    );
    dispatch({
      type: DIALOG_PROXY_FORM_UPDATE,
      changes: validatedChanges,
    });
  } else {
    dispatch({
      type: DIALOG_PROXY_FORM_UPDATE,
      changes: validate(changes, getValidationRules(form.proxyType)),
    });
  }
};

export const save = () => (dispatch, getState) => {
  const state = getState();

  const { form } = state.dialogProxy;

  const validatedChanges = validate(form, getValidationRules(form.proxyType));
  if (hasErrors(validatedChanges)) {
    return dispatch(updateForm(validatedChanges));
  }

  requestSetPreference('proxyRules', form.proxyRules);
  requestSetPreference('proxyBypassRules', form.proxyBypassRules);
  requestSetPreference('proxyPacScript', form.proxyPacScript);
  requestSetPreference('proxyType', form.proxyType);

  dispatch(close());
  return null;
};
