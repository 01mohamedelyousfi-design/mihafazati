"use strict";

import { loadClerk } from './auth.js';
import { start, showFatalAuthError } from './app.js';

loadClerk()
  .then(start)
  .catch((error) => {
    console.error('فشل تحميل Clerk:', error);
    showFatalAuthError();
  });
