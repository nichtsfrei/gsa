/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import React from 'react'; // eslint-disable-line max-lines

import {parse_int, for_each, map, is_array, is_defined, is_empty, first,
  includes_id, autobind, classes, select_save_id, extend} from '../../utils.js';
import _ from '../../locale.js';
import logger from '../../log.js';

import {OSP_SCANNER_TYPE, OPENVAS_SCANNER_TYPE, OSP_SCAN_CONFIG_TYPE,
  OPENVAS_SCAN_CONFIG_TYPE, OPENVAS_DEFAULT_SCANNER_ID, OPENVAS_CONFIG_EMPTY_ID,
  OPENVAS_CONFIG_FULL_AND_FAST_ID,
  SLAVE_SCANNER_TYPE} from '../../gmp/commands/scanners.js';

import Layout from '../layout.js';

import Dialog from '../dialog/dialog.js';

import Select2 from '../form/select2.js';
import Spinner from '../form/spinner.js';
import FormGroup from '../form/formgroup.js';
import Checkbox from '../form/checkbox.js';
import YesNoRadio from '../form/yesnoradio.js';
import Text from '../form/text.js';
import TextField from '../form/textfield.js';

import NewIcon from '../icons/newicon.js';

import ScheduleDialog from '../schedules/dialog.js';
import TargetsDialog from '../targets/dialog.js';
import AlertDialog from '../alerts/dialog.js';

import AddResultsToAssetsGroup from './addresultstoassetsgroup.js';
import AutoDeleteReportsGroup from './autodeletereportsgroup.js';

const log = logger.getLogger('web.tasks.dialog');

export class TaskDialog extends Dialog {

  constructor(...args) {
    super(...args);

    autobind(this, 'on');
  }

  defaultState() {
    return extend(super.defaultState(), {
      alerts: [],
      alert_ids: [],
      schedules: [],
      targets: [],
      tags: [],
      scanners: [],
      scan_configs: {0: [], 1: []},
      in_assets: 1,
      apply_overrides: 1,
      alterable: 0,
      auto_delete: 'keep',
      auto_delete_data: 5,
      add_tag: 0,
      scanner_type: 2,
      max_checks: 4,
      max_hosts: 20,
      min_qod: 70,
      schedule_periods: 0,
      hosts_ordering: 'sequential',
      name: _('unnamed'),
      schedule_id: 0,
      target_id: 0,
      width: 800,
    });
  }

  getSortedScanConfigs(scan_configs) {
    let sorted_scan_configs = {0: [], 1: []};
    for_each(scan_configs, config => {
      let type = parse_int(config.type);
      if (!is_array(sorted_scan_configs[type])) {
        sorted_scan_configs[type] = [];
      }
      sorted_scan_configs[type].push(config);
    });
    return sorted_scan_configs;
  }

