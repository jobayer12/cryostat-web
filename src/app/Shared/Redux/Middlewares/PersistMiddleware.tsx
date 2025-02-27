/*
 * Copyright The Cryostat Authors
 *
 * The Universal Permissive License (UPL), Version 1.0
 *
 * Subject to the condition set forth below, permission is hereby granted to any
 * person obtaining a copy of this software, associated documentation and/or data
 * (collectively the "Software"), free of charge and under any and all copyright
 * rights in the Software, and any and all patent rights owned or freely
 * licensable by each licensor hereunder covering either (i) the unmodified
 * Software as contributed to or provided by such licensor, or (ii) the Larger
 * Works (as defined below), to deal in both
 *
 * (a) the Software, and
 * (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if
 * one is included with the Software (each a "Larger Work" to which the Software
 * is contributed by such licensors),
 *
 * without restriction, including without limitation the rights to copy, create
 * derivative works of, display, perform, and distribute the Software and make,
 * use, sell, offer for sale, import, export, have made, and have sold the
 * Software and the Larger Work(s), and to sublicense the foregoing rights on
 * either these or other terms.
 *
 * This license is subject to the following condition:
 * The above copyright notice and either this complete permission notice or at
 * a minimum a reference to the UPL must be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { saveToLocalStorage } from '@app/utils/LocalStorage';
import { Middleware } from '@reduxjs/toolkit';
import { enumValues as DashboardConfigActions } from '../Configurations/DashboardConfigSlice';
import { enumValues as TopologyConfigActions } from '../Configurations/TopologyConfigSlice';
import { enumValues as AutomatedAnalysisFilterActions } from '../Filters/AutomatedAnalysisFilterSlice';
import { enumValues as RecordingFilterActions } from '../Filters/RecordingFilterSlice';
import { enumValues as TopologyFilterActions } from '../Filters/TopologyFilterSlice';
import { RootState } from '../ReduxStore';

/* eslint-disable-next-line  @typescript-eslint/ban-types*/
export const persistMiddleware: Middleware<{}, RootState> =
  ({ getState }) =>
  (next) =>
  (action) => {
    const result = next(action);
    // Extract new state here
    const rootState = getState();
    if (AutomatedAnalysisFilterActions.has(action.type)) {
      saveToLocalStorage('AUTOMATED_ANALYSIS_FILTERS', rootState.automatedAnalysisFilters);
    } else if (RecordingFilterActions.has(action.type)) {
      saveToLocalStorage('TARGET_RECORDING_FILTERS', rootState.recordingFilters);
    } else if (DashboardConfigActions.has(action.type)) {
      saveToLocalStorage('DASHBOARD_CFG', rootState.dashboardConfigs);
    } else if (TopologyConfigActions.has(action.type)) {
      saveToLocalStorage('TOPOLOGY_CONFIG', rootState.topologyConfigs);
    } else if (TopologyFilterActions.has(action.type)) {
      saveToLocalStorage('TOPOLOGY_FILTERS', rootState.topologyFilters);
    } else {
      console.warn(`Action ${action.type} does not persist state.`);
    }
    return result;
  };
