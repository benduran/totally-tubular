import { Tubular } from './src/totally-tubular.js';
import type { AllObjectKeys } from './src/types.js';

const THOUSAND = 1e3 as const;
const TEN_THOUSAND = 1e4 as const;
const ONE_HUNDRED_THOUSAND = 1e5 as const;
const ONE_MILLION = 1e6 as const;

function startPerf() {
  const start = performance.now();

  return function endPerf() {
    const delta = performance.now() - start;
    return {
      millis: delta,
      seconds: delta / 1000,
    };
  };
}

interface ShallowState {
  count: number;
  name: string;
  isActive: boolean;
}

// Medium Depth: Introducing nested objects and arrays.

// User-related interfaces.
export interface UserSettings {
  theme: string;
  language: string;
}

export interface User {
  id: number;
  name: string;
  settings: UserSettings;
}

// Notification interface.
export interface Notification {
  messages: string[];
  count: number;
}

// Interfaces for posts and comments.
export interface PostComment {
  user: string;
  text: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  comments: PostComment[];
}

// Medium state combining several aspects.
export interface MediumState {
  user: User;
  notifications: Notification;
  posts: Post[];
}

export const mediumData: MediumState = {
  user: {
    id: 1001,
    name: 'Alice',
    settings: {
      theme: 'dark',
      language: 'en',
    },
  },
  notifications: {
    messages: ['Welcome!', 'You have new notifications'],
    count: 2,
  },
  posts: [
    {
      id: 201,
      title: 'First Post',
      content: 'This is the content of the first post.',
      comments: [
        { user: 'Bob', text: 'Nice post!' },
        { user: 'Carol', text: 'I enjoyed reading this.' },
      ],
    },
    {
      id: 202,
      title: 'Second Post',
      content: 'More updates here.',
      comments: [],
    },
  ],
};

const initialShallowData: ShallowState = {
  count: 42,
  name: 'Shallow Benchmark',
  isActive: true,
};

// Deep State: A complex, deeply nested state with recursive elements.

// Geo and Address
export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  city: string;
  zipCode: string;
  geo: GeoCoordinates;
}

// Contact and personal info for a user.
export interface ContactInfo {
  email: string;
  phone: string;
  address: Address;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  age: number;
}

export interface Profile {
  personal: PersonalInfo;
  contact: ContactInfo;
  preferences: {
    notifications: boolean;
    language: string;
  };
}

// Deep user info.
export interface UserDeep {
  id: string;
  profile: Profile;
  roles: string[];
  metadata: {
    lastLogin: Date;
    isActive: boolean;
    tags: string[];
  };
}

// Module configuration with recursion.
export interface ConfigVariable {
  key: string;
  value: string | number | boolean;
}

export interface ModuleConfig {
  moduleName: string;
  settings: {
    environment: string;
    version: string;
    variables: ConfigVariable[];
  };
  subModules: ModuleConfig[]; // Allows recursive nesting for deeper structures.
}

// The overall Deep state.
export interface DeepState {
  users: UserDeep[];
  system: {
    name: string;
    modules: ModuleConfig[];
    performance: {
      load: number;
      uptime: number;
    };
  };
  logs: Array<{
    id: string;
    message: string;
    details: {
      code: number;
      context: { [key: string]: any };
    };
  }>;
}

export const deepData: DeepState = {
  users: [
    {
      id: 'user-1',
      profile: {
        personal: {
          firstName: 'John',
          lastName: 'Doe',
          age: 30,
        },
        contact: {
          email: 'john.doe@example.com',
          phone: '555-1234',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            zipCode: '12345',
            geo: {
              lat: 40.7128,
              lng: -74.006,
            },
          },
        },
        preferences: {
          notifications: true,
          language: 'en',
        },
      },
      roles: ['admin', 'user'],
      metadata: {
        lastLogin: new Date('2025-01-01T10:00:00Z'),
        isActive: true,
        tags: ['verified', 'premium'],
      },
    },
    {
      id: 'user-2',
      profile: {
        personal: {
          firstName: 'Jane',
          lastName: 'Smith',
          age: 28,
        },
        contact: {
          email: 'jane.smith@example.com',
          phone: '555-5678',
          address: {
            street: '456 Side St',
            city: 'Othertown',
            zipCode: '67890',
            geo: {
              lat: 34.0522,
              lng: -118.2437,
            },
          },
        },
        preferences: {
          notifications: false,
          language: 'es',
        },
      },
      roles: ['user'],
      metadata: {
        lastLogin: new Date('2025-05-10T14:30:00Z'),
        isActive: false,
        tags: ['guest'],
      },
    },
  ],
  system: {
    name: 'Deep Benchmark System',
    modules: [
      {
        moduleName: 'Auth',
        settings: {
          environment: 'production',
          version: '1.2.3',
          variables: [
            { key: 'maxRetries', value: 5 },
            { key: 'enable2FA', value: true },
          ],
        },
        subModules: [
          {
            moduleName: 'OAuth',
            settings: {
              environment: 'production',
              version: '1.0.0',
              variables: [
                { key: 'clientId', value: 'abc123' },
                { key: 'clientSecret', value: 'secret' },
              ],
            },
            subModules: [], // No further nesting.
          },
        ],
      },
      {
        moduleName: 'Payment',
        settings: {
          environment: 'production',
          version: '2.4.0',
          variables: [
            { key: 'currency', value: 'USD' },
            { key: 'timeout', value: 30 },
          ],
        },
        subModules: [],
      },
      // Additional modules could be added here for even larger state benchmarks.
    ],
    performance: {
      load: 0.75,
      uptime: 10234,
    },
  },
  logs: [
    {
      id: 'log1',
      message: 'System started.',
      details: {
        code: 200,
        context: { action: 'start' },
      },
    },
    {
      id: 'log2',
      message: 'User login failed.',
      details: {
        code: 401,
        context: { action: 'login', reason: 'invalid credentials' },
      },
    },
  ],
};