  loadData() {
    let {task} = this.props;
    let {gmp, capabilities} = this.context;

    if (task) {
      log.debug(task);
      gmp.task.editTaskSettings(task).then(settings => {
        let {targets, scan_configs, alerts, scanners, schedules} = settings;

        log.debug('Loaded edit task dialog settings', settings);

        let sorted_scan_configs = this.getSortedScanConfigs(scan_configs);
        let osp_config_id = select_save_id(
          sorted_scan_configs[OSP_SCAN_CONFIG_TYPE], task.config.id);

        let openvas_config_id =  select_save_id(
          sorted_scan_configs[OPENVAS_SCAN_CONFIG_TYPE], task.config.id);

        let schedule_id;
        if (capabilities.mayOp('get_schedules') &&
          !is_empty(task.schedule.id)) {
          schedule_id = task.schedule.id;
        }
        else {
          schedule_id = 0;
        }

        this.setState({
          id: task.id,
          alert_ids: map(task.alerts, alert => alert.id),
          alerts,
          alterable: task.alterable,
          apply_overrides: task.apply_overrides,
          auto_delete: task.auto_delete,
          auto_delete_data: task.auto_delete_data,
          comment: task.comment,
          config_id: task.isAlterable() ? task.config.id : 0,
          in_assets: task.in_assets,
          osp_config_id: task.isAlterable() ? osp_config_id : 0,
          openvas_config_id: task.isAlterable() ? openvas_config_id : 0,
          min_qod: task.min_qod,
          name: task.name,
          scan_configs: sorted_scan_configs,
          scanner_id: task.isAlterable() ? task.scanner.id : 0,
          scanner_type: task.scanner.type,
          scanners,
          schedule_id,
          schedules,
          target_id: task.isAlterable() ?  task.target.id : 0,
          targets,
          task: task,
          visible: true,
        });
      });
    }
    else {
      gmp.task.newTaskSettings().then(settings => {
        let {schedule_id, alert_id, osp_config_id, target_id,
          targets, scanner_id = OPENVAS_DEFAULT_SCANNER_ID, scan_configs,
          config_id = OPENVAS_CONFIG_FULL_AND_FAST_ID, alerts, scanners,
          schedules, tags} = settings;

        log.debug('Loaded new task dialog settings', settings);

        let sorted_scan_configs = this.getSortedScanConfigs(scan_configs);

        scanner_id = select_save_id(scanners, scanner_id);

        let scanner = this.getScanner(scanner_id, scanners);

        target_id = select_save_id(targets, target_id);

        schedule_id = select_save_id(schedules, schedule_id, 0);

        alert_id = includes_id(alerts, alert_id) ? alert_id : undefined;

        let alert_ids = is_defined(alert_id) ? [alert_id] : [];

        osp_config_id = select_save_id(
          sorted_scan_configs[OSP_SCAN_CONFIG_TYPE], osp_config_id);
        config_id = select_save_id(
          sorted_scan_configs[OPENVAS_SCAN_CONFIG_TYPE], config_id);

        this.setState({
          alert_ids,
          alerts,
          config_id,
          scanners,
          scanner_id,
          scanner_type: is_defined(scanner) ? scanner.type : undefined,
          osp_config_id,
          openvas_config_id: config_id,
          scan_configs: sorted_scan_configs,
          schedule_id,
          schedules,
          tag_name: first(tags).name,
          tags,
          target_id,
          targets,
          visible: true,
        });
      });
    }
  }

  save() {
    let {gmp} = this.context;


    let promise;
    if (this.state.task) {
      promise = gmp.task.save(this.state);
    }
    else {
      promise = gmp.task.create(this.state);
    }

    return promise.then(() => {
      this.close();
    }, error => {
      this.showErrorMessageFromRejection(error);
      throw error;
    });
  }

  show() {
    this.setState(this.defaultState());
    this.loadData();
  }

  onAddTagChange(value) {
    log.debug('on tagvalue change', value);
    this.setState({add_tag: value ? 1 : 0});
  }

  onTargetIdChange(value) {
    let {task} = this.state;

    if (task) {
      if (task.isContainer() || !task.isAlterable()) {
        value = 0;
      }
    }
    log.debug('on targetid change', value);
    this.setState({target_id: value});
  }

  onScannerChange(value) {
    log.debug('on scanner change', value);
    let scanner = this.getScanner(value, this.state.scanners);
    let config_id;
    if (scanner.type === OPENVAS_SCANNER_TYPE ||
      scanner.type === SLAVE_SCANNER_TYPE) {
      config_id = this.state.openvas_config_id;
    }
    else if (scanner.type === OSP_SCANNER_TYPE) {
      config_id = this.state.osp_config_id;
    }
    else {
      config_id = 0;
    }
    this.setState({scanner_id: value, scanner_type: scanner.type, config_id});
  }

  onOpenvasScanConfigChange(value) {
    log.debug('on openvasscanconfig change', value);
    this.setState({config_id: value, openvas_config_id: value});
  }

  onOspScanConfigChange(value) {
    log.debug('on ospscanconfig change', value);
    this.setState({config_id: value, osp_config_id: value});
  }

  onSchedulePeriodsChange(value) {
    log.debug('on schedule periods change', value);
    this.setState({schedule_periods: value ? 1 : 0});
  }

  onAddNewSchedule(schedule) {
    let {schedules} = this.state;

    schedules.push(schedule);
    this.setState({schedules, schedule_id: schedule.id});
  }

  onAddNewTarget(target) {
    let {targets} = this.state;

    targets.push(target);
    log.debug('adding target to task dialog', target, targets);
    this.setState({targets, target_id: target.id});
  }

  onAddNewAlert(alert) {
    let {alerts, alert_ids} = this.state;

    alerts.push(alert);
    alert_ids.push(alert.id);
    log.debug('adding alert to task dialog', alert, alerts);
    this.setState({alerts, alert_ids});
  }

