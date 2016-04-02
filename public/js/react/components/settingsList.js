import React from 'react';
import {connect} from 'react-redux';
import {getUserBadge} from '../helpers/provider_badge';
import {
  resetBadgeTokenForUser,
  changeSetting,
  preemptiveSettingUpdate,
} from '../actions/settings';
import {Button, Input} from 'react-bootstrap';
import EmailValidator from 'email-validator';

// user info pane
export function userInfo({settings, user, changePaymentEmail, validateEmail}) {
  return <div className="panel panel-default">
    <div className="panel-heading">Waltz Settings</div>
    <div className="panel-body">
      <img className="avatar-img" src={user.avatar} />
      <h1>
        {user.username}
        <span className="setting-list-provider-badge">
          {getUserBadge(user)}
        </span>
      </h1>

      <div className="setting-list-payment-email">
        <Input
          type="text"
          label="Payment email"
          placeholder={user.email}
          value={settings.payment_email}
          onChange={changePaymentEmail}
        />
      </div>
    </div>
  </div>;
}

export function badgeToken({user, resetToken}) {
  return <div className="panel panel-default panel-half-height">
    <div className="panel-heading">Badge Token</div>
    <div className="panel-body">
      <p>
        This token is used to provide authentication on your behalf to private
        embedded badges and reports that are sent to others who may not be logged in.
        Resetting this token will <strong>break all existing private badges and and links to private
        timecards.</strong>
      </p>
      <div className="badge-token-box">
        <div className="token-box">
          {user.badge_token || <i className="fa fa-spinner fa-spin"></i>}
        </div>
        <div className="token-btn">
          <Button bsStyle="info" onClick={resetToken(user)}>
            Reset token
          </Button>
        </div>
      </div>
    </div>
  </div>
}

export function longWorkPeriod({settings, changeLongWorkPeriodDuration}) {
  return <div className="panel panel-default panel-half-height">
    <div className="panel-heading">Long work period duration</div>
    <div className="panel-body">
      <p>
        Long work periods have been linked to muscle fatigue, RSI, headaches, and more.
        Waltz can warn you when a work period exceeds a predetermined amount,
        giving you a metric for tracking the harmful effects of long-term computer usage.
      </p>
      <Input
        type="number"
        addonBefore="A long work period is"
        addonAfter="minutes or longer."
        value={settings.long_work_period}
        onChange={changeLongWorkPeriodDuration}
      />
    </div>
  </div>;
}

export function settingsListComponent({
  user,
  settings,

  resetToken,
  changeLongWorkPeriodDuration,
  changePaymentEmail,
  validateEmail,
}) {
  if (user) {
    return <div className="settings-list">
      {/* general user info */}
      <div className="col-md-12">
        {userInfo({user, settings, changePaymentEmail, validateEmail})}
      </div>

      {/* badge / report token */}
      <div className="col-md-6">
        {badgeToken({user, resetToken})}
      </div>

      {/* health */}
      <div className="col-md-6">
        {longWorkPeriod({settings, changeLongWorkPeriodDuration})}
      </div>
    </div>;
  } else {
    return <div className="settings-list settings-list-loading">
      Loading settings...
    </div>;
  }
}

export function mapStateToProps(store, props) {
  return {
    user: store.user,
    settings: store.user ? store.user.settings : null,
  };
};

const settingsList = connect(mapStateToProps, (dispatch, props) => {
  return {
    resetToken(user) {
      return () => dispatch(resetBadgeTokenForUser(user));
    },

    changeLongWorkPeriodDuration(event) {
      let setting = { long_work_period: event.target.value };
      // update the setting locally, and push the change remotely.
      dispatch(changeSetting(setting));
      dispatch(preemptiveSettingUpdate(setting));
    },

    validateEmail(email) {
      return EmailValidator.validate(email);
    },

    changePaymentEmail(event) {
      let value = event.target.value;
      let setting = { payment_email: value };
      // update the setting locally, and push the change remotely.
      dispatch(changeSetting(setting));
      dispatch(preemptiveSettingUpdate(setting));
    },
  };
})(settingsListComponent);

export default settingsList;
