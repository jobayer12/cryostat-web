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
import { FeatureLevel } from '@app/Shared/Services/Settings.service';
import { useSubscriptions } from '@app/utils/useSubscriptions';
import * as React from 'react';

export interface DynamicFeatureFlagProps {
  levels: FeatureLevel[];
  component: (level: FeatureLevel) => React.ReactNode;
  defaultComponent?: React.ReactNode;
}

export const DynamicFeatureFlag: React.FunctionComponent<DynamicFeatureFlagProps> = ({
  levels,
  component,
  defaultComponent,
}) => {
  const context = React.useContext(ServiceContext);
  const addSubscription = useSubscriptions();
  const [activeLevel, setActiveLevel] = React.useState(FeatureLevel.PRODUCTION);

  React.useLayoutEffect(() => {
    addSubscription(context.settings.featureLevel().subscribe((featureLevel) => setActiveLevel(featureLevel)));
  }, [addSubscription, context.settings, setActiveLevel]);

  const toRender = React.useMemo(() => {
    if (levels.includes(activeLevel)) {
      return component(activeLevel);
    }
    return defaultComponent;
  }, [levels, activeLevel, component, defaultComponent]);

  return <>{toRender}</>;
};

export interface FeatureFlagProps {
  strict?: boolean;
  level: FeatureLevel;
  children?: React.ReactNode | undefined;
}

export const FeatureFlag: React.FunctionComponent<FeatureFlagProps> = ({ level, strict, children }) => {
  const levels = React.useMemo(
    () => (strict ? [level] : [...Array.from({ length: level + 1 }, (_, i) => i)]),
    [strict, level]
  );
  const component = React.useCallback((_) => <>{children}</>, [children]);

  return (
    <>
      <DynamicFeatureFlag levels={levels} component={component} />
    </>
  );
};