  getScanner(scanner_id, scanners) {
    return scanners.find(sc => {
      return sc.id === scanner_id;
    });
  }

  renderContent() {
    let {task, targets, schedules, tags, scanners, scan_configs, in_assets,
      apply_overrides, alterable, auto_delete, auto_delete_data, add_tag,
      max_checks, max_hosts, schedule_id, target_id, source_iface, tag_name,
      tag_value, min_qod, schedule_periods, hosts_ordering, comment, name,
      alerts, alert_ids, scanner_id, openvas_config_id, osp_config_id,
    } = this.state;
    let {capabilities} = this.context;

    let scanner = this.getScanner(scanner_id, scanners);

    let is_osp_scanner = is_defined(scanner) &&
      scanner.type === OSP_SCANNER_TYPE;

    let use_openvas_scan_config = is_defined(scanner) &&
      (scanner.type === OPENVAS_SCANNER_TYPE ||
        scanner.type === SLAVE_SCANNER_TYPE);

    let tag_opts = tags.map(tag => {
      return (
        <option key={tag.name} value={tag.name}>
          {tag.name}
        </option>
      );
    });

    let target_opts = this.renderOptions(targets);

    let schedule_opts = this.renderOptions(schedules, 0);

    let scanner_opts = this.renderOptions(scanners);

    let osp_scan_config_opts = is_osp_scanner && this.renderOptions(
      scan_configs[OSP_SCAN_CONFIG_TYPE]);

    let openvas_scan_config_opts = use_openvas_scan_config &&
      this.renderOptions(
        scan_configs[OPENVAS_SCAN_CONFIG_TYPE].filter(config => {
          // Skip the "empty" config
          return config.id !== OPENVAS_CONFIG_EMPTY_ID;
        }));

    let alert_opts = this.renderOptions(alerts);

    let change_task = task ? task.isAlterable() : true;

    return (
      <Layout flex="column">

        <FormGroup title={_('Name')}>
          <TextField
            name="name"
            grow="1"
            value={name}
            size="30"
            onChange={this.onValueChange}
            maxLength="80"/>
        </FormGroup>

        <FormGroup title={_('Comment')}>
          <TextField
            name="comment"
            value={comment}
            grow="1"
            size="30" maxLength="400"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Scan Targets')}>
          <Select2
            name="target_id"
            disabled={!change_task}
            onChange={this.onTargetIdChange}
            value={target_id}>
            {target_opts}
          </Select2>
          {change_task &&
            <Layout flex box>
              <NewIcon
                onClick={() => this.targets_dialog.show()}
                title={_('Create a new target')}/>
            </Layout>
          }
        </FormGroup>

        <FormGroup condition={capabilities.mayOp('get_alerts')}
          title={_('Alerts')}>
          <Select2
            name="alert_ids"
            multiple="multiple"
            id="alert_ids"
            onChange={this.onValueChange}
            value={alert_ids}>
            {alert_opts}
          </Select2>
          <Layout flex box>
            <NewIcon title={_('Create a new alert')}
              onClick={() => {this.alert_dialog.show();}}/>
          </Layout>
        </FormGroup>

        <FormGroup condition={capabilities.mayOp('get_schedules')}
          title={_('Schedule')}>
          <Select2
            name="schedule_id"
            value={schedule_id}
            onChange={this.onValueChange}>
            {schedule_opts}
          </Select2>
          <Checkbox name="schedule_periods"
            checked={schedule_periods === 1}
            onChange={this.onSchedulePeriodsChange}
            title={_('Once')}/>
          <Layout flex box>
            <NewIcon title={_('Create a new schedule')}
              onClick={() => { this.schedule_dialog.show(); }}/>
          </Layout>
        </FormGroup>


        <AddResultsToAssetsGroup
          inAssets={in_assets}
          onChange={this.onValueChange}/>

        <Layout flex="column"
          offset="2"
          className={classes('offset-container',
            in_assets === 1 ? '' : 'disabled')}>
          <FormGroup title={_('Apply Overrides')}>
            <YesNoRadio
              name="apply_overrides"
              value={apply_overrides}
              disabled={in_assets !== 1}
              onChange={this.onValueChange}/>
          </FormGroup>

          <FormGroup title={_('Min QoD')}>
            <Spinner
              name="min_qod"
              value={min_qod}
              size="4"
              onChange={this.onValueChange}
              disabled={in_assets !== 1}
              type="int"
              min="0" max="100"/>
            <Layout box float>%</Layout>
          </FormGroup>
        </Layout>

        <FormGroup title={_('Alterable Task')} condition={change_task}>
          <YesNoRadio
            name="alterable"
            value={alterable}
            disabled={!task.isNew()}
            onChange={this.onValueChange}/>
        </FormGroup>

        <AutoDeleteReportsGroup
          autoDelete={auto_delete}
          autoDeleteData={auto_delete_data}
          onChange={this.onValueChange}/>

        <FormGroup title={_('Scanner')}>
          <Select2
            name="scanner_id"
            value={scanner_id}
            disabled={!change_task}
            onChange={this.onScannerChange}>
            {scanner_opts}
          </Select2>
        </FormGroup>

        {use_openvas_scan_config &&
          <Layout float
            offset="2"
            className="offset-container">
            <Layout flex="column" grow="1">
              <FormGroup titleSize="4" title={_('Scan Config')}>
                <Select2 name="config_id" value={openvas_config_id}
                  disabled={!change_task}
                  onChange={this.onOpenvasScanConfigChange}>
                  {openvas_scan_config_opts}
                </Select2>
              </FormGroup>
              <FormGroup titleSize="4" title={_('Network Source Interface')}>
                <TextField
                  name="source_iface"
                  value={source_iface}
                  onChange={this.onValueChange}/>
              </FormGroup>
              <FormGroup titleSize="4" title={_('Order for target hosts')}>
                <Select2
                  name="hosts_ordering"
                  value={hosts_ordering}
                  onChange={this.onValueChange}>
                  <option value="sequential">
                    {_('Sequential')}
                  </option>
                  <option value="random">
                    {_('Random')}
                  </option>
                  <option value="reverse">
                    {_('Reverse')}
                  </option>
                </Select2>
              </FormGroup>
              <FormGroup titleSize="4"
                title={_('Maximum concurrently executed NVTs per host')}>
                <Spinner
                  name="max_checks"
                  value={max_checks}
                  min="0" size="10"
                  maxLength="10"
                  onChange={this.onValueChange}/>
              </FormGroup>
              <FormGroup titleSize="4"
                title={_('Maximum concurrently scanned hosts')}>
                <Spinner
                  name="max_hosts"
                  value={max_hosts}
                  type="int" min="0"
                  size="10"
                  maxLength="10"
                  onChange={this.onValueChange}/>
              </FormGroup>
            </Layout>
          </Layout>
        }

        {is_osp_scanner &&
          <Layout float
            offset="2"
            className="offset-container">
            <FormGroup titleSize="4" title={_('Scan Config')}>
              <Select2 name="config_id" value={osp_config_id}
                onChange={this.onOspScanConfigChange}>
                {osp_scan_config_opts}
              </Select2>
            </FormGroup>
          </Layout>
        }

        {capabilities.mayOp('get_tags') && capabilities.mayOp('create_task') &&
          tags.length > 0 &&
          <h3>{_('Tag')}</h3>
        }
        <FormGroup condition={capabilities.mayOp('get_tags') &&
          capabilities.mayOp('create_task') && tags.length > 0}>
          <Checkbox name="add_tag"
            onChange={this.onAddTagChange}
            checked={add_tag === 1} title={_('Add Tag:')}/>
          <Select2
            name="tag_name"
            onChange={this.onValueChange}
            value={tag_name}>
            {tag_opts}
          </Select2>
          <Text>
            {_('with Value')}
          </Text>
          <TextField
            name="tag_value"
            value={tag_value}
            onChange={this.onValueChange}/>
        </FormGroup>

      </Layout>
    );
  }

  renderSubDialogs() {
    return (
      <span>
        <ScheduleDialog title={_('Create new Schedule')}
          ref={ref => this.schedule_dialog = ref}
          onSave={this.onAddNewSchedule}/>
        <TargetsDialog title={_('Create new Target')}
          ref={ref => this.targets_dialog = ref} onSave={this.onAddNewTarget}/>
        <AlertDialog title={_('Create new Alert')}
          ref={ref => this.alert_dialog = ref} onSave={this.onAddNewAlert}/>
      </span>
    );
  }
}

TaskDialog.propTypes = {
  task: React.PropTypes.object,
};

TaskDialog.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

export default TaskDialog;

// vim: set ts=2 sw=2 tw=80:
