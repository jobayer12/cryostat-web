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
import i18n from '@app/../i18n/config';
import { About } from '@app/About/About';
import { ThemeSetting } from '@app/Settings/SettingsUtils';
import { defaultServices } from '@app/Shared/Services/Services';
import { cleanup, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import renderer, { act } from 'react-test-renderer';
import { of } from 'rxjs';
import { mockMediaQueryList, renderDefault, testT } from '../Common';
jest.mock('@app/BreadcrumbPage/BreadcrumbPage', () => {
  return {
    BreadcrumbPage: jest.fn((props) => {
      return (
        <div>
          {props.pageTitle}
          {props.children}
        </div>
      );
    }),
  };
});

jest.spyOn(defaultServices.settings, 'themeSetting').mockReturnValue(of(ThemeSetting.DARK));
jest.spyOn(defaultServices.settings, 'media').mockReturnValue(of(mockMediaQueryList));

jest.mock('@app/About/AboutDescription', () => {
  return {
    ...jest.requireActual('@app/About/AboutDescription'),
    AboutDescription: jest.fn(() => {
      return <div>AboutDescription</div>;
    }),
  };
});

describe('<About />', () => {
  afterEach(cleanup);

  it('renders correctly', async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<About />);
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('contains the correct information', async () => {
    renderDefault(
      <I18nextProvider i18n={i18n}>
        <About />
      </I18nextProvider>
    );

    expect(screen.getByText('About')).toBeInTheDocument();
    const logo = screen.getByRole('img');
    expect(logo).toHaveClass('pf-c-brand cryostat-logo');
    expect(logo).toHaveAttribute('alt', 'Cryostat');
    expect(logo).toHaveAttribute('src', 'test-file-stub');
    expect(screen.getByText(testT('CRYOSTAT_TRADEMARK', { ns: 'common' }))).toBeInTheDocument();
  });
});
