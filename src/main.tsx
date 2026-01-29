import { render } from 'preact';
import { App } from './App';

const root = document.getElementById('app') as HTMLElement | null;
if (root) render(<App />, root);
