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
import { LoadingPropsType } from '@app/Shared/ProgressIndicator';
import { ActionGroup, Button, Form, FormGroup, TextInput } from '@patternfly/react-core';
import * as React from 'react';

export interface AuthCredential {
  username: string;
  password: string;
}

export interface CredentialAuthFormProps {
  onDismiss: () => void;
  onSave: (username: string, password: string) => void;
  focus?: boolean;
  loading?: boolean;
  isDisabled?: boolean;
  children?: React.ReactNode;
  onCredentialChange?: (credential: AuthCredential) => void;
}

export const CredentialAuthForm: React.FC<CredentialAuthFormProps> = ({
  onDismiss,
  onSave,
  onCredentialChange,
  loading,
  isDisabled,
  focus,
  children,
  ...props
}) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSave = React.useCallback(() => {
    onSave(username, password);
  }, [onSave, username, password]);

  const handleDismiss = React.useCallback(() => {
    // Do not set state as form is unmounted after cancel
    onDismiss();
  }, [onDismiss]);

  const handleKeyUp = React.useCallback(
    (event: React.KeyboardEvent): void => {
      if (event.code === 'Enter' && username !== '' && password !== '') {
        handleSave();
      }
    },
    [handleSave, username, password]
  );

  const saveButtonLoadingProps = React.useMemo(
    () =>
      ({
        spinnerAriaValueText: 'Saving',
        spinnerAriaLabel: 'saving-credentials',
        isLoading: loading,
      } as LoadingPropsType),
    [loading]
  );

  return (
    <Form {...props}>
      {children}
      <FormGroup isRequired label="Username" fieldId="username">
        <TextInput
          value={username}
          isDisabled={isDisabled || loading}
          isRequired
          type="text"
          id="username"
          onChange={(v) => {
            setUsername(v);
            onCredentialChange &&
              onCredentialChange({
                username: v,
                password: password,
              });
          }}
          onKeyUp={handleKeyUp}
          autoFocus={focus}
        />
      </FormGroup>
      <FormGroup isRequired label="Password" fieldId="password">
        <TextInput
          value={password}
          isDisabled={isDisabled || loading}
          isRequired
          type="password"
          id="password"
          onChange={(v) => {
            setPassword(v);
            onCredentialChange &&
              onCredentialChange({
                username: username,
                password: v,
              });
          }}
          onKeyUp={handleKeyUp}
        />
      </FormGroup>
      <ActionGroup>
        <Button
          variant="primary"
          onClick={handleSave}
          {...saveButtonLoadingProps}
          isDisabled={isDisabled || loading || username === '' || password === ''}
        >
          {loading ? 'Saving' : 'Save'}
        </Button>
        <Button variant="secondary" onClick={handleDismiss} isDisabled={isDisabled || loading}>
          Cancel
        </Button>
      </ActionGroup>
    </Form>
  );
};