// UltraDeepState: An interface with a deep nested, non-array update path.
export interface UltraDeepState {
  zdeepSettings: {
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              level6: {
                currentValue: string;
              };
            };
          };
        };
      };
    };
  };
  // Additional properties to emulate a realistic state.
  meta: {
    systemName: string;
    version: string;
  };
  logs: { [key: string]: string };
}

// Sample state data that adheres to the UltraDeepState interface.
export const ultraDeepData = {
  meta: {
    systemName: 'Ultra Deep Benchmark System',
    version: '3.0.0',
  },
  logs: {
    start: 'System started',
    init: 'Initialization complete',
  },
  zdeepSettings: {
    a: {},
    b: {},
    c: {},
    d: {},
    e: {},
    f: {},
    g: {},
    h: {},
    i: {},
    j: {},
    k: {},
    l: {},
    m: {},
    n: {},
    o: {},
    p: {},
    q: {},
    r: {},
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              level6: {
                currentValue: 'Ultra Deep Initial Value',
              },
            },
          },
        },
      },
    },
  },
} as UltraDeepState;

function runPerfTest<T extends object>(
  initialState: T,
  updatePath: AllObjectKeys<T>,
  amt: number,
  numObservers: number,
) {
  const t = new Tubular(initialState);

  for (let i = 0; i < numObservers; i++) {
    t.observe(updatePath as any, () => {});
  }

  const perfTracker = startPerf();

  let v = String(t.read(updatePath));
  for (let i = 0; i < amt; i++) {
    v += `-${i}`;
    // @ts-expect-error - don't care about typings for the perf test
    t.update(updatePath as any, () => v);
  }

  const end = perfTracker();

  console.info(
    `${amt.toLocaleString()} updates to "${String(updatePath)}" string val with ${numObservers} observers: ${end.seconds}s`,
  );

  return end;
}

function runAllPerfTests() {
  console.info('-----shallow state object-----');
  console.info('');

  runPerfTest<ShallowState>(initialShallowData, 'name', THOUSAND, 10);
  runPerfTest<ShallowState>(initialShallowData, 'name', THOUSAND, 100);
  runPerfTest<ShallowState>(initialShallowData, 'name', THOUSAND, THOUSAND);
  runPerfTest<ShallowState>(initialShallowData, 'name', TEN_THOUSAND, 10);
  runPerfTest<ShallowState>(initialShallowData, 'name', TEN_THOUSAND, 100);
  runPerfTest<ShallowState>(initialShallowData, 'name', TEN_THOUSAND, THOUSAND);
  runPerfTest<ShallowState>(initialShallowData, 'name', ONE_HUNDRED_THOUSAND, 10);
  runPerfTest<ShallowState>(initialShallowData, 'name', ONE_HUNDRED_THOUSAND, 100);
  runPerfTest<ShallowState>(initialShallowData, 'name', ONE_HUNDRED_THOUSAND, THOUSAND);
  runPerfTest<ShallowState>(initialShallowData, 'name', ONE_MILLION, 10);
  runPerfTest<ShallowState>(initialShallowData, 'name', ONE_MILLION, 100);
  runPerfTest<ShallowState>(initialShallowData, 'name', ONE_MILLION, THOUSAND);

  console.info('');
  console.info('-----medium state object-----');
  console.info('');

  runPerfTest<MediumState>(mediumData, 'user.settings.theme', THOUSAND, 10);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', THOUSAND, 100);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', THOUSAND, THOUSAND);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', TEN_THOUSAND, 10);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', TEN_THOUSAND, 100);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', TEN_THOUSAND, THOUSAND);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', ONE_HUNDRED_THOUSAND, 10);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', ONE_HUNDRED_THOUSAND, 100);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', ONE_HUNDRED_THOUSAND, THOUSAND);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', ONE_MILLION, 10);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', ONE_MILLION, 100);
  runPerfTest<MediumState>(mediumData, 'user.settings.theme', ONE_MILLION, THOUSAND);

  console.info('');
  console.info('-----deep state object-----');
  console.info('');

  // This is the long, non-array update path we want to test.
  // The target property is:
  // deepSettings.level1.level2.level3.level4.level5.level6.currentValue
  const deepUpdatePath = 'zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue';

  // Now we update the performance tests to use our new deep state and update path.
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, THOUSAND, 10);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, THOUSAND, 100);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, THOUSAND, THOUSAND);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, TEN_THOUSAND, 10);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, TEN_THOUSAND, 100);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, TEN_THOUSAND, THOUSAND);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, ONE_HUNDRED_THOUSAND, 10);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, ONE_HUNDRED_THOUSAND, 100);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, ONE_HUNDRED_THOUSAND, THOUSAND);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, ONE_MILLION, 10);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, ONE_MILLION, 100);
  runPerfTest<UltraDeepState>(ultraDeepData, deepUpdatePath, ONE_MILLION, THOUSAND);
}

runAllPerfTests();
