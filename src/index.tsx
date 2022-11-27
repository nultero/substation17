/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import FrontPage from './FrontPage';

render(() => <FrontPage />, document.getElementById('root') as HTMLElement);