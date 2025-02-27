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
/* eslint-disable @typescript-eslint/no-explicit-any */
export enum LocalStorageKey {
  ASSET_VERSION,
  FEATURE_LEVEL,
  DASHBOARD_CFG,
  AUTOMATED_ANALYSIS_FILTERS,
  TARGET_RECORDING_FILTERS,
  CREDENTIAL_LOCATION,
  TARGET,
  TARGET_FAVORITES,
  TOPOLOGY_GRAPH_POSITONS,
  TOPOLOGY_NODE_POSITIONS,
  TOPOLOGY_CONFIG,
  TOPOLOGY_FILTERS,
  AUTO_REFRESH_ENABLED,
  AUTO_REFRESH_PERIOD,
  AUTO_REFRESH_UNITS,
  AUTOMATED_ANALYSIS_RECORDING_CONFIG,
  CHART_CONTROLLER_CONFIG,
  DELETION_DIALOGS_ENABLED,
  VISIBLE_NOTIFICATIONS_COUNT,
  NOTIFICATIONS_ENABLED,
  WEBSOCKET_DEBOUNCE_MS,
  DATETIME_FORMAT,
  MATCH_EXPRES_VIS_GRAPH_POSITIONS,
  MATCH_EXPRES_VIS_NODE_POSITIONS,
  THEME,
}

export type LocalStorageKeyStrings = keyof typeof LocalStorageKey;

export const getFromLocalStorage = (key: LocalStorageKeyStrings, defaultValue: any): any => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

export const saveToLocalStorage = (key: LocalStorageKeyStrings, value: any, error?: () => void) => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn(err);
    error && error();
  }
};

export const removeFromLocalStorage = (key: LocalStorageKeyStrings, error?: () => void): any => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(err);
    error && error();
  }
};
