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
import * as React from 'react';

const QuickSearchIcon: React.FC<React.HTMLProps<SVGElement>> = ({ style }) => {
  return (
    <svg
      viewBox="0 0 80 80"
      aria-hidden="true"
      fill="currentColor"
      width="2em"
      height="2em"
      style={{ verticalAlign: 'middle', ...style }}
      className={'quick-search-icon'}
    >
      <style>{'.prefix__st0{display:none}.prefix__st2,.prefix__st3{fill-rule:evenodd;clip-rule:evenodd}'}</style>
      <g id="prefix__Layer_1" className="prefix__st0">
        <path
          className="prefix__st2"
          d="M31.79 18.48v.04c.01-.01.01-.02 0-.04zM11.5 59.22c-4.19.38-6.94 5.22-6.94 5.22V9.73C0 9.87 0 14.01 0 14.01v50.74c.19 5.42 6.84 4.13 6.84 4.13 6.84-9.65 25.09.14 25.09.14v-4.45c-7.84-5.09-15.11-5.95-20.43-5.35zm11.36-3.09c3.34.58 6.91 3.28 8.92 3.76v-4.55H31.5h.29V18.49l.01-3.62s-.01 0-.01-.01v-.5C24.35 9.56 14.7 6.3 9.12 5.26v50.59c4.09-1.13 7.5-.83 13.74.28zm13.77-37.65c-.01.02-.01.02 0 0zm27.23-8.75v54.71s-2.75-4.83-6.94-5.22c-5.32-.6-12.59.26-20.43 5.36v4.45s18.24-9.79 25.09-.14c0 0 6.66 1.28 6.84-4.13V14.01s0-4.14-4.56-4.28zM36.63 30.47v24.87l.66-.11c-.13.07-.27.11-.41.11h-.24v4.55c2.01-.48 5.59-3.18 8.92-3.76 6.24-1.11 9.65-1.41 13.74-.29V5.26c-5.57 1.04-15.22 4.3-22.66 9.08v.51c0 .01-.01.01-.01.01l.01 3.62-.01 11.99z"
        />
        <circle className="prefix__st3" cx={59.96} cy={56.6} r={13.54} />
        <path
          d="M62.66 67.25h-4.41c-.52 0-.95-.39-.95-.86v-6.63h-7.25c-.52 0-.95-.39-.95-.86v-4.04c0-.48.43-.86.95-.86h7.25v-6.63c0-.48.43-.86.95-.86h4.41c.52 0 .95.39.95.86V54h7.25c.52 0 .95.39.95.86v4.04c0 .48-.43.86-.95.86H63.6v6.63c0 .47-.42.86-.94.86zm-2.21 7.49c10.8 0 19.55-8 19.55-17.87S71.25 39 60.45 39 40.9 47 40.9 56.87s8.75 17.87 19.55 17.87z"
          fillRule="evenodd"
          clipRule="evenodd"
          fill={'#fff'}
        />
      </g>
      <g id="prefix__Layer_2">
        <path
          className="prefix__st3"
          d="M78.95 58.77h-8.08v-7.39c0-.53-.47-.96-1.05-.96H64.9c-.58 0-1.05.43-1.05.96v7.39h-8.08c-.58 0-1.05.43-1.05.96v4.5c0 .53.47.96 1.05.96h8.08v7.39c0 .53.47.96 1.05.96h4.92c.58 0 1.05-.43 1.05-.96v-7.39h8.08c.58 0 1.05-.43 1.05-.96v-4.5c0-.53-.47-.96-1.05-.96z"
        />
        <path
          className="prefix__st2"
          d="M76.23 43.81V14.22s0-4.61-5.08-4.76v32.93c1.78.29 3.48.76 5.08 1.42zM40.81 32.57v27.71l.73-.13a.94.94 0 01-.46.13h-.27v5.07c1.2-.29 2.92-1.29 4.81-2.25-.02-.37-.06-.74-.06-1.11 0-10.6 9.07-19.24 20.5-19.86V4.47c-6.21 1.16-16.96 4.8-25.25 10.12v.57c0 .02-.02.02-.02.02l.02 4.03v13.36zM12.82 64.6c-4.67.43-7.73 5.81-7.73 5.81V9.46C0 9.62 0 14.22 0 14.22v56.54c.21 6.03 7.62 4.61 7.62 4.61 7.62-10.75 27.95.16 27.95.16v-4.95c-8.73-5.69-16.83-6.65-22.75-5.98z"
        />
        <path
          className="prefix__st2"
          d="M25.47 61.15c3.72.65 7.7 3.65 9.94 4.19V19.21l.02-4.03s-.02 0-.02-.02v-.56C27.13 9.27 16.37 5.63 10.16 4.47v56.36c4.56-1.25 8.36-.91 15.31.32zM46.41 67.44c-1.88.83-3.8 1.86-5.76 3.13v4.95s3.46-1.85 8.05-3.28c-.98-1.48-1.75-3.09-2.29-4.8z"
        />
      </g>
    </svg>
  );
};

export default QuickSearchIcon;
