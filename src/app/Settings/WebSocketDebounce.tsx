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

import { ServiceContext } from '@app/Shared/Services/Services';
import { NumberInput } from '@patternfly/react-core';
import * as React from 'react';
import { SettingTab, UserSetting } from './SettingsUtils';

const defaultPreferences = {
  webSocketDebounceMs: 100,
};

const debounceMin = 1;
const debounceMax = 1000;

const Component = () => {
  const context = React.useContext(ServiceContext);
  const [state, setState] = React.useState(defaultPreferences);

  React.useLayoutEffect(() => {
    setState({
      webSocketDebounceMs: context.settings.webSocketDebounceMs(),
    });
  }, [setState, context.settings]);

  const handleWebSocketDebounceMinus = React.useCallback(() => {
    setState((state) => {
      const newState = { ...state };
      let debounce = (state.webSocketDebounceMs || 1) - 1;
      if (debounce < debounceMin) {
        debounce = debounceMin;
      }
      newState.webSocketDebounceMs = debounce;
      context.settings.setWebSocketDebounceMs(newState.webSocketDebounceMs);
      return newState;
    });
  }, [setState, context.settings]);

  const handleWebSocketDebouncePlus = React.useCallback(() => {
    setState((state) => {
      const newState = { ...state };
      let debounce = (state.webSocketDebounceMs || 1) + 1;
      if (debounce > debounceMax) {
        debounce = debounceMax;
      }
      newState.webSocketDebounceMs = debounce;
      context.settings.setWebSocketDebounceMs(newState.webSocketDebounceMs);
      return newState;
    });
  }, [setState, context.settings]);

  const handleWebSocketDebounceChange = React.useCallback(
    (event) => {
      setState((state) => {
        let next = isNaN(event.target.value) ? state.webSocketDebounceMs : Number(event.target.value);
        if (state.webSocketDebounceMs < debounceMin) {
          next = debounceMin;
        } else if (state.webSocketDebounceMs > debounceMax) {
          next = debounceMax;
        }
        context.settings.setWebSocketDebounceMs(next);
        return { ...state, webSocketDebounceMs: next };
      });
    },
    [setState, context.settings]
  );

  return (
    <>
      <NumberInput
        value={state.webSocketDebounceMs}
        min={debounceMin}
        max={debounceMax}
        onChange={handleWebSocketDebounceChange}
        onMinus={handleWebSocketDebounceMinus}
        onPlus={handleWebSocketDebouncePlus}
        unit="ms"
      />
    </>
  );
};

export const WebSocketDebounce: UserSetting = {
  titleKey: 'SETTINGS.WEBSOCKET_CONNECTION_DEBOUNCE.TITLE',
  descConstruct: 'SETTINGS.WEBSOCKET_CONNECTION_DEBOUNCE.DESCRIPTION',
  content: Component,
  category: SettingTab.CONNECTIVITY,
};
