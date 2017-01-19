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
import {is_defined} from '../../utils.js';

import Sort from '../sortby.js';

import Dashboard from '../dashboard/dashboard.js';

import EntitiesComponent from '../entities/component.js';
import EntitiesFooter from '../entities/footer.js';

import TableRow from '../table/row.js';
import TableHead from '../table/head.js';

import OverridesCharts from './charts.js';
import OverridesListRow from './overrideslistrow.js';

import {OVERRIDES_FILTER_FILTER} from '../../gmp/commands/filters.js';

const SORT_FIELDS = [
  ['text', _('Text')],
  ['nvt', _('Nvt')],
  ['severity', _('From')],
  ['new_severity', _('To')],
  ['active', _('Active')],
];

export class Overrides extends EntitiesComponent {

  constructor(props) {
    super(props, {
      name: 'overrides',
      icon_name: 'override.svg',
      download_name: 'overrides.xml',
      title: _('Overrides'),
      empty_title: _('No overrides available'),
      filter_filter: OVERRIDES_FILTER_FILTER,
      sort_fields: SORT_FIELDS,
    });
  }

  renderHeader() {
    let entities = this.getEntities();

    if (!is_defined(entities)) {
      return null;
    }

    return (
      <TableRow>
        <TableHead>
          <Sort by="text" onClick={this.onSortChange}>
            {_('Text')}
          </Sort>
        </TableHead>
        <TableHead>
          <Sort by="nvt" onClick={this.onSortChange}>
            {_('NVT')}
          </Sort>
        </TableHead>
        <TableHead>
          <Sort by="severity" onClick={this.onSortChange}>
            {_('From')}
          </Sort>
        </TableHead>
        <TableHead width="10em">
          <Sort by="new_severity" onClick={this.onSortChange}>
            {_('To')}
          </Sort>
        </TableHead>
        <TableHead>
          <Sort by="active" onClick={this.onSortChange}>
            {_('Active')}
          </Sort>
        </TableHead>
        <TableHead width="10em">
          {_('Actions')}
        </TableHead>
      </TableRow>
    );
  }

  renderFooter() {
    let {selection_type} = this.state;
    return (
      <EntitiesFooter span="6" download trash
        selectionType={selection_type}
        onTrashClick={this.onDeleteBulk}
        onDownloadClick={this.onDownloadBulk}
        onSelectionTypeChange={this.onSelectionTypeChange}>
      </EntitiesFooter>
    );
  }

  renderRow(override) {
    let {selection_type} = this.state;

    return (
      <OverridesListRow
        key={override.id}
        override={override}
        selection={selection_type}
        onSelected={this.onSelect}
        onDeselected={this.onDeselect}
        onDelete={this.reload}
        onCloned={this.reload}/>
    );
  }

  renderDashboard() {
    let {filter} = this.state;
    return (
      <Dashboard hide-filter-select
        filter={filter}
        config-pref-id="054862fe-0781-4527-b1aa-2113bcd16ce7"
        default-controllers-string={'override-by-active-days|' +
          'override-by-created|override-by-text-words'}
        default-controller-string="override-by-active-days">
        <OverridesCharts filter={filter}/>
      </Dashboard>
    );
  }
}

Overrides.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

export default Overrides;

// vim: set ts=2 sw=2 tw=80:
