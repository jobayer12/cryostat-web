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
 * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { TimePicker } from '@app/DateTimePicker/TimePicker';
import { useDayjs } from '@app/utils/useDayjs';
import { Timezone, defaultDatetimeFormat } from '@i18n/datetime';
import { isHourIn24hAM } from '@i18n/datetimeUtils';
import {
  ActionGroup,
  Bullseye,
  Button,
  CalendarMonth,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Tab,
  Tabs,
  TabTitleText,
  TextInput,
} from '@patternfly/react-core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TimezonePicker } from './TimezonePicker';

export interface DateTimePickerProps {
  onSelect?: (date: Date, timezone: Timezone) => void;
  prefilledDate?: Date; // timezone is ignored
  onDismiss: () => void;
}

type _TabKey = 'date' | 'time';

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ onSelect, onDismiss, prefilledDate }) => {
  const [t] = useTranslation();
  const [dayjs, _] = useDayjs();
  const [activeTab, setActiveTab] = React.useState<_TabKey>('date');
  const [datetime, setDatetime] = React.useState<Date>(new Date());
  const [timezone, setTimezone] = React.useState<Timezone>(defaultDatetimeFormat.timeZone); // Not affected by user preferences

  const handleTabSelect = React.useCallback(
    (_, key: string | number) => setActiveTab(`${key}` as _TabKey),
    [setActiveTab]
  );

  const handleSubmit = React.useCallback(() => {
    onSelect && onSelect(datetime, timezone);
  }, [datetime, timezone, onSelect]);

  const handleCalendarSelect = React.useCallback(
    (date: Date) => {
      setDatetime((old) => {
        const wrappedOld = dayjs(old);
        return dayjs(date).hour(wrappedOld.hour()).minute(wrappedOld.minute()).second(wrappedOld.second()).toDate();
      });
      setActiveTab('time'); // Switch to time
    },
    [setDatetime, setActiveTab, dayjs]
  );

  const handleHourChange = React.useCallback(
    (hrIn24h: number) => {
      setDatetime((old) => dayjs(old).hour(hrIn24h).toDate());
    },
    [setDatetime, dayjs]
  );

  const handleMinuteChange = React.useCallback(
    (m: number) => {
      setDatetime((old) => dayjs(old).minute(m).toDate());
    },
    [setDatetime, dayjs]
  );

  const handleSecondChange = React.useCallback(
    (s: number) => {
      setDatetime((old) => dayjs(old).second(s).toDate());
    },
    [setDatetime, dayjs]
  );

  const handleMeridiemChange = React.useCallback(
    (isAM: boolean) => {
      setDatetime((old) => {
        const oldDayjs = dayjs(old);
        if (isAM !== isHourIn24hAM(oldDayjs.hour())) {
          return (isAM ? oldDayjs.subtract(12, 'hour') : oldDayjs.add(12, 'hour')).toDate();
        }
        return old;
      });
    },
    [setDatetime, dayjs]
  );

  const selectedDatetimeDisplay = React.useMemo(() => dayjs(datetime).format('L LTS'), [datetime, dayjs]);

  React.useEffect(() => {
    if (prefilledDate) {
      setDatetime(new Date(prefilledDate));
    }
  }, [setDatetime, prefilledDate]);

  return (
    <Form>
      <Tabs
        aria-label={t('DateTimePicker.ARIA_LABELS.TABS') || ''}
        onSelect={handleTabSelect}
        activeKey={activeTab}
        isFilled
        role="region"
      >
        <Tab key={'date'} eventKey={'date'} title={<TabTitleText>{t('DATE', { ns: 'common' })}</TabTitleText>}>
          <FormGroup>
            <Bullseye>
              <CalendarMonth
                className="datetime-picker__calendar"
                isDateFocused
                locale={dayjs.locale()}
                inlineProps={{
                  component: 'article',
                  ariaLabelledby: 'start-date',
                }}
                style={{ padding: 0 }}
                date={datetime}
                onChange={handleCalendarSelect}
              />
            </Bullseye>
          </FormGroup>
        </Tab>
        <Tab key={'time'} eventKey={'time'} title={<TabTitleText>{t('TIME', { ns: 'common' })}</TabTitleText>}>
          <FormGroup>
            <Bullseye>
              <TimePicker
                selected={{
                  hour24: dayjs(datetime).hour(), // 24hr format
                  minute: dayjs(datetime).minute(),
                  second: dayjs(datetime).second(),
                }}
                onHourSelect={handleHourChange}
                onMinuteSelect={handleMinuteChange}
                onSecondSelect={handleSecondChange}
                onMeridiemSelect={handleMeridiemChange}
              />
            </Bullseye>
          </FormGroup>
        </Tab>
      </Tabs>
      <FormGroup label={t('DateTimePicker.SELECTED_DATETIME')}>
        <Flex>
          <FlexItem>
            <TextInput
              id="selected-datetime"
              aria-label={t('DateTimePicker.ARIA_LABELS.DISPLAY_SELECTED_DATETIME') || ''}
              className="datetime-picker__datetime-selected-display"
              readOnly
              value={selectedDatetimeDisplay}
            />
          </FlexItem>
          <FlexItem>
            <TimezonePicker menuAppendTo={document.body} onTimezoneChange={setTimezone} selected={timezone} isCompact />
          </FlexItem>
        </Flex>
      </FormGroup>
      <ActionGroup style={{ marginTop: 0 }}>
        <Button variant="primary" onClick={handleSubmit}>
          {t('SELECT', { ns: 'common' })}
        </Button>
        <Button variant="link" onClick={onDismiss}>
          {t('CANCEL', { ns: 'common' })}
        </Button>
      </ActionGroup>
    </Form>
  );
};
