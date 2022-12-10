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
import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit';
import { dashboardConfigReducer } from './DashboardConfigReducer';
import { recordingFilterReducer } from './RecordingFilterReducer';
import { automatedAnalysisFilterReducer } from './AutomatedAnalysisFilterReducer';

export const rootReducer = combineReducers({
  dashboardConfigs: dashboardConfigReducer,
  recordingFilters: recordingFilterReducer,
  automatedAnalysisFilters: automatedAnalysisFilterReducer,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

export const store = setupStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
export type StateDispatch = typeof store.dispatch;
export type Store = ReturnType<typeof setupStore>;

// Add a subscription to save filter states to local storage
// if states change.
store.subscribe(() => {
  saveToLocalStorage('DASHBOARD_CFG', store.getState().dashboardConfigs.list);
  saveToLocalStorage('TARGET_RECORDING_FILTERS', store.getState().recordingFilters.list);
  saveToLocalStorage('AUTOMATED_ANALYSIS_FILTERS', store.getState().automatedAnalysisFilters.state);
});
