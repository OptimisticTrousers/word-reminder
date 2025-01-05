/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  testTimeout: 40000,
  // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
  // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
  "^.+\\.tsx?$": [
    "ts-jest",
    {
      isolatedModules: true,
    },
  ],
};
