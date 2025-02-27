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
import { authFailMessage, ErrorView, isAuthFail } from '@app/ErrorView/ErrorView';
import { LoadingView } from '@app/LoadingView/LoadingView';
import { DeleteWarningModal } from '@app/Modal/DeleteWarningModal';
import { DeleteOrDisableWarningType } from '@app/Modal/DeleteWarningUtils';
import { LoadingPropsType } from '@app/Shared/ProgressIndicator';
import { EventProbe } from '@app/Shared/Services/Api.service';
import { NotificationCategory } from '@app/Shared/Services/NotificationChannel.service';
import { ServiceContext } from '@app/Shared/Services/Services';
import { useSubscriptions } from '@app/utils/useSubscriptions';
import { sortResources, TableColumn } from '@app/utils/utils';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  TextInput,
  Stack,
  StackItem,
  EmptyState,
  EmptyStateIcon,
  Title,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import {
  TableVariant,
  ISortBy,
  SortByDirection,
  ThProps,
  TableComposable,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
} from '@patternfly/react-table';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { AboutAgentCard } from './AboutAgentCard';

export type LiveProbeActions = 'REMOVE';

const tableColumns: TableColumn[] = [
  {
    title: 'ID',
    keyPaths: ['id'],
    sortable: true,
  },
  {
    title: 'Name',
    keyPaths: ['name'],
    sortable: true,
  },
  {
    title: 'Class',
    keyPaths: ['clazz'],
    sortable: true,
  },
  {
    title: 'Description',
    keyPaths: ['description'],
    sortable: true,
  },
  {
    title: 'Method',
    keyPaths: ['methodName'],
    sortable: true,
  },
];

export interface AgentLiveProbesProps {}

