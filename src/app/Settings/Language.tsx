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
import { FeatureLevel } from '@app/Shared/Services/Settings.service';
import { i18nLanguages, i18nResources } from '@i18n/config';
import { localeReadable } from '@i18n/i18nextUtil';
import { Select, SelectOption } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingTab, UserSetting } from './SettingsUtils';

const Component = () => {
  const [t, i18n] = useTranslation();
  const [open, setOpen] = React.useState(false);

  const handleLanguageToggle = React.useCallback(() => setOpen((v) => !v), [setOpen]);

  const handleLanguageSelect = React.useCallback(
    (_, v) => {
      i18n.changeLanguage(v);
      setOpen(false);
    },
    [i18n, setOpen]
  );

  React.useEffect(() => {
    if (!i18nLanguages.includes(i18n.language)) {
      i18n.changeLanguage('en');
    }
  }, [i18n, i18n.language]);

  return (
    <Select
      isOpen={open}
      aria-label={t('SETTINGS.LANGUAGE.ARIA_LABELS.SELECT') || ''}
      onToggle={handleLanguageToggle}
      onSelect={handleLanguageSelect}
      selections={localeReadable(i18n.language)}
      isFlipEnabled
      menuAppendTo="parent"
    >
      {Object.keys(i18nResources).map((l) => (
        <SelectOption key={l} value={l}>
          {localeReadable(l)}
        </SelectOption>
      ))}
    </Select>
  );
};

export const Language: UserSetting = {
  titleKey: 'SETTINGS.LANGUAGE.TITLE',
  descConstruct: 'SETTINGS.LANGUAGE.DESCRIPTION',
  content: Component,
  category: SettingTab.GENERAL,
  orderInGroup: 1,
  featureLevel: FeatureLevel.BETA,
};
