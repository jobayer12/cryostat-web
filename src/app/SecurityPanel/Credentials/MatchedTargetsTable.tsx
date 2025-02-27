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
import { LoadingView } from '@app/LoadingView/LoadingView';
import { NotificationCategory } from '@app/Shared/Services/NotificationChannel.service';
import { ServiceContext } from '@app/Shared/Services/Services';
import { Target } from '@app/Shared/Services/Target.service';
import { TargetDiscoveryEvent } from '@app/Shared/Services/Targets.service';
import { useSort } from '@app/utils/useSort';
import { useSubscriptions } from '@app/utils/useSubscriptions';
import { TableColumn, sortResources } from '@app/utils/utils';
import { EmptyState, EmptyStateIcon, Title } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import {
  InnerScrollContainer,
  SortByDirection,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import _ from 'lodash';
import * as React from 'react';

export interface MatchedTargetsTableProps {
  id: number;
  matchExpression: string;
}

const tableColumns: TableColumn[] = [
  {
    title: 'Target',
    keyPaths: ['alias'],
    transform: (_alias: string, target: Target) => {
      return target.alias === target.connectUrl || !target.alias
        ? `${target.connectUrl}`
        : `${target.alias} (${target.connectUrl})`;
    },
    sortable: true,
  },
];

export const MatchedTargetsTable: React.FunctionComponent<MatchedTargetsTableProps> = ({ id, matchExpression }) => {
  const context = React.useContext(ServiceContext);

  const [targets, setTargets] = React.useState([] as Target[]);
  const [sortBy, getSortParams] = useSort();
  const [isLoading, setIsLoading] = React.useState(false);
  const addSubscription = useSubscriptions();

  const refreshTargetsList = React.useCallback(() => {
    setIsLoading(true);
    addSubscription(
      context.api.getCredential(id).subscribe((v) => {
        setTargets(v.targets);
        setIsLoading(false);
      })
    );
  }, [addSubscription, setIsLoading, context.api, setTargets, id]);

  React.useEffect(() => {
    refreshTargetsList();
  }, [refreshTargetsList]);

  React.useEffect(() => {
    addSubscription(
      context.notificationChannel.messages(NotificationCategory.TargetJvmDiscovery).subscribe((v) => {
        const evt: TargetDiscoveryEvent = v.message.event;
        const target: Target = evt.serviceRef;
        if (evt.kind === 'FOUND') {
          const match: boolean = eval(matchExpression);
          if (match) {
            setTargets((old) => old.concat(target));
          }
        } else if (evt.kind === 'LOST') {
          setTargets((old) => old.filter((o) => !_.isEqual(o, target)));
        }
      })
    );
  }, [addSubscription, context, context.notificationChannel, setTargets, matchExpression]);

  const targetRows = React.useMemo(() => {
    return sortResources(
      {
        index: sortBy.index ?? 0,
        direction: sortBy.direction ?? SortByDirection.asc,
      },
      targets,
      tableColumns
    ).map((target, idx) => {
      return (
        <Tr key={`target-${idx}`}>
          <Td key={`target-table-row-${idx}_0`}>
            {target.alias == target.connectUrl || !target.alias
              ? `${target.connectUrl}`
              : `${target.alias} (${target.connectUrl})`}
          </Td>
        </Tr>
      );
    });
  }, [targets, sortBy]);

  let view: JSX.Element;
  if (isLoading) {
    view = <LoadingView />;
  } else if (targets.length === 0) {
    view = (
      <>
        <EmptyState>
          <EmptyStateIcon icon={SearchIcon} />
          <Title headingLevel="h4" size="lg">
            No Targets
          </Title>
        </EmptyState>
      </>
    );
  } else {
    view = (
      <>
        <InnerScrollContainer style={{ maxHeight: '24em' }}>
          <TableComposable aria-label="matched-targets-table" isStickyHeader={true} variant={'compact'}>
            <Thead>
              <Tr>
                {tableColumns.map(({ title }, index) => (
                  <Th key={`table-header-${title}`} sort={getSortParams(index)}>
                    {title}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>{targetRows}</Tbody>
          </TableComposable>
        </InnerScrollContainer>
      </>
    );
  }

  return <>{view}</>;
};
