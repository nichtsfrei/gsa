/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from '../../locale.js';
import {select_save_id} from '../../utils.js';

import Layout from '../layout.js';

import {withDashboard} from '../dashboard/dashboard.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import HelpIcon from '../icons/helpicon.js';
import Icon from '../icons/icon.js';

import ContainerTaskDialog from '../tasks/containerdialog.js';

import ReportCharts from './charts.js';
import ReportFilterDialog from './filterdialog.js';
import ImportReportDialog from './importdialog.js';
import ReportsTable from './table.js';

import {REPORTS_FILTER_FILTER} from '../../gmp/models/filter.js';

const Dashboard = withDashboard(ReportCharts, {
  'hide-filter-select': true,
  'config-pref-id': 'Äe599bb6b-b95a-4bb2-a6bb-fe8ac69bc071',
  'default-controllers-string': 'report-by-severity-class|' +
  'report-by-high-results|report-by-cvss',
  'default-controller-string': 'report-by-cvss',
});

const ToolBarIcons = props => {
  return (
    <Layout flex box>
      <HelpIcon page="reports"/>
      <Icon size="small"
        title={_('Upload report')}
        img="upload.svg"
        onClick={props.onUploadReportClick}/>
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onUploadReportClick: React.PropTypes.func,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDialogSave = this.handleDialogSave.bind(this);
    this.handleCreateContainerTask = this.handleCreateContainerTask.bind(this);
    this.openImportDialog = this.openImportDialog.bind(this);
    this.openCreateTaskDialog = this.openCreateTaskDialog.bind(this);
  }

  showImportDialog(tasks, task_id) {
    this.import_dialog.show({
      tasks,
      in_assets: 1,
      task_id: select_save_id(tasks, task_id),
    });
  }

  openImportDialog(task_id) {
    let {gmp} = this.context;
    gmp.tasks.get()
      .then(tasks => tasks.filter(task => task.isContainer()))
      .then(tasks => this.showImportDialog(tasks, task_id));
  }

  openCreateTaskDialog() {
    this.container_task_dialog.show();
  }

  handleDialogSave(data) {
    let {gmp} = this.context;
    let {onChanged} = this.props;
    return gmp.report.import(data).then(() => onChanged());
  }

  handleCreateContainerTask(data) {
    let {gmp} = this.context;
    return gmp.task.createContainer(data).then(task => {
      this.openImportDialog(task.id);
    });
  }

  render() {
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onUploadReportClick={this.openImportDialog}
        />
        <ImportReportDialog
          ref={ref => this.import_dialog = ref}
          onNewContainerTaskClick={this.openCreateTaskDialog}
          onSave={this.handleDialogSave}/>
        <ContainerTaskDialog
          ref={ref => this.container_task_dialog = ref}
          onSave={this.handleCreateContainerTask}/>
      </Layout>
    );
  }
}

Page.propTypes = {
  onChanged: React.PropTypes.func,
};

Page.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default withEntitiesContainer(Page, 'reports', {
  filtersFilter: REPORTS_FILTER_FILTER,
  dashboard: Dashboard,
  title: _('Reports'),
  sectionIcon: 'report.svg',
  filterEditDialog: ReportFilterDialog,
  toolBarIcons: ToolBarIcons,
  table: ReportsTable,
  actions: false,
});

// vim: set ts=2 sw=2 tw=80:
