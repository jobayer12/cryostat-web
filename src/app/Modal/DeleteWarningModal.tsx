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
import { portalRoot } from '@app/utils/utils';
import { Modal, ModalVariant, Button, Checkbox, Stack, Split } from '@patternfly/react-core';
import * as React from 'react';
import { useState } from 'react';
import { DeleteOrDisableWarningType, getFromWarningMap } from './DeleteWarningUtils';

export interface DeleteWarningProps {
  warningType: DeleteOrDisableWarningType;
  visible: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export const DeleteWarningModal = ({ onAccept, onClose, ...props }: DeleteWarningProps): JSX.Element => {
  const context = React.useContext(ServiceContext);
  const [doNotAsk, setDoNotAsk] = useState(false);

  const realWarningType = getFromWarningMap(props.warningType);

  const onAcceptClose = React.useCallback(
    (ev: React.MouseEvent) => {
      ev.stopPropagation();
      onAccept();
      onClose();
      if (doNotAsk && !!realWarningType) {
        context.settings.setDeletionDialogsEnabledFor(realWarningType.id, false);
      }
    },
    [context.settings, onAccept, onClose, doNotAsk, realWarningType]
  );

  const onInnerClose = React.useCallback(
    (ev?: React.MouseEvent) => {
      ev && ev.stopPropagation();
      onClose();
    },
    [onClose]
  );

  return (
    <Modal
      appendTo={portalRoot}
      title={`${realWarningType?.title}`}
      description={realWarningType?.description}
      aria-label={realWarningType?.ariaLabel}
      titleIconVariant="warning"
      variant={ModalVariant.medium}
      isOpen={props.visible}
      showClose
      onClose={onInnerClose}
      actions={[
        <Stack hasGutter key="modal-footer-stack">
          <Split key="modal-footer-split">
            <Button variant="danger" onClick={onAcceptClose}>
              Delete
            </Button>
            <Button variant="link" onClick={onInnerClose}>
              Cancel
            </Button>
          </Split>
        </Stack>,
      ]}
    >
      <Checkbox id="do-not-ask-enabled" label="Don't ask me again" isChecked={doNotAsk} onChange={setDoNotAsk} />
    </Modal>
  );
};
