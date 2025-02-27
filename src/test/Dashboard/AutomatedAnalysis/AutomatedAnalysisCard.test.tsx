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
import { AutomatedAnalysisCard } from '@app/Dashboard/AutomatedAnalysis/AutomatedAnalysisCard';
import { LayoutTemplate, LayoutTemplateRecord } from '@app/Dashboard/dashboard-utils';
import { DashboardConfigState } from '@app/Shared/Redux/Configurations/DashboardConfigSlice';
import { TopologyConfig } from '@app/Shared/Redux/Configurations/TopologyConfigSlice';
import {
  emptyActiveRecordingFilters,
  emptyArchivedRecordingFilters,
  TargetRecordingFilters,
} from '@app/Shared/Redux/Filters/RecordingFilterSlice';
import { TopologyFilters } from '@app/Shared/Redux/Filters/TopologyFilterSlice';
import { RootState } from '@app/Shared/Redux/ReduxStore';
import {
  ArchivedRecording,
  automatedAnalysisRecordingName,
  defaultAutomatedAnalysisRecordingConfig,
} from '@app/Shared/Services/Api.service';
import {
  CachedReportValue,
  FAILED_REPORT_MESSAGE,
  NO_RECORDINGS_MESSAGE,
  RuleEvaluation,
} from '@app/Shared/Services/Report.service';
import { defaultServices } from '@app/Shared/Services/Services';
import { automatedAnalysisConfigToRecordingAttributes } from '@app/Shared/Services/Settings.service';
import '@testing-library/jest-dom';
import { cleanup, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { of } from 'rxjs';
import { renderWithServiceContextAndReduxStore, testT } from '../../Common';

jest.mock('@app/Dashboard/AutomatedAnalysis/AutomatedAnalysisCardList', () => {
  return {
    ...jest.requireActual('@app/Dashboard/AutomatedAnalysis/AutomatedAnalysisCardList'),
    AutomatedAnalysisCardList: jest.fn(() => {
      return <div>AutomatedAnalysisCardList</div>;
    }),
  };
});

const mockTarget = { connectUrl: 'service:jmx:rmi://someUrl', alias: 'fooTarget' };

const mockEmptyCachedReport: CachedReportValue = {
  report: [],
  timestamp: 0,
};

const mockRuleEvaluation1: RuleEvaluation = {
  name: 'rule1',
  description: 'rule1 description',
  score: 100,
  topic: 'myTopic',
};

const mockRuleEvaluation2: RuleEvaluation = {
  name: 'rule2',
  description: 'rule2 description',
  score: 0,
  topic: 'fakeTopic',
};

const mockRuleEvaluation3: RuleEvaluation = {
  name: 'rule3',
  description: 'rule3 description',
  score: 55,
  topic: 'fakeTopic',
};

const mockNaRuleEvaluation: RuleEvaluation = {
  name: 'N/A rule',
  description: 'N/A description',
  score: -1,
  topic: 'fakeTopic',
};

const mockEvaluations: RuleEvaluation[] = [mockRuleEvaluation1];

const mockFilteredEvaluations: RuleEvaluation[] = [
  mockRuleEvaluation1,
  mockRuleEvaluation2,
  mockRuleEvaluation3,
  mockNaRuleEvaluation,
];

const mockRecording = {
  name: 'someRecording',
};

const mockArchivedRecording: ArchivedRecording = {
  name: 'someArchivedRecording',
  downloadUrl: '',
  reportUrl: '',
  metadata: { labels: {} },
  size: 0,
  archivedTime: 1663027200000, // 2022-09-13T00:00:00.000Z in milliseconds
};

const mockCachedReport: CachedReportValue = {
  report: [mockRuleEvaluation1, mockRuleEvaluation2],
  timestamp: 1663027200000, // 2022-09-13T00:00:00.000Z in milliseconds
};

const mockTargetNode = {
  recordings: {
    active: {
      data: [mockRecording],
    },
  },
};

const mockActiveRecordingsResponse = {
  data: {
    targetNodes: [mockTargetNode],
  },
};

const mockEmptyActiveRecordingsResponse = {
  data: {
    targetNodes: [
      {
        recordings: {
          active: {
            data: [],
          },
        },
      },
    ],
  },
};

const mockArchivedRecordingsResponse = {
  data: {
    archivedRecordings: {
      data: [mockArchivedRecording],
    },
  },
};

const mockEmptyArchivedRecordingsResponse = {
  data: {
    archivedRecordings: {
      data: [],
    },
  },
};

jest.spyOn(defaultServices.target, 'target').mockReturnValue(of(mockTarget));
jest.spyOn(defaultServices.target, 'authFailure').mockReturnValue(of());
jest.spyOn(defaultServices.target, 'authRetry').mockReturnValue(of());

describe('<AutomatedAnalysisCard />', () => {
  let preloadedState: RootState;

  beforeEach(() => {
    preloadedState = {
      dashboardConfigs: {
        layouts: [
          {
            name: 'Default',
            cards: [],
            favorite: false,
          },
        ],
        current: 0,
        _version: '0',
        customTemplates: [] as LayoutTemplate[],
        templateHistory: [] as LayoutTemplateRecord[],
      } as DashboardConfigState,
      recordingFilters: {
        list: [
          {
            target: mockTarget.connectUrl,
            active: {
              selectedCategory: 'Labels',
              filters: emptyActiveRecordingFilters,
            },
            archived: {
              selectedCategory: 'Name',
              filters: emptyArchivedRecordingFilters,
            },
          } as TargetRecordingFilters,
        ],
      },
      automatedAnalysisFilters: {
        state: {
          targetFilters: [],
          globalFilters: {
            filters: {
              Score: 100,
            },
          },
        },
      },
      topologyConfigs: {} as TopologyConfig,
      topologyFilters: {} as TopologyFilters,
    };
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('renders report generation error view correctly', async () => {
    jest.spyOn(defaultServices.api, 'graphql').mockReturnValueOnce(of(mockActiveRecordingsResponse));
    jest.spyOn(defaultServices.reports, 'reportJson').mockReturnValueOnce(of());
    renderWithServiceContextAndReduxStore(<AutomatedAnalysisCard dashboardId={0} span={0} />, {
      preloadState: preloadedState,
    });

    expect(screen.getByText(testT('AutomatedAnalysisCard.ERROR_TITLE'))).toBeInTheDocument(); // Error view
    expect(screen.getByText(FAILED_REPORT_MESSAGE)).toBeInTheDocument(); // Error message
    expect(screen.getByText(testT('AutomatedAnalysisCard.ERROR_TEXT'))).toBeInTheDocument(); // Error details
    expect(screen.getByRole('button', { name: testT('AutomatedAnalysisCard.RETRY_LOADING') })).toBeInTheDocument(); // Retry button
    expect(screen.queryByLabelText(testT('AutomatedAnalysisCard.TOOLBAR.LABEL'))).not.toBeInTheDocument(); // Toolbar
  });

  it('renders empty recordings error view and creates recording when clicked', async () => {
    jest.spyOn(defaultServices.api, 'graphql').mockReturnValueOnce(of(mockEmptyActiveRecordingsResponse));
    jest.spyOn(defaultServices.reports, 'getCachedAnalysisReport').mockReturnValueOnce(mockEmptyCachedReport);
    jest.spyOn(defaultServices.api, 'graphql').mockReturnValueOnce(of(mockEmptyArchivedRecordingsResponse));

    jest.spyOn(defaultServices.api, 'createRecording').mockReturnValueOnce(of());
    const { user } = renderWithServiceContextAndReduxStore(<AutomatedAnalysisCard dashboardId={0} span={0} />, {
      preloadState: preloadedState,
    });

    const requestSpy = jest.spyOn(defaultServices.api, 'createRecording');

    expect(screen.getByText(testT('AutomatedAnalysisCard.ERROR_TITLE'))).toBeInTheDocument(); // Error view
    expect(screen.getByText(NO_RECORDINGS_MESSAGE)).toBeInTheDocument(); // Error message
    expect(screen.getByText(testT('AutomatedAnalysisCard.ERROR_TEXT'))).toBeInTheDocument(); // Error details
    expect(screen.queryByLabelText(testT('AutomatedAnalysisCard.TOOLBAR.LABEL'))).not.toBeInTheDocument(); // Toolbar

    await user.click(
      screen.getByRole('button', { name: testT('AutomatedAnalysisConfigDrawer.INPUT_GROUP.CREATE_RECORDING.LABEL') })
    );

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toBeCalledWith(
      automatedAnalysisConfigToRecordingAttributes(defaultAutomatedAnalysisRecordingConfig)
    );
  });

  it('renders active recording analysis', async () => {
    jest.spyOn(defaultServices.api, 'graphql').mockReturnValueOnce(of(mockActiveRecordingsResponse));

    jest.spyOn(defaultServices.reports, 'reportJson').mockReturnValueOnce(of(mockEvaluations));
    renderWithServiceContextAndReduxStore(<AutomatedAnalysisCard dashboardId={0} span={0} />, {
      preloadState: preloadedState,
    });

    expect(screen.getByText(testT('AutomatedAnalysisCard.CARD_TITLE'))).toBeInTheDocument(); // Card title
    expect(screen.getByLabelText('Details')).toBeInTheDocument(); // Expandable content button
    expect(screen.getByText(testT('NAME', { ns: 'common' }))).toBeInTheDocument(); // Default state filter
    const refreshButton = screen.getByRole('button', {
      // Refresh button
      name: testT('AutomatedAnalysisCard.TOOLBAR.REFRESH.LABEL'),
    });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).not.toBeDisabled();
    const deleteButton = screen.getByRole('button', {
      // Delete button
      name: testT('AutomatedAnalysisCard.TOOLBAR.DELETE.LABEL'),
    });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).not.toBeDisabled();
    expect(screen.getByText(testT('AutomatedAnalysisCard.TOOLBAR.CHECKBOX.SHOW_NA.LABEL'))).toBeInTheDocument();
    expect(screen.getByLabelText(testT('AutomatedAnalysisCard.TOOLBAR.LABEL'))).toBeInTheDocument(); // Toolbar

    expect(screen.getByText(`Active report name=${mockRecording.name}`)).toBeInTheDocument(); // Active report name
    expect(screen.queryByText('Most recent data')).not.toBeInTheDocument(); // Last updated text

    expect(
      screen.queryByRole('button', {
        name: testT('AutomatedAnalysisConfigDrawer.INPUT_GROUP.CREATE_RECORDING.LABEL'),
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: testT('AutomatedAnalysisConfigDrawer.INPUT_GROUP.OPEN_SETTINGS.LABEL'),
      })
    ).not.toBeInTheDocument();

    mockEvaluations.forEach((evaluation) => {
      expect(screen.getByText(evaluation.name)).toBeInTheDocument();
      expect(screen.getByText(evaluation.topic)).toBeInTheDocument();
    });
  });

  it('renders archived recording analysis', async () => {
    const mockCurrentDate = new Date('14 Sep 2022 00:00:00 UTC');
    jest.useFakeTimers('modern').setSystemTime(mockCurrentDate);
    jest.spyOn(defaultServices.api, 'graphql').mockReturnValueOnce(of(mockEmptyActiveRecordingsResponse));
    jest.spyOn(defaultServices.reports, 'getCachedAnalysisReport').mockReturnValueOnce(mockEmptyCachedReport);
    jest.spyOn(defaultServices.api, 'graphql').mockReturnValueOnce(of(mockArchivedRecordingsResponse));

    jest.spyOn(defaultServices.reports, 'reportJson').mockReturnValueOnce(of(mockEvaluations));
    renderWithServiceContextAndReduxStore(<AutomatedAnalysisCard dashboardId={0} span={0} />, {
      preloadState: preloadedState,
    });

    expect(screen.getByText(testT('AutomatedAnalysisCard.CARD_TITLE'))).toBeInTheDocument(); // Card title
    expect(screen.getByLabelText('Details')).toBeInTheDocument(); // Expandable content button
    expect(screen.getByText(testT('NAME', { ns: 'common' }))).toBeInTheDocument(); // Default state filter
    const refreshButton = screen.getByRole('button', {
      // Refresh button
      name: testT('AutomatedAnalysisCard.TOOLBAR.REFRESH.LABEL'),
    });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toBeDisabled();
    const deleteButton = screen.getByRole('button', {
      // Delete button
      name: testT('AutomatedAnalysisCard.TOOLBAR.DELETE.LABEL'),
    });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).not.toBeDisabled();
    expect(screen.getByText(testT('AutomatedAnalysisCard.TOOLBAR.CHECKBOX.SHOW_NA.LABEL'))).toBeInTheDocument();
    expect(screen.getByLabelText(testT('AutomatedAnalysisCard.TOOLBAR.LABEL'))).toBeInTheDocument(); // Toolbar

    expect(screen.getByText(`Archived report name=${mockArchivedRecording.name}`)).toBeInTheDocument(); // Archived report name
    expect(
      screen.getByText(testT('AutomatedAnalysisCard.STALE_REPORT.TEXT', { count: 1, units: 'day' }))
    ).toBeInTheDocument(); // Last updated text

    expect(
      screen.getByRole('button', {
        name: testT('AutomatedAnalysisConfigDrawer.INPUT_GROUP.CREATE_RECORDING.LABEL'),
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: testT('AutomatedAnalysisConfigDrawer.INPUT_GROUP.OPEN_SETTINGS.LABEL'),
      })
    ).toBeInTheDocument();

    mockEvaluations.forEach((evaluation) => {
      expect(screen.getByText(evaluation.name)).toBeInTheDocument();
      expect(screen.getByText(evaluation.topic)).toBeInTheDocument();
    });
  });

  it('renders cached recording analysis', async () => {
    const mockCurrentDate = new Date('15 Sep 2022 00:00:00 UTC'); // 2 days after the cached recording
    jest.useFakeTimers('modern').setSystemTime(mockCurrentDate);
    jest.spyOn(defaultServices.api, 'graphql').mockReturnValueOnce(of(mockEmptyActiveRecordingsResponse));
    jest.spyOn(defaultServices.reports, 'getCachedAnalysisReport').mockReturnValueOnce(mockCachedReport);

    // set global filter Score = 0 to render all rules
    const newPreloadedState = {
      ...preloadedState,
      automatedAnalysisFilters: {
        state: {
          targetFilters: [],
          globalFilters: {
            filters: {
              Score: 0,
            },
          },
        },
      },
    };

    renderWithServiceContextAndReduxStore(<AutomatedAnalysisCard dashboardId={0} span={0} />, {
      preloadState: newPreloadedState,
    });

    expect(screen.getByText(testT('AutomatedAnalysisCard.CARD_TITLE'))).toBeInTheDocument(); // Card title
    expect(screen.getByLabelText('Details')).toBeInTheDocument(); // Expandable content button
    expect(screen.getByText(testT('NAME', { ns: 'common' }))).toBeInTheDocument(); // Default state filter
    const refreshButton = screen.getByRole('button', {
      // Refresh button
      name: testT('AutomatedAnalysisCard.TOOLBAR.REFRESH.LABEL'),
    });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toBeDisabled();
    const deleteButton = screen.getByRole('button', {
      // Delete button
      name: testT('AutomatedAnalysisCard.TOOLBAR.DELETE.LABEL'),
    });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).not.toBeDisabled();
    expect(screen.getByText(testT('AutomatedAnalysisCard.TOOLBAR.CHECKBOX.SHOW_NA.LABEL'))).toBeInTheDocument();
    expect(screen.getByLabelText(testT('AutomatedAnalysisCard.TOOLBAR.LABEL'))).toBeInTheDocument(); // Toolbar

    expect(screen.getByText(`Cached report name=${automatedAnalysisRecordingName}`)).toBeInTheDocument(); // Cached report name
    expect(screen.getByText('Most recent data from 2 days ago.')).toBeInTheDocument(); // Last updated text

    expect(
      screen.getByRole('button', {
        name: testT('AutomatedAnalysisConfigDrawer.INPUT_GROUP.CREATE_RECORDING.LABEL'),
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: testT('AutomatedAnalysisConfigDrawer.INPUT_GROUP.OPEN_SETTINGS.LABEL'),
      })
    ).toBeInTheDocument();

    mockCachedReport.report.forEach((evaluation) => {
      expect(screen.getByText(evaluation.name)).toBeInTheDocument();
      expect(screen.getByText(evaluation.topic)).toBeInTheDocument();
    });
  });

  it('filters correctly', async () => {
    jest.spyOn(defaultServices.api, 'graphql').mockReturnValueOnce(of(mockActiveRecordingsResponse));

    jest.spyOn(defaultServices.reports, 'reportJson').mockReturnValueOnce(of(mockFilteredEvaluations));
    const { user } = renderWithServiceContextAndReduxStore(<AutomatedAnalysisCard dashboardId={0} span={0} />, {
      preloadState: preloadedState, // Filter score default = 100
    });

    expect(screen.getByText(mockRuleEvaluation1.name)).toBeInTheDocument(); // Score: 100
    expect(screen.queryByText(mockRuleEvaluation2.name)).not.toBeInTheDocument(); // Score: 0
    expect(screen.queryByText(mockRuleEvaluation3.name)).not.toBeInTheDocument(); // Score: 55
    expect(screen.queryByText(mockNaRuleEvaluation.name)).not.toBeInTheDocument(); // Score: -1

    const showNAScores = screen.getByRole('checkbox', {
      name: testT('AutomatedAnalysisCard.TOOLBAR.CHECKBOX.SHOW_NA.LABEL'),
    });

    await user.click(showNAScores);

    expect(screen.getByText(mockRuleEvaluation1.name)).toBeInTheDocument(); // Score: 100
    expect(screen.queryByText(mockRuleEvaluation2.name)).not.toBeInTheDocument(); // Score: 0
    expect(screen.queryByText(mockRuleEvaluation3.name)).not.toBeInTheDocument(); // Score: 55
    expect(screen.queryByText(mockNaRuleEvaluation.name)).toBeInTheDocument(); // Score: -1

    const spinner = screen.getByRole('spinbutton', {
      name: /slider value input/i,
    });

    await user.clear(spinner);
    await waitFor(() => expect(spinner).toHaveValue(0));
    await user.click(spinner);
    await user.keyboard('{Enter}');

    mockFilteredEvaluations.forEach((evaluation) => {
      // all rules
      expect(screen.getByText(evaluation.name)).toBeInTheDocument();
      expect(screen.getByText(evaluation.topic)).toBeInTheDocument();
    });

    const nameFilter = screen.getByRole('button', { name: 'Name' });
    await user.click(nameFilter);

    const topic = screen.getByRole('menuitem', { name: /topic/i });
    await user.click(topic);

    const filterByTopic = screen.getByRole('textbox', { name: /filter by topic\.\.\./i });

    await user.type(filterByTopic, 'fakeTopic');
    await user.click(screen.getByRole('option', { name: /faketopic/i }));

    mockFilteredEvaluations
      .filter((evaluation) => evaluation.topic == 'fakeTopic')
      .forEach((evaluation) => {
        // all rules
        expect(screen.getByText(evaluation.name)).toBeInTheDocument();
      });

    expect(screen.queryByText(mockRuleEvaluation1.name)).not.toBeInTheDocument(); // Score: 100
  });

  it('renders list view correctly', async () => {
    jest.spyOn(defaultServices.api, 'graphql').mockReturnValueOnce(of(mockActiveRecordingsResponse));
    jest.spyOn(defaultServices.reports, 'reportJson').mockReturnValueOnce(of(mockFilteredEvaluations));
    const { user } = renderWithServiceContextAndReduxStore(<AutomatedAnalysisCard dashboardId={0} span={0} />, {
      preloadState: preloadedState, // Filter score default = 100
    });

    const listViewSwitch = screen.getByRole('checkbox', {
      name: testT('AutomatedAnalysisCard.TOOLBAR.SWITCH.LIST_VIEW.LABEL'),
    });
    expect(listViewSwitch).toBeInTheDocument();

    expect(screen.queryByText('AutomatedAnalysisCardList')).not.toBeInTheDocument(); // Mocked list view

    await user.click(listViewSwitch);

    expect(screen.getByText('AutomatedAnalysisCardList')).toBeInTheDocument();
  });
});
