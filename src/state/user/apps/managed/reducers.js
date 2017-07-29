import {
  MANAGED_APP_SET,
  MANAGED_APP_REMOVE,
} from '../../../../constants/actions';

const appsInitialState = {};
const apps = (state = appsInitialState, action) => {
  switch (action.type) {
    case MANAGED_APP_SET: {
      const updatedManagedApps = state;

      updatedManagedApps[action.id] = {
        status: action.status,
        app: action.app,
      };

      return { ...state, ...updatedManagedApps };
    }
    case MANAGED_APP_REMOVE: {
      const updatedManagedApps = state;

      delete updatedManagedApps[action.id];

      return { ...state, ...updatedManagedApps };
    }
    default:
      return state;
  }
};

export default apps;
