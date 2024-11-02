// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_parallel_loa.sql';
import m0001 from './0001_goofy_gamora.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001
    }
  }
  