/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from '../components/dialog/savedialog.js';

import TextField from '../components/form/textfield.js';

import Icon from '../components/icon/icon.js';
import NewIcon from '../components/icon/newicon.js';

import Divider from '../components/layout/divider.js';
import Layout from '../components/layout/layout.js';

export const WizardContent = styled.div`
  margin: 0 20px;
`;

const IconContainer = styled.div`
  align-self: flex-start;
`;

export const WizardIcon = () => (
  <IconContainer>
    <Icon img="wizard.svg" size="large"/>
  </IconContainer>
);


const TaskWizard = ({
  hosts,
  title = _('Task Wizard'),
  onClose,
  onNewClick,
  onSave,
}) => (
  <SaveDialog
    buttonTitle={_('Start Scan')}
    title={title}
    onClose={onClose}
    onSave={onSave}
    defaultValues={{hosts}}
  >
    {({
      values: state,
      onValueChange,
    }) => (
      <Layout>
        <WizardIcon/>
        <WizardContent>
          <Divider flex="column">
            <p>
              <b>{_('Quick start: Immediately scan an IP address')}</b>
            </p>
            <Divider>
              <span>
                {_('IP address or hostname:')}
              </span>
              <TextField
                value={state.hosts}
                name="hosts"
                size="30"
                maxLength="2000"
                onChange={onValueChange}
              />
            </Divider>
            <div>
              {_('The default address is either your computer' +
                ' or your network gateway.')}
            </div>
            <Layout flex="column">
              {_('As a short-cut GSA will do the following for you:')}
              <ol>
                <li>{_('Create a new Target')}</li>
                <li>{_('Create a new Task')}</li>
                <li>{_('Start this scan task right away')}</li>
              </ol>
            </Layout>
            <p>
              {_('As soon as the scan progress is beyond 1%, you can already ' +
                'jump to the scan report via the link in the Reports Total ' +
                'column and review the results collected so far.')}
            </p>
            <p>
              {_('When creating the Target and Task GSA will use the defaults' +
                ' as configured in "My Settings".')}
            </p>
            <Divider>
              <span>
                {_('By clicking the New Task icon')}
              </span>
              <NewIcon
                title={_('New Task')}
                onClick={onNewClick}
              />
              <span>
                {_('you can create a new Task yourself.')}
              </span>
            </Divider>
          </Divider>
        </WizardContent>
      </Layout>
    )}
  </SaveDialog>
);

TaskWizard.propTypes = {
  hosts: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onNewClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default TaskWizard;

// vim: set ts=2 sw=2 tw=80:
