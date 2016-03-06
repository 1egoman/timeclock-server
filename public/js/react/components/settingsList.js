import React from 'react';
import {connect} from 'react-redux';
import {getUserBadge} from '../helpers/provider_badge';
import {
  resetBadgeTokenForUser,
  changeSetting,
  preemptiveSettingUpdate,
} from '../actions/settings';

export function settingsListComponent({
  user,
  settings,

  resetToken,
  changeLongWorkPeriodDuration,
}) {
  if (user) {
    return <div className="settings-list">
      {/* general user info */}
      <div className="col-md-12">
        <div className="panel panel-default">
          <div className="panel-heading">Waltz Settings</div>
          <div className="panel-body">
            <img className="avatar-img" src={user.avatar} />
            <h1>
              {user.username}
              <span className="setting-list-provider-badge">
                {getUserBadge(user)}
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* badge / report token */}
      <div className="col-md-6">
        <div className="panel panel-default panel-half-height">
          <div className="panel-heading">Badge Token</div>
          <div className="panel-body">
            <p>
              This token is used to provide authentication on your behalf to private
              embedded badges and reports that are sent to others who may not be logged in.
              Resetting this token will <strong>break all existing private badges and and links to private
              invoices.</strong>
            </p>
            <div className="badge-token-box">
              <div className="token-box">
                {user.badge_token || <i className="fa fa-spinner fa-spin"></i>}
              </div>
              <div className="token-btn">
                <button className="btn btn-info" onClick={resetToken(user)}>
                  Reset token
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* health */}
      <div className="col-md-6">
        <div className="panel panel-default panel-half-height">
          <div className="panel-heading">Long work period duration</div>
          <div className="panel-body">
            <p>
              Long work periods have been linked to muscle fatigue, RSI, headaches, and more.
              Waltz can warn you when a work period exceeds a predetermined amount,
              giving you a metric for tracking the harmful effects of long-term computer usage.
            </p>
            <div className="input-group">
              <div className="input-group-addon">A long work period is</div>
              <input
                type="number"
                className="form-control"
                value={settings.long_work_period}
                onChange={changeLongWorkPeriodDuration}
              />
              <div className="input-group-addon">minutes long or more.</div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  } else {
    return <div className="settings-list settings-list-loading">
      Loading settings...
    </div>;
  }
}

const settingsList = connect((store, props) => {
  return {
    user: store.user,
    settings: store.user ? store.user.settings : null,
  };
}, (dispatch, props) => {
  return {
    resetToken(user) {
      return () => dispatch(resetBadgeTokenForUser(user));
    },

    changeLongWorkPeriodDuration(event) {
      let setting = {
        long_work_period: event.target.value,
      };
      // update the setting locally, and push the change remotely.
      dispatch(changeSetting(setting));
      dispatch(preemptiveSettingUpdate(setting));
    },
  };
})(settingsListComponent);

export default settingsList;