export const AgentLiveProbes: React.FC<AgentLiveProbesProps> = (_) => {
  const context = React.useContext(ServiceContext);
  const addSubscription = useSubscriptions();

  const [probes, setProbes] = React.useState([] as EventProbe[]);
  const [filteredProbes, setFilteredProbes] = React.useState([] as EventProbe[]);
  const [filterText, setFilterText] = React.useState('');
  const [sortBy, setSortBy] = React.useState({} as ISortBy);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [warningModalOpen, setWarningModalOpen] = React.useState(false);
  const [actionLoadings, setActionLoadings] = React.useState<Record<LiveProbeActions, boolean>>({ REMOVE: false });

  const getSortParams = React.useCallback(
    (columnIndex: number): ThProps['sort'] => ({
      sortBy: sortBy,
      onSort: (_event, index, direction) => {
        setSortBy({
          index: index,
          direction: direction,
        });
      },
      columnIndex,
    }),
    [sortBy, setSortBy]
  );

  const handleProbes = React.useCallback(
    (probes) => {
      setProbes(probes);
      setErrorMessage('');
      setIsLoading(false);
    },
    [setProbes, setIsLoading, setErrorMessage]
  );

  const handleError = React.useCallback(
    (error) => {
      setErrorMessage(error.message);
      setIsLoading(false);
    },
    [setIsLoading, setErrorMessage]
  );

  const refreshProbes = React.useCallback(() => {
    setIsLoading(true);
    addSubscription(
      context.api.getActiveProbes(true).subscribe({
        next: (value) => handleProbes(value),
        error: (err) => handleError(err),
      })
    );
  }, [addSubscription, context.api, setIsLoading, handleProbes, handleError]);

  const authRetry = React.useCallback(() => {
    context.target.setAuthRetry();
  }, [context.target]);

  const handleDeleteAllProbes = React.useCallback(() => {
    setActionLoadings((old) => {
      return {
        ...old,
        REMOVE: true,
      };
    });
    addSubscription(
      context.api.removeProbes().subscribe(() => {
        setActionLoadings((old) => {
          return {
            ...old,
            REMOVE: false,
          };
        });
      })
    );
  }, [addSubscription, context.api, setActionLoadings]);

  const handleWarningModalAccept = React.useCallback(() => handleDeleteAllProbes(), [handleDeleteAllProbes]);

  const handleWarningModalClose = React.useCallback(() => {
    setWarningModalOpen(false);
  }, [setWarningModalOpen]);

  const handleDeleteButton = React.useCallback(() => {
    if (context.settings.deletionDialogsEnabledFor(DeleteOrDisableWarningType.DeleteActiveProbes)) {
      setWarningModalOpen(true);
    } else {
      handleDeleteAllProbes();
    }
  }, [context.settings, setWarningModalOpen, handleDeleteAllProbes]);

  React.useEffect(() => {
    addSubscription(
      context.target.target().subscribe(() => {
        setFilterText('');
        refreshProbes();
      })
    );
  }, [context, context.target, addSubscription, setFilterText, refreshProbes]);

  React.useEffect(() => {
    if (!context.settings.autoRefreshEnabled()) {
      return;
    }
    const id = window.setInterval(
      () => refreshProbes(),
      context.settings.autoRefreshPeriod() * context.settings.autoRefreshUnits()
    );
    return () => window.clearInterval(id);
  }, [context.settings, refreshProbes]);

  React.useEffect(() => {
    addSubscription(
      context.target.authFailure().subscribe(() => {
        setErrorMessage(authFailMessage);
      })
    );
  }, [addSubscription, context.target, setErrorMessage]);

  React.useEffect(() => {
    addSubscription(
      combineLatest([
        context.target.target(),
        context.notificationChannel.messages(NotificationCategory.ProbeTemplateApplied),
      ]).subscribe(([currentTarget, e]) => {
        if (currentTarget.connectUrl != e.message.targetId) {
          return;
        }
        setProbes((old) => {
          const probes = e.message.events as EventProbe[];
          const probeIds = probes.map((p) => p.id);
          if (probes?.length > 0) {
            return [...old.filter((probe) => !probeIds.includes(probe.id)), ...probes];
          }
          return old;
        });
      })
    );
  }, [addSubscription, context, context.notificationChannel, context.target, setProbes]);

  React.useEffect(() => {
    addSubscription(
      context.notificationChannel.messages(NotificationCategory.ProbesRemoved).subscribe((_) => setProbes([]))
    );
  }, [addSubscription, context, context.notificationChannel, setProbes]);

  React.useEffect(() => {
    let filtered: EventProbe[];
    if (!filterText) {
      filtered = probes;
    } else {
      const ft = filterText.trim().toLowerCase();
      filtered = probes.filter(
        (t: EventProbe) =>
          t.name.toLowerCase().includes(ft) ||
          t.description.toLowerCase().includes(ft) ||
          t.clazz.toLowerCase().includes(ft) ||
          t.methodDescriptor.toLowerCase().includes(ft) ||
          t.methodName.toLowerCase().includes(ft)
      );
    }

    setFilteredProbes(
      sortResources(
        {
          index: sortBy.index ?? 0,
          direction: sortBy.direction ?? SortByDirection.asc,
        },
        filtered,
        tableColumns
      )
    );
  }, [filterText, probes, sortBy, setFilteredProbes]);

  const probeRows = React.useMemo(
    () =>
      filteredProbes.map((t: EventProbe, index) => (
        <Tr key={`active-probe-${index}`}>
          <Td key={`active-probe-id-${index}`} dataLabel={tableColumns[0].title}>
            {t.id}
          </Td>
          <Td key={`active-probe-name-${index}`} dataLabel={tableColumns[1].title}>
            {t.name}
          </Td>
          <Td key={`active-probe-clazz-${index}`} dataLabel={tableColumns[2].title}>
            {t.clazz}
          </Td>
          <Td key={`active-probe-description-${index}`} dataLabel={tableColumns[3].title}>
            {t.description}
          </Td>
          <Td key={`active-probe-methodname-${index}`} dataLabel={tableColumns[4].title}>
            {t.methodName}
          </Td>
        </Tr>
      )),
    [filteredProbes]
  );

  const actionLoadingProps = React.useMemo<Record<LiveProbeActions, LoadingPropsType>>(
    () => ({
      REMOVE: {
        spinnerAriaValueText: 'Removing',
        spinnerAriaLabel: 'removing-all-probes',
        isLoading: actionLoadings['REMOVE'],
      } as LoadingPropsType,
    }),
    [actionLoadings]
  );

  if (errorMessage != '') {
    return (
      <ErrorView
        title={'Error retrieving active probes'}
        message={`${errorMessage}. Note: This error is generally caused when the agent is not loaded or is not active. Check that the target was started with the agent (-javaagent:/path/to/agent.jar).`}
        retry={isAuthFail(errorMessage) ? authRetry : undefined}
      />
    );
  } else if (isLoading) {
    return <LoadingView />;
  } else {
    return (
      <>
        <Stack hasGutter style={{ marginTop: '1em' }}>
          <StackItem>
            <AboutAgentCard />
          </StackItem>
          <StackItem>
            <Toolbar id="active-probes-toolbar">
              <ToolbarContent>
                <ToolbarGroup variant="filter-group">
                  <ToolbarItem>
                    <TextInput
                      name="activeProbeFilter"
                      id="activeProbeFilter"
                      type="search"
                      placeholder="Filter..."
                      aria-label="Active probe filter"
                      onChange={setFilterText}
                    />
                  </ToolbarItem>
                </ToolbarGroup>
                <ToolbarGroup variant="icon-button-group">
                  <ToolbarItem>
                    <Button
                      key="delete"
                      variant="danger"
                      onClick={handleDeleteButton}
                      isDisabled={!filteredProbes.length || actionLoadings['REMOVE']}
                      {...actionLoadingProps['REMOVE']}
                    >
                      {actionLoadings['REMOVE'] ? 'Removing' : 'Remove'} All Probes
                    </Button>
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
              <DeleteWarningModal
                warningType={DeleteOrDisableWarningType.DeleteActiveProbes}
                visible={warningModalOpen}
                onAccept={handleWarningModalAccept}
                onClose={handleWarningModalClose}
              />
            </Toolbar>
            {probeRows.length ? (
              <TableComposable aria-label="Active Probe Table" variant={TableVariant.compact}>
                <Thead>
                  <Tr>
                    {tableColumns.map(({ title, sortable }, index) => (
                      <Th key={`active-probe-header-${title}`} sort={sortable ? getSortParams(index) : undefined}>
                        {title}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>{probeRows}</Tbody>
              </TableComposable>
            ) : (
              <EmptyState>
                <EmptyStateIcon icon={SearchIcon} />
                <Title headingLevel="h4" size="lg">
                  No Active Probes
                </Title>
              </EmptyState>
            )}
          </StackItem>
        </Stack>
      </>
    );
  }
};
