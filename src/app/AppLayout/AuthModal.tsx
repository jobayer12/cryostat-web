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
import { NO_TARGET, Target } from '@app/Shared/Services/Target.service';
import { useSubscriptions } from '@app/utils/useSubscriptions';
import { Modal, ModalVariant, Text } from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Observable, filter, first, map, mergeMap } from 'rxjs';
import { CredentialAuthForm } from './CredentialAuthForm';

export interface AuthModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: () => void;
  targetObs: Observable<Target>;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onDismiss, onSave: onPropsSave, targetObs, ...props }) => {
  const context = React.useContext(ServiceContext);
  const [loading, setLoading] = React.useState(false);
  const addSubscription = useSubscriptions();

  const onSave = React.useCallback(
    (username: string, password: string) => {
      setLoading(true);
      addSubscription(
        targetObs
          .pipe(
            filter((target) => target !== NO_TARGET),
            first(),
            map((target) => target.connectUrl),
            mergeMap((connectUrl) => context.authCredentials.setCredential(connectUrl, username, password))
          )
          .subscribe((ok) => {
            setLoading(false);
            if (ok) {
              onPropsSave();
            }
          })
      );
    },
    [addSubscription, context.authCredentials, targetObs, setLoading, onPropsSave]
  );

  return (
    <Modal
      isOpen={props.visible}
      variant={ModalVariant.large}
      showClose={!loading}
      onClose={onDismiss}
      title="Authentication Required"
      description={
        <Text>
          This target JVM requires authentication. The credentials you provide here will be passed from Cryostat to the
          target when establishing JMX connections. Enter credentials specific to this target, or go to{' '}
          <Link onClick={onDismiss} to="/security">
            Security
          </Link>{' '}
          to add a credential matching multiple targets. Visit{' '}
          <Link onClick={onDismiss} to="/settings">
            Settings
          </Link>{' '}
          to confirm and configure whether these credentials will be held only for this browser session or stored
          encrypted in the Cryostat backend.
        </Text>
      }
    >
      <CredentialAuthForm onSave={onSave} onDismiss={onDismiss} focus={true} loading={loading} />
    </Modal>
  );
};
