"use strict";

import { loadClerk } from './auth.js?v=2.0.0';
import { start, showFatalAuthError } from './app.js?v=2.0.0';

loadClerk()
  .then(start)
  .catch((error) => {
    console.error('فشل تحميل Clerk:', error);
    showFatalAuthError();
  });
