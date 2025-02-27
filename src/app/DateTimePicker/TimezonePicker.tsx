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

import { useDayjs } from '@app/utils/useDayjs';
import { supportedTimezones, Timezone } from '@i18n/datetime';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { GlobeIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export const DEFAULT_NUM_OPTIONS = 10;

export const OPTION_INCREMENT = 15;

export interface TimezonePickerProps {
  isFlipEnabled?: boolean;
  isCompact?: boolean;
  menuAppendTo?: HTMLElement | (() => HTMLElement) | 'inline' | 'parent' | undefined;
  onTimezoneChange?: (timezone: Timezone) => void;
  selected: Timezone;
}

export const TimezonePicker: React.FunctionComponent<TimezonePickerProps> = ({
  isFlipEnabled = true,
  isCompact,
  menuAppendTo = 'parent',
  selected,
  onTimezoneChange = (_) => undefined,
}) => {
  const [t] = useTranslation();
  const [dayjs, _] = useDayjs();
  const [numOfOptions, setNumOfOptions] = React.useState(DEFAULT_NUM_OPTIONS);
  const [isTimezoneOpen, setIsTimezoneOpen] = React.useState(false);

  const onSelect = React.useCallback(
    (_, timezone, isPlaceholder) => {
      if (isPlaceholder) {
        return;
      }
      setIsTimezoneOpen(false);
      onTimezoneChange({
        full: timezone.full,
        short: timezone.short,
      });
    },
    [onTimezoneChange, setIsTimezoneOpen]
  );

  const timezones = React.useMemo(() => supportedTimezones(), []);

  const handleViewMore = React.useCallback(
    (_e: React.MouseEvent) => {
      setNumOfOptions((old) => Math.min(old + OPTION_INCREMENT, timezones.length));
    },
    [setNumOfOptions, timezones]
  );

  const mapToSelection = React.useCallback(
    (timezone: Timezone, isCompact?: boolean) => {
      return (
        <SelectOption
          key={timezone.full}
          value={{
            ...timezone,
            toString: () => timezone.full,
            compareTo: (val) => timezone.full === val.full,
          }}
          description={isCompact ? timezone.full : timezone.short}
        >
          {isCompact ? timezone.short : `(UTC${dayjs().tz(timezone.full).format('Z')}) ${timezone.full}`}
        </SelectOption>
      );
    },
    [dayjs]
  );

  const options = React.useMemo(() => {
    return timezones
      .slice(0, numOfOptions)
      .map((timezone) => mapToSelection(timezone, isCompact))
      .concat(
        numOfOptions < timezones.length
          ? [
              <SelectOption key="view-more" isPlaceholder onClick={handleViewMore}>
                <span className={css('pf-c-button', 'pf-m-link', 'pf-m-inline')}>
                  {t('VIEW_MORE', { ns: 'common' })}
                </span>
              </SelectOption>,
            ]
          : []
      );
  }, [isCompact, timezones, numOfOptions, t, handleViewMore, mapToSelection]);

  const onFilter = React.useCallback(
    (_: React.ChangeEvent<HTMLInputElement> | null, value: string) => {
      if (!value) {
        return options;
      }
      const matchExp = new RegExp(value.replace(/([+])/gi, `\\$1`), 'i');
      return timezones
        .filter((op) => matchExp.test(op.full) || matchExp.test(op.short))
        .map((t) => mapToSelection(t, isCompact));
    },
    [timezones, options, isCompact, mapToSelection]
  );

  return (
    <Select
      variant={SelectVariant.single}
      onToggle={setIsTimezoneOpen}
      isFlipEnabled={isFlipEnabled}
      menuAppendTo={menuAppendTo}
      maxHeight="16em"
      width={isCompact ? '8.5em' : undefined}
      selections={{
        ...selected,
        toString: () => selected.full,
        compareTo: (val) => selected.full === val.full,
      }}
      onSelect={onSelect}
      onFilter={onFilter}
      hasInlineFilter
      aria-label={t('TimezonePicker.ARIA_LABELS.SELECT') || ''}
      typeAheadAriaLabel={t('TimezonePicker.ARIA_LABELS.TYPE_AHEAD') || ''}
      isOpen={isTimezoneOpen}
      toggleIndicator={<GlobeIcon />}
    >
      {options}
    </Select>
  );
};
